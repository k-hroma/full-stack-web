/**
 * Endpoints de escritorxs
 * @module api/writers
 *
 * Estrategia de caché:
 *   getWriters(filters)   → cachea por filtro  (TTL: 5 min)
 *   getWriterById(id)     → cachea por ID      (TTL: 10 min)
 *   searchWriters(term)   → NUNCA cachea
 *   createWriter / updateWriter / deleteWriter → invalidan el prefijo 'writers:'
 */

import { httpClient } from './client';
import { cache, TTL, KEYS } from '../utils/dataCache';
import type {
  CreateWriterInput,
  WriterResponse,
  WritersResponse,
  Writer,
  UpdateWriterInput,
  WriterFilters,
} from '../types/writer';

// ─── Helpers de clave ─────────────────────────────────────────────────────────

function writersListKey(filters?: WriterFilters): string {
  if (!filters || Object.keys(filters).length === 0) {
    return `${KEYS.WRITERS}list:all`;
  }
  const sorted = Object.fromEntries(
    Object.entries(filters).sort(([a], [b]) => a.localeCompare(b))
  );
  return `${KEYS.WRITERS}list:${JSON.stringify(sorted)}`;
}

function writerIdKey(id: string): string {
  return `${KEYS.WRITERS}id:${id}`;
}

// ─── Reads (con caché) ────────────────────────────────────────────────────────

/**
 * Obtiene escritorxs, opcionalmente filtrados por recomended.
 * Cachea 5 minutos por combinación de filtros.
 */
export const getWriters = async (filters?: WriterFilters): Promise<Writer[]> => {
  const key = writersListKey(filters);
  const cached = cache.get<Writer[]>(key);
  if (cached) return cached;

  const params = new URLSearchParams();
  if (filters?.recomended !== undefined) {
    params.append('recomended', String(filters.recomended));
  }
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await httpClient<WritersResponse>(`/writers${query}`);

  cache.set(key, response.data, TTL.LIST);
  return response.data;
};

/**
 * Obtiene un escritorx por ID.
 * Cachea 10 minutos; se invalida al actualizar o eliminar.
 */
export const getWriterById = async (id: string): Promise<Writer> => {
  const key = writerIdKey(id);
  const cached = cache.get<Writer>(key);
  if (cached) return cached;

  const response = await httpClient<WriterResponse>(`/writers/${id}`);
  cache.set(key, response.data, TTL.ITEM);
  return response.data;
};

/**
 * Obtiene escritorxs por categoría.
 * Delega a getWriters → hereda su caché.
 */
export const getWritersByCategory = async (
  category: 'recomended' | 'all',
): Promise<Writer[]> => {
  const filters: WriterFilters = { [category]: true };
  return getWriters(filters);
};

// ─── Búsqueda (SIN caché) ─────────────────────────────────────────────────────

/**
 * Busca escritorxs por término. No se cachea:
 * los resultados deben ser siempre frescos según lo que escribe el usuario.
 */
export const searchWriters = async (term: string): Promise<Writer[]> => {
  const response = await httpClient<WritersResponse>(
    `/writers/search?term=${encodeURIComponent(term)}`,
  );
  return response.data;
};

// ─── Mutaciones (invalidan caché) ─────────────────────────────────────────────

/**
 * Crea un nuevo escritorx (solo admin).
 * Invalida todos los listados del prefijo 'writers:'.
 */
export const createWriter = async (writer: CreateWriterInput): Promise<Writer> => {
  const response = await httpClient<WriterResponse>('/writers', {
    method: 'POST',
    body: JSON.stringify(writer),
  });
  cache.invalidatePrefix(KEYS.WRITERS);
  return response.data;
};

/**
 * Actualiza un escritorx existente (solo admin).
 * Invalida item concreto + todos los listados.
 */
export const updateWriter = async (
  id: string,
  updates: UpdateWriterInput,
): Promise<Writer> => {
  const response = await httpClient<WriterResponse>(`/writers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  cache.invalidatePrefix(KEYS.WRITERS);
  return response.data;
};

/**
 * Elimina un escritorx (solo admin).
 * Invalida todo el prefijo 'writers:'.
 */
export const deleteWriter = async (id: string): Promise<void> => {
  await httpClient(`/writers/${id}`, { method: 'DELETE' });
  cache.invalidatePrefix(KEYS.WRITERS);
};
