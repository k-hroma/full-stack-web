/**
 * HTTP Client con fetch - Interceptor de refresh token automático
 * @module api/client
 */

import type { ApiError, RefreshResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Estado global del token de acceso (en memoria, no localStorage)
 * Por seguridad: si el usuario abre en otra pestaña, no tiene sesión.
 * El refresh token en httpOnly cookie sí persiste entre pestañas.
 */
let accessToken: string | null = null;

/**
 * Cola de requests pendientes mientras se refresca el token
 */
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

/**
 * Guarda el access token en memoria
 */
export const setAccessToken = (token: string): void => {
  accessToken = token;
};

/**
 * Limpia el access token (logout)
 */
export const clearAccessToken = (): void => {
  accessToken = null;
};

/**
 * Obtiene el token actual (para debugging)
 */
export const getAccessToken = (): string | null => accessToken;

/**
 * Notifica a todos los requests que estaban esperando el nuevo token
 */
const onTokenRefreshed = (newToken: string): void => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

/**
 * Agrega un request a la cola de espera
 */
const addRefreshSubscriber = (callback: (token: string) => void): void => {
  refreshSubscribers.push(callback);
};

/**
 * Realiza el refresh token llamando a POST /auth/refresh
 * Las cookies httpOnly se envían automáticamente
 */
const refreshAccessToken = async (): Promise<string> => {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include', // ← Envia cookies httpOnly automáticamente
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Refresh token inválido o expirado');
  }

  const data: RefreshResponse = await response.json();
  return data.token;
};

/**
 * HTTP Client principal - Wrapper de fetch con interceptores
 * 
 * @param endpoint - Ruta relativa (ej: '/books', '/auth/login')
 * @param options - Opciones de fetch estándar
 * @returns Promise con la data tipada
 * 
 * @example
 * const books = await httpClient<BooksResponse>('/books');
 * const book = await httpClient<BookResponse>('/books/123');
 */
export async function httpClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  // Headers por defecto
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  // Agregar Authorization si tenemos token
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // ← Siempre incluir cookies
  };

  try {
    let response = await fetch(url, config);

    // Si da 401, intentar refresh y reintentar
    if (response.status === 401 && accessToken) {
      // Evitar múltiples refresh simultáneos
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const newToken = await refreshAccessToken();
          setAccessToken(newToken);
          onTokenRefreshed(newToken);
        } catch (refreshError) {
          // Refresh falló, limpiar todo
          clearAccessToken();
          throw refreshError;
        } finally {
          isRefreshing = false;
        }
      }

      // Esperar a que termine el refresh en curso
      const newToken = await new Promise<string>((resolve) => {
        addRefreshSubscriber((token) => resolve(token));
      });

      // Reintentar request original con nuevo token
      headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(url, {
        ...config,
        headers,
      });
    }

    // Parsear respuesta
    const data = await response.json();

    if (!response.ok) {
      // Error HTTP (4xx, 5xx) - devolver como ApiError
      throw data as ApiError;
    }

    return data as T;

  } catch (error) {
    // Error de red o parseo
    if ((error as ApiError).success === false) {
      throw error; // Ya es ApiError del backend
    }

    // Error de red genérico
    throw {
      success: false,
      message: error instanceof Error ? error.message : 'Error de conexión',
    } as ApiError;
  }
}