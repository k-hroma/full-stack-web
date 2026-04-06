/**
 * dataCache — Caché en memoria con TTL para requests de API
 * @module utils/dataCache
 *
 * Por qué en memoria y no localStorage/sessionStorage:
 * - Los datos del catálogo son frescos por sesión; no necesitan persistir entre visitas.
 * - Evita deserializar JSON en cada lectura.
 * - Se limpia sola al recargar la página (sin riesgo de datos viejos entre deploys).
 *
 * Estrategia aplicada:
 * - Lecturas (getBooks, getWriters, etc.)  → sirven desde caché si no expiró.
 * - Mutaciones (create, update, delete)    → invalidan las entradas relevantes.
 * - Búsquedas                              → NUNCA se cachean (dependen del input del usuario).
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number; // timestamp en ms
}

class DataCache {
  private store = new Map<string, CacheEntry<unknown>>();

  /**
   * Lee una entrada. Devuelve null si no existe o ya expiró.
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }

  /**
   * Guarda una entrada con TTL en milisegundos.
   * @param ttlMs - tiempo de vida en ms (default: 5 minutos)
   */
  set<T>(key: string, data: T, ttlMs = 5 * 60 * 1000): void {
    this.store.set(key, { data, expiresAt: Date.now() + ttlMs });
  }

  /**
   * Elimina una entrada exacta por clave.
   */
  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Elimina todas las entradas cuya clave empiece con el prefijo dado.
   * Útil para invalidar "todo lo relacionado con libros" de un golpe.
   *
   * @example
   *   cache.invalidatePrefix('books:')  // borra books:all, books:id:123, etc.
   */
  invalidatePrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }

  /**
   * Vacía toda la caché. Útil en tests o en logout si querés estado limpio.
   */
  clear(): void {
    this.store.clear();
  }

  /** Solo para debugging — devuelve las claves activas con su tiempo restante. */
  debug(): Record<string, number> {
    const now = Date.now();
    const result: Record<string, number> = {};
    for (const [key, entry] of this.store.entries()) {
      const remaining = entry.expiresAt - now;
      if (remaining > 0) result[key] = Math.round(remaining / 1000);
    }
    return result;
  }
}

// Singleton compartido por toda la app durante la sesión
export const cache = new DataCache();

// ─── TTLs por tipo de dato ────────────────────────────────────────────────────
// Los listados cambian con poca frecuencia; 5 min es un balance razonable.
// Los items individuales se invalidan on-demand cuando el admin los edita.
export const TTL = {
  /** Listados de libros/escritores: 5 minutos */
  LIST:   5 * 60 * 1000,
  /** Items individuales por ID: 10 minutos */
  ITEM:  10 * 60 * 1000,
} as const;

// ─── Prefijos de clave ────────────────────────────────────────────────────────
// Mantenerlos acá evita strings mágicos dispersos en books.ts y writers.ts.
export const KEYS = {
  BOOKS:   'books:',
  WRITERS: 'writers:',
} as const;
