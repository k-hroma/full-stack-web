/**
 * Hook para inicialización silenciosa de sesión
 * @module hooks/useAuthInit
 */

import { useCallback, useSyncExternalStore } from 'react';
import { refreshAccessToken } from '../api/client';
import type { User, AuthStatus } from '../types/auth';

// Store simple fuera de React
let store = {
  user: null as User | null,
  status: 'idle' as AuthStatus,
  error: null as string | null,
};

let listeners: (() => void)[] = [];
const notify = () => listeners.forEach(l => l());

// 🆕 FUNCIÓN REUTILIZABLE para refrescar
const doRefresh = async () => {
  store.status = 'loading';
  notify();
  
  try {
    const { user } = await refreshAccessToken();
    store = { ...store, user, status: 'authenticated', error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    const isExpected = msg.includes('inválido');
    store = { 
      ...store, 
      user: null, 
      status: 'unauthenticated', 
      error: isExpected ? null : msg 
    };
  }
  notify();
};

// Inicialización automática al cargar el módulo
doRefresh();

export function useAuthInit() {
  const state = useSyncExternalStore(
    (cb) => { listeners.push(cb); return () => { listeners = listeners.filter(l => l !== cb); }; },
    () => store
  );

  // 🆕 AHORA SÍ: refreshSession llama a doRefresh, no al promise viejo
  const refreshSession = useCallback(async () => {
    if (state.status === 'loading') return;
    await doRefresh();
  }, [state.status]);

  const logoutLocally = useCallback(() => {
    store = { user: null, status: 'unauthenticated', error: null };
    notify();
  }, []);

  return {
    ...state,
    refreshSession,
    logoutLocally,
  };
}