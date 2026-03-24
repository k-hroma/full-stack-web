import { useState, type ReactNode } from 'react';
import { SearchWriterContext } from './SearchWriterContext';
import type { Writer } from '../types/writer';

interface Props {
  children: ReactNode;
}

export function SearchWriterProvider({ children }: Props) {
  const [writerResults, setWriterResults] = useState<Writer[]>([]);
  const [writerSearchTerm, setWriterSearchTerm] = useState('');

  return (
    <SearchWriterContext.Provider value={{ writerResults, setWriterResults, writerSearchTerm, setWriterSearchTerm }}>
      {children}
    </SearchWriterContext.Provider>
  );
}