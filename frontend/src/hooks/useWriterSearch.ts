import { useContext } from 'react';
import { SearchWriterContext } from '../contexts/SearchWriterContext';
import type { SearchWriterContextType } from '../contexts/SearchWriterContext';

export function useWriterSearch(): SearchWriterContextType { 
  const context = useContext(SearchWriterContext);
  if (!context) {
    throw new Error('useSearch debe usarse dentro de SearchProvider');
  }
  return context;
}