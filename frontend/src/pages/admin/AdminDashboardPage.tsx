import { useForm } from '../../hooks/useForm';
import { useState } from 'react';
import type { CreateBookInput, Book } from '../../types';
import { createBook, updateBook, deleteBook } from '../../api';
import { useSearch } from '../../hooks/useSearch';
import { searchBooks } from '../../api';
import '../../styles/pages/admin/admin-dashboard.css';

type BookFormData = {
  img: string
  isbn: string
  title: string
  firstName: string
  lastName: string
  editorial: string
  price: number | ''
  stock: number | ''
  latestBook: boolean
  fanzine: boolean
  showInHome: boolean
  homeOrder: number | ''
  recomendedWriter: boolean
  description: string
  url: string
}

const INITIAL_FORM_BOOK_DATA: BookFormData = {
  img: '',
  isbn: '',
  title: '',
  firstName: '',
  lastName: '',
  editorial: '',
  price: '',
  stock: '',
  latestBook: false,
  fanzine: false,
  showInHome: false,
  homeOrder: '',
  recomendedWriter: false,
  description: '',
  url: '',
}

const prepareBookPayload = (formData: BookFormData): CreateBookInput => {
  return {
    ...formData,
    price: formData.price === '' ? 0 : formData.price,
    stock: formData.stock === '' ? 0 : formData.stock,
    homeOrder: formData.homeOrder === '' ? null : formData.homeOrder,
  };
};

const populateFormWithBook = (book: Book): BookFormData => ({
  img: book.img || '',
  isbn: book.isbn || '',
  title: book.title || '',
  firstName: book.firstName || '',
  lastName: book.lastName || '',
  editorial: book.editorial || '',
  price: book.price ?? '',
  stock: book.stock ?? '',
  latestBook: book.latestBook || false,
  fanzine: book.fanzine || false,
  showInHome: book.showInHome || false,
  homeOrder: book.homeOrder ?? '',
  recomendedWriter: book.recomendedWriter || false,
  description: book.description || '',
  url: book.url || '',
});

export default function AdminDashboardPage() {
  const { formData, handleChange, resetForm, setFormData } = useForm<BookFormData>(INITIAL_FORM_BOOK_DATA);

  const { img, isbn, title, firstName, lastName, editorial, price, stock, latestBook, fanzine, showInHome, homeOrder, recomendedWriter, description, url } = formData;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [activeTab, setActiveTab] = useState<'create' | 'edit'>('create');

  const { setResults, setSearchTerm, results } = useSearch();
  const [inputValue, setInputValue] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const payload = prepareBookPayload(formData);

      if (editingBookId) {
        const updatedBook = await updateBook(editingBookId, payload);
        setSubmitStatus('success');

        setResults((prevResults) =>
          prevResults.map((book) =>
            book._id === editingBookId ? { ...book, ...updatedBook } : book
          )
        );
        setTimeout(() => {
          setActiveTab('edit');
          resetForm();
          setEditingBookId(null);
          setSubmitStatus('idle');
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }, 1000);
      } else {
        await createBook(payload);
        setSubmitStatus('success');
      }

      resetForm();
      setEditingBookId(null);
      setActiveTab('edit');

      if (inputValue) {
        const refreshedResults = await searchBooks(inputValue.trim());
        setResults(refreshedResults);
      }

    } catch (error) {
      console.error('Error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (book: Book) => {
    setFormData(populateFormWithBook(book));
    setEditingBookId(book._id);
    setActiveTab('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (bookId: string) => {
    try {
      await deleteBook(bookId);
      setResults(results.filter(b => b._id !== bookId));
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Error al eliminar:', error);
      setErrorMsg('Error al eliminar el libro');
    }
  };

  const handleCancelEdit = () => {
    resetForm();
    setEditingBookId(null);
    setSubmitStatus('idle');
  };

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
    <div className="admin-dashboard">
      <div className="admin-dashboard__container">
        {/* Header con navegación de tabs */}
        <div className="admin-dashboard__header">
          <h1 className="admin-dashboard__title">Gestión de Libros</h1>

          <div className="admin-dashboard__tabs">
            <button
              className={`admin-dashboard__tab ${activeTab === 'create' ? 'admin-dashboard__tab--active' : ''}`}
              onClick={() => setActiveTab('create')}
            >
              {editingBookId ? 'Editar Libro' : 'Nuevo Libro'}
            </button>
            <button
              className={`admin-dashboard__tab ${activeTab === 'edit' ? 'admin-dashboard__tab--active' : ''}`}
              onClick={() => setActiveTab('edit')}
            >
              Editar Libro
            </button>
          </div>
        </div>

        {/* Formulario de Creación/Edición */}
        {activeTab === 'create' && (
          <form
            className="admin-dashboard__form"
            onSubmit={handleSubmit}
          >
            {editingBookId && (
              <div className="admin-dashboard__edit-banner">
                <span>✏️ Editando: {title}</span>
                <button type="button" onClick={handleCancelEdit} className="admin-dashboard__edit-banner-close">
                  Cancelar edición
                </button>
              </div>
            )}

            {/* Sección: Información Básica */}
            <div className="admin-dashboard__section">
              <h2 className="admin-dashboard__section-title">Información Básica</h2>

              <div className="admin-dashboard__row">
                <div className="admin-dashboard__field admin-dashboard__field--large">
                  <label className="admin-dashboard__label" htmlFor="title">
                    Título del libro
                  </label>
                  <input
                    className="admin-dashboard__input"
                    type="text"
                    id="title"
                    name="title"
                    placeholder="Ej: Cien años de soledad"
                    value={title}
                    onChange={handleChange}
                  />
                </div>

                <div className="admin-dashboard__field">
                  <label className="admin-dashboard__label" htmlFor="isbn">
                    ISBN
                  </label>
                  <input
                    className="admin-dashboard__input"
                    type="text"
                    id="isbn"
                    name="isbn"
                    placeholder="978-3-16-148410-0"
                    value={isbn}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="admin-dashboard__row">
                <div className="admin-dashboard__field">
                  <label className="admin-dashboard__label" htmlFor="firstName">
                    Nombre del autor
                  </label>
                  <input
                    className="admin-dashboard__input"
                    type="text"
                    id="firstName"
                    name="firstName"
                    placeholder="Gabriel"
                    value={firstName}
                    onChange={handleChange}
                  />
                </div>

                <div className="admin-dashboard__field">
                  <label className="admin-dashboard__label" htmlFor="lastName">
                    Apellido del autor
                  </label>
                  <input
                    className="admin-dashboard__input"
                    type="text"
                    id="lastName"
                    name="lastName"
                    placeholder="García Márquez"
                    value={lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="admin-dashboard__row">
                <div className="admin-dashboard__field">
                  <label className="admin-dashboard__label" htmlFor="editorial">
                    Editorial
                  </label>
                  <input
                    className="admin-dashboard__input"
                    type="text"
                    id="editorial"
                    name="editorial"
                    placeholder="Sudamericana"
                    value={editorial}
                    onChange={handleChange}
                  />
                </div>

                <div className="admin-dashboard__field">
                  <label className="admin-dashboard__label" htmlFor="url">
                    URL de referencia
                  </label>
                  <input
                    className="admin-dashboard__input"
                    type="url"
                    id="url"
                    name="url"
                    placeholder="https://..."
                    value={url}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Sección: Precio y Stock */}
            <div className="admin-dashboard__section">
              <h2 className="admin-dashboard__section-title">Precio y Stock</h2>

              <div className="admin-dashboard__row admin-dashboard__row--three">
                <div className="admin-dashboard__field">
                  <label className="admin-dashboard__label" htmlFor="price">
                    Precio ($)
                  </label>
                  <input
                    className="admin-dashboard__input"
                    type="number"
                    id="price"
                    name="price"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={price}
                    onChange={handleChange}
                  />
                </div>

                <div className="admin-dashboard__field">
                  <label className="admin-dashboard__label" htmlFor="stock">
                    Stock
                  </label>
                  <input
                    className="admin-dashboard__input"
                    type="number"
                    id="stock"
                    name="stock"
                    min="0"
                    placeholder="0"
                    value={stock}
                    onChange={handleChange}
                  />
                </div>

                <div className="admin-dashboard__field">
                  <label className="admin-dashboard__label" htmlFor="homeOrder">
                    Orden en Home (1-8)
                  </label>
                  <input
                    className="admin-dashboard__input"
                    type="number"
                    id="homeOrder"
                    name="homeOrder"
                    min="1"
                    max="8"
                    placeholder="-"
                    value={homeOrder}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Sección: Imagen */}
            <div className="admin-dashboard__section">
              <h2 className="admin-dashboard__section-title">Imagen de portada</h2>

              <div className="admin-dashboard__field">
                <label className="admin-dashboard__label" htmlFor="img">
                  URL de la imagen
                </label>
                <input
                  className="admin-dashboard__input"
                  type="url"
                  id="img"
                  name="img"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  value={img}
                  onChange={handleChange}
                />
              </div>
              {img && (
                <div className="admin-dashboard__image-preview">
                  <img src={img} alt="Vista previa" />
                </div>
              )}
            </div>

            {/* Sección: Categorización */}
            <div className="admin-dashboard__section">
              <h2 className="admin-dashboard__section-title">Categorización</h2>

              <div className="admin-dashboard__checkboxes">
                <label className="admin-dashboard__checkbox-label">
                  <input
                    type="checkbox"
                    name="latestBook"
                    className="admin-dashboard__checkbox"
                    checked={latestBook}
                    onChange={handleChange}
                  />
                  <span className="admin-dashboard__checkbox-text">Novedad</span>
                </label>

                <label className="admin-dashboard__checkbox-label">
                  <input
                    type="checkbox"
                    name="fanzine"
                    className="admin-dashboard__checkbox"
                    checked={fanzine}
                    onChange={handleChange}
                  />
                  <span className="admin-dashboard__checkbox-text">Fanzine</span>
                </label>

                <label className="admin-dashboard__checkbox-label">
                  <input
                    type="checkbox"
                    name="showInHome"
                    className="admin-dashboard__checkbox"
                    checked={showInHome}
                    onChange={handleChange}
                  />
                  <span className="admin-dashboard__checkbox-text">Mostrar en Home</span>
                </label>

                <label className="admin-dashboard__checkbox-label">
                  <input
                    type="checkbox"
                    name="recomendedWriter"
                    className="admin-dashboard__checkbox"
                    checked={recomendedWriter}
                    onChange={handleChange}
                  />
                  <span className="admin-dashboard__checkbox-text">Escritor recomendado</span>
                </label>
              </div>
            </div>

            {/* Sección: Descripción */}
            <div className="admin-dashboard__section">
              <h2 className="admin-dashboard__section-title">Descripción</h2>

              <div className="admin-dashboard__field">
                <textarea
                  className="admin-dashboard__textarea"
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="Descripción del libro..."
                  value={description}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Mensajes de estado */}
            {submitStatus === 'success' && (
              <div className="form-alert form-alert--success">
                ✅ {editingBookId ? 'Libro actualizado exitosamente' : 'Libro creado exitosamente'}
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="form-alert form-alert--error">
                ❌ Error al {editingBookId ? 'actualizar' : 'crear'} el libro. Intentá de nuevo.
              </div>
            )}

            <div className="admin-dashboard__actions">
              <button
                type="button"
                className="admin-dashboard__button admin-dashboard__button--secondary"
                onClick={editingBookId ? handleCancelEdit : resetForm}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="admin-dashboard__button"
                disabled={isSubmitting}>
                {editingBookId ? 'Guardar cambios' : 'Crear libro'}
              </button>
            </div>
          </form>
        )}

        {/* Modo Edición - Búsqueda y Resultados */}
        {activeTab === 'edit' && (
          <div className="admin-dashboard__edit-mode">
            <div className="admin-dashboard__search-box">
              <label className="admin-dashboard__label" htmlFor="searchBook">
                Buscar libro para editar
              </label>
              <form
                className="admin-dashboard__search-row"
                onSubmit={handleSearchSubmit}>
                <input
                  className="admin-dashboard__input"
                  type="text"
                  id="searchBook"
                  placeholder="Título, ISBN o autor..."
                  value={inputValue}
                  onChange={handleSearchTerm}
                />
                <button type="submit" className="admin-dashboard__button admin-dashboard__button--small">
                  Buscar
                </button>
              </form>
              {errorMsg && (
                <div className="search-admin-toast">
                  <span>{errorMsg}</span>
                  <button className="toast-close" onClick={() => setErrorMsg('')}>
                    ×
                  </button>
                </div>
              )}
            </div>

            {results.length === 0 ? (
              <div className="admin-dashboard__placeholder">
                <p>{inputValue ? `No se encontraron resultados` : 'Realizá una búsqueda para encontrar libros'}</p>
              </div>
            ) : (
              <div className="admin-dashboard__results-grid">
                {results.map((book) => (
                  <div key={book._id} className="admin-book-card">
                    <div className="admin-book-card__image">
                      {book.img ? (
                        <img src={book.img} alt={book.title} />
                      ) : (
                        <div className="admin-book-card__no-image">Sin imagen</div>
                      )}
                    </div>

                    <div className="admin-book-card__content">
                      <h3 className="admin-book-card__title">{book.title}</h3>
                      <p className="admin-book-card__author">
                        {book.firstName} {book.lastName}
                      </p>
                      <p className="admin-book-card__isbn">ISBN: {book.isbn}</p>

                      <div className="admin-book-card__badges">
                        {book.latestBook && <span className="badge badge--new">Novedad</span>}
                        {book.fanzine && <span className="badge badge--fanzine">Fanzine</span>}
                        {book.showInHome && <span className="badge badge--home">Home</span>}
                      </div>
                    </div>

                    <div className="admin-book-card__actions">
                      <button
                        className="admin-book-card__btn admin-book-card__btn--edit"
                        onClick={() => handleEdit(book)}
                      >
                        <span className="btn-icon">✏️</span>
                        Editar
                      </button>

                      {deleteConfirmId === book._id ? (
                        <div className="admin-book-card__confirm">
                          <span>¿Eliminar?</span>
                          <button
                            className="admin-book-card__btn admin-book-card__btn--confirm-yes"
                            onClick={() => handleDelete(book._id)}
                          >
                            Sí
                          </button>
                          <button
                            className="admin-book-card__btn admin-book-card__btn--confirm-no"
                            onClick={() => setDeleteConfirmId(null)}
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          className="admin-book-card__btn admin-book-card__btn--delete"
                          onClick={() => setDeleteConfirmId(book._id)}
                        >
                          <span className="btn-icon">🗑️</span>
                          Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}