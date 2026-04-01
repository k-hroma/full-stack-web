/**
 * Hook para usar el SearchWriterContext
 * @module hooks/useWriterSearch
 * 
 * @description
 * Hook personalizado que proporciona acceso al contexto de búsqueda de escritores.
 * DEBE usarse dentro de SearchWriterProvider, de lo contrario lanza error.
 * 
 * @example
 * const { writerResults, setWriterResults, writerSearchTerm, setWriterSearchTerm } = useWriterSearch();
 */

import { useContext } from 'react';
import { SearchWriterContext } from '../contexts/SearchWriterContext';
import type { SearchWriterContextType } from '../contexts/SearchWriterContext';

/**
 * Hook de búsqueda de escritores
 * @returns {SearchWriterContextType} Contexto de búsqueda de escritores
 * @throws {Error} Si se usa fuera de SearchWriterProvider
 */
export function useWriterSearch(): SearchWriterContextType { 
  const context = useContext(SearchWriterContext);
  
  if (!context) {
    throw new Error('useWriterSearch debe usarse dentro de SearchWriterProvider');
  }
  
  return context;
}