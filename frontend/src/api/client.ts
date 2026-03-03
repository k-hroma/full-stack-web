/**
 * HTTP Client con fetch - Interceptor de refresh token automático
 * @module api/client
 */

import type { ApiError, RefreshResponse, User } from '../types';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Estado global del token de acceso (en memoria, no localStorage)
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
 * Limpia el access token
 */
export const clearAccessToken = (): void => {
  accessToken = null;
};

/**
 * Obtiene el token actual
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
 * 🆕 Devuelve el token string y el usuario por separado
 */
export const refreshAccessToken = async (): Promise<{ token: string; user: User }> => {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(error.message || 'Refresh token inválido o expirado');
  }

  const data: RefreshResponse = await response.json();
  
  // Guardar el nuevo token en memoria
  setAccessToken(data.token);
  
  // Decodificar payload del JWT para obtener usuario
  const payload = JSON.parse(atob(data.token.split('.')[1]));
  const user: User = {
    id: payload.id,
    name: payload.name,
    email: payload.email,
    role: payload.role,
  };
  
  return { token: data.token, user };
};

/**
 * HTTP Client principal
 */
export async function httpClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };

  try {
    let response = await fetch(url, config);

    // Si da 401, intentar refresh y reintentar
    if (response.status === 401 && accessToken) {
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          // 🆕 FIX: Extraemos solo el token string del objeto retornado
          const { token: newToken } = await refreshAccessToken();
          onTokenRefreshed(newToken);
        } catch (refreshError) {
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

      headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(url, {
        ...config,
        headers,
      });
    }

    const data = await response.json();

    if (!response.ok) {
      throw data as ApiError;
    }

    return data as T;

  } catch (error) {
    if ((error as ApiError).success === false) {
      throw error;
    }

    throw {
      success: false,
      message: error instanceof Error ? error.message : 'Error de conexión',
    } as ApiError;
  }
}