/*
 * -----External Store Pattern------
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

// Sistema de notificaciones
let listeners: (() => void)[] = [];
const notify = () => listeners.forEach(l => l());

// 🆕 FUNCIÓN REUTILIZABLE para refrescar
const doRefresh = async () => {
  store.status = 'loading'; //cambia el estado
  notify(); // avisa a react que cambio algo mientras se consulta el estado al backend
  
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
  notify(); // avisa que ya hay una respuesta
};

// Inicialización automática al cargar el módulo
doRefresh();

//HOOK
export function useAuthInit() {
  //useSyncExternalStore-> hook que escucha algo que está afuera de react
  //useSyncExternalStore(subscribe(rectInternalUpdate), getSnapshot())
  const state = useSyncExternalStore(
  // 1. como suscribirse: Cuando un componente usa este hook → guardamos su función en listeners // Cuando el componente se desmonta → lo sacamos
    (cb) => { listeners.push(cb); return () => { listeners = listeners.filter(l => l !== cb); }; },
    () => store // 2. Cómo obtener el estado: Cada vez que haya un cambio, mirá store
  );

  // 🆕 AHORA SÍ: refreshSession llama a doRefresh, no al promise viejo
  //useCallback hace que mientras state.status no cambie, React reutilice la misma referencia de funcion
  const refreshSession = useCallback(async () => {
    if (state.status === 'loading') return; //evita doble ejecucion
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