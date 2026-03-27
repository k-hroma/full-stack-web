import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchBooks, searchWriters } from '../../api';
import { useSearch } from '../../hooks/useSearch';
import { useWriterSearch } from '../../hooks/useWriterSearch';
import { Search } from '@boxicons/react';

import '../../styles/components/search.css'

export function SearchBooks() {
  const navigate = useNavigate();
  const { setResults, setSearchTerm } = useSearch();
  const { setWriterResults, setWriterSearchTerm } = useWriterSearch();
  const [inputValue, setInputValue] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearchTerm = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setErrorMsg('');
  };

  const handleSearchSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const term = inputValue.trim();

    if (term === '') {
      setErrorMsg('La búsqueda no puede estar vacía.');
      setResults([]);
      setWriterResults([]);
      return;
    }

    try {
      const [bookResults, writerResults] = await Promise.all([
        searchBooks(term),
        searchWriters(term),
      ]);

      if (bookResults.length > 0 || writerResults.length > 0) {
        setSearchTerm(term);
        setResults(bookResults);
        setWriterSearchTerm(term);
        setWriterResults(writerResults);
        setInputValue('');
        setErrorMsg('');
        navigate('/results');
      } else {
        setResults([]);
        setWriterResults([]);
        setErrorMsg(`No se encontraron resultados para "${term}"`);
        setInputValue('');
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Error inesperado';
      setErrorMsg(`Ocurrió un error al buscar: ${errMsg}`);
      setResults([]);
      setWriterResults([]);
    }
  };

  return (
    <div className="search-container">
      <form className="search-form" onSubmit={handleSearchSubmit}>
        <input
          id="navSearch"
          name="navSearch"
          type="text"
          autoComplete='off'
          className="search-input"
          placeholder="Título, autorx, editorial, ISBN"
          value={inputValue}
          onChange={handleSearchTerm}
        />
        <button type="submit" className="icon-lupa">
          <Search fill="#954300" />
        </button>
      </form>

      {errorMsg && (
        <div className="search-toast">
          <span>{errorMsg}</span>
          <button className="toast-close" onClick={() => setErrorMsg('')}>
            ×
          </button>
        </div>
      )}
    </div>
  );
}