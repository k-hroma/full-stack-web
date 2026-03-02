import { createContext } from 'react';
import type { Book } from '../types';

export interface SearchContextType {
  results: Book[];
  setResults: (books: Book[]) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const SearchContext = createContext<SearchContextType | undefined>(undefined);