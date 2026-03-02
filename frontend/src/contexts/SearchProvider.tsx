import { useState, type ReactNode } from 'react';
import { SearchContext } from './SearchContext';
import type { Book } from '../types';

interface Props {
  children: ReactNode;
}

export function SearchProvider({ children }: Props) {
  const [results, setResults] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <SearchContext.Provider value={{ results, setResults, searchTerm, setSearchTerm }}>
      {children}
    </SearchContext.Provider>
  );
}