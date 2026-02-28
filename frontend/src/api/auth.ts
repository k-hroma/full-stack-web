/**
 * Endpoints de autenticación
 * @module api/auth
 */

import { httpClient, setAccessToken, clearAccessToken } from './client';
import type {
  LoginCredentials,
  RegisterCredentials,
  LoginResponse,
  User,
} from '../types';

/**
 * Login de usuario
 * Guarda automáticamente el access token en memoria
 */
export const login = async (
  credentials: LoginCredentials
): Promise<User> => {
  const response = await httpClient<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  setAccessToken(response.token);
  return response.data;
};

/**
 * Registro de nuevo usuario
 */
export const register = async (
  credentials: RegisterCredentials
): Promise<User> => {
  const response = await httpClient<LoginResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  setAccessToken(response.token);
  return response.data;
};

/**
 * Logout - Revoca refresh token y limpia estado
 */
export const logout = async (): Promise<void> => {
  try {
    await httpClient('/auth/logout', {
      method: 'POST',
    });
  } finally {
    clearAccessToken();
  }
};

/**
 * Logout de todos los dispositivos
 */
export const logoutAllDevices = async (): Promise<void> => {
  await httpClient('/auth/logout-all', {
    method: 'POST',
  });
  clearAccessToken();
};