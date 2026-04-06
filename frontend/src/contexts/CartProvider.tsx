/**
 * CartProvider - Estado del carrito con useReducer y localStorage por usuario
 * @module contexts/CartProvider

 */

import {
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { CartContext } from './CartContext';
import type { CartItem } from '../types/cart';
import type { Book } from '../types';
import { useAuth } from '../hooks/useAuth';

const STORAGE_KEY_BASE = 'libreria_cart';

// ─── Tipos de acciones ────────────────────────────────────────────────────────

type CartAction =
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: Book }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { bookId: string; quantity: number } }
  | { type: 'CLEAR_CART' };

interface CartState {
  items: CartItem[];
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'LOAD_CART':
      return { ...state, items: action.payload };

    case 'ADD_ITEM': {
      const book = action.payload;
      const existing = state.items.find((item) => item.book._id === book._id);

      if (existing) {
        if (book.stock && existing.quantity >= book.stock) return state;
        return {
          ...state,
          items: state.items.map((item) =>
            item.book._id === book._id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        };
      }
      return { ...state, items: [...state.items, { book, quantity: 1 }] };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.book._id !== action.payload),
      };

    case 'UPDATE_QUANTITY': {
      const { bookId, quantity } = action.payload;
      if (quantity < 1) {
        return {
          ...state,
          items: state.items.filter((item) => item.book._id !== bookId),
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.book._id === bookId ? { ...item, quantity } : item,
        ),
      };
    }

    case 'CLEAR_CART':
      return { ...state, items: [] };

    default:
      return state;
  }
}

const initialState: CartState = { items: [] };

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  // isLoading es true mientras status === 'idle' | 'loading'
  // (el refresh token todavía no resolvió)
  const { user, isAuthenticated, isLoading } = useAuth();

  // Siempre arrancar vacío — sin lazy initializer.
  // El efecto de carga se encarga de leer localStorage en el momento correcto.
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // ─── Clave de storage por usuario ───────────────────────────────────────
  const getStorageKey = useCallback((): string => {
    if (!isAuthenticated || !user) return `${STORAGE_KEY_BASE}_guest`;
    return `${STORAGE_KEY_BASE}_${user.id}`;
  }, [user, isAuthenticated]);

  // ─── Efecto: cargar carrito cuando auth resuelve ─────────────────────────
  // Se ejecuta SOLO cuando isLoading pasa a false por primera vez,
  // garantizando que getStorageKey() tiene el valor correcto (usuario real o guest).
  useEffect(() => {
    if (isLoading) return; // esperamos a que auth resuelva

    const key = getStorageKey();
    const saved = localStorage.getItem(key);

    dispatch({
      type: 'LOAD_CART',
      payload: saved ? (JSON.parse(saved) as CartItem[]) : [],
    });
  }, [isLoading, getStorageKey]);

  // ─── Efecto: persistir en localStorage ──────────────────────────────────
  // Guard: no escribir mientras auth está pendiente para no sobrescribir
  // el carrito real del usuario con el array vacío del estado inicial.
  useEffect(() => {
    if (isLoading) return; // no persistir hasta saber quién es el usuario

    const key = getStorageKey();
    localStorage.setItem(key, JSON.stringify(state.items));
  }, [state.items, getStorageKey, isLoading]);

  // ─── Totales derivados ────────────────────────────────────────────────────

  const itemCount = state.items.reduce(
    (sum: number, item: CartItem) => sum + item.quantity,
    0,
  );

  const totalPrice = state.items.reduce(
    (sum: number, item: CartItem) => sum + item.book.price * item.quantity,
    0,
  );

  // ─── Action creators ─────────────────────────────────────────────────────

  const addToCart = useCallback((book: Book) => {
    dispatch({ type: 'ADD_ITEM', payload: book });
  }, []);

  const removeFromCart = useCallback((bookId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: bookId });
  }, []);

  const updateQuantity = useCallback((bookId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { bookId, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const isInCart = useCallback(
    (bookId: string) => state.items.some((item: CartItem) => item.book._id === bookId),
    [state.items],
  );

  // ─── Valor del contexto ───────────────────────────────────────────────────

  const value = {
    items: state.items,
    itemCount,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
