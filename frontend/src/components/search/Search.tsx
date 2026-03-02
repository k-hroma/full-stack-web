import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchBooks } from '../../api';
import { useSearch } from '../../hooks/useSearch';
import searchicon from '../../assets/icons/search-icon.svg';
import '../../styles/components/search.css'

export function Search() {
  const navigate = useNavigate();
  const { setResults, setSearchTerm } = useSearch();
  const [inputValue, setInputValue] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearchTerm = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setErrorMsg('');
  };

  const handleSearchSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (inputValue.trim() === '') {
      setErrorMsg('La búsqueda no puede estar vacía.');
      setResults([]);
      return;
    }

    try {
      const results = await searchBooks(inputValue.trim());

      if (results.length > 0) {
        setSearchTerm(inputValue.trim());
        setResults(results);
        setInputValue('');
        setErrorMsg('');
        navigate('/results');
      } else {
        setResults([]);
        setErrorMsg(`No se encontraron resultados para "${inputValue}"`);
        setInputValue('');
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Error inesperado';
      setErrorMsg(`Ocurrió un error al buscar: ${errMsg}`);
      setResults([]);
    }
  };

  return (
    <div className="search-container">
      <form className="search-form" onSubmit={handleSearchSubmit}>
        <input
          id="navSearch"
          name="navSearch"
          type="text"
          className="search-input"
          placeholder="Título, autorx, editorial, ISBN"
          value={inputValue}
          onChange={handleSearchTerm}
          aria-label="Buscar libro"
        />
        <button type="submit" className="icon-lupa">
          <img src={searchicon} alt="Icono de búsqueda" width="16" height="17" />
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