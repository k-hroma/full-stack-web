import { createContext } from 'react';
import type { Writer } from '../types/writer';

export interface SearchWriterContextType {
  writerResults: Writer[];
  setWriterResults: React.Dispatch<React.SetStateAction<Writer[]>>;
  writerSearchTerm: string;
  setWriterSearchTerm: (term: string) => void;
}

export const SearchWriterContext = createContext<SearchWriterContextType | undefined>(undefined);