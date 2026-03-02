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
  //httpClient-> La función base para hacer requests HTTP(client.ts)
  const response = await httpClient<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  //Función que guarda el JWT en memoria (no en localStorage)
  setAccessToken(response.token);

  //Devuelve los datos del usuario (id, name, email, role) que estan en la respuesta del backend
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
 * Registro de nuevo administrador (solo admin)
 * Requiere autenticación con rol admin
 */
export const registerAdmin = async (
  credentials: RegisterCredentials
): Promise<User> => {
  const response = await httpClient<LoginResponse>('/auth/admin', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

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