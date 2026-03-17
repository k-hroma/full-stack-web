import { createContext } from 'react';
import type { Book } from '../types';

export interface SearchContextType {
  results: Book[];
  setResults: React.Dispatch<React.SetStateAction<Book[]>>; // <-- Cambiar aquí
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const SearchContext = createContext<SearchContextType | undefined>(undefined);