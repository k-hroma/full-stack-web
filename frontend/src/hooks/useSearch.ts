import { useContext } from 'react';
import { SearchContext } from '../contexts/SearchContext';
import type { SearchContextType } from '../contexts/SearchContext';

export function useSearch(): SearchContextType {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch debe usarse dentro de SearchProvider');
  }
  return context;
}