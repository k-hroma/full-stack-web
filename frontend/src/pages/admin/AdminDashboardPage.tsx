
import { useForm } from '../../hooks/useForm';
import { useState } from 'react';
import '../../styles/pages/admin/admin-dashboard.css';
import type { CreateBookInput } from '../../types';
import { createBook } from '../../api';


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

export default function AdminDashboardPage() {
  const { formData, handleChange, resetForm } = useForm<BookFormData>(INITIAL_FORM_BOOK_DATA);

  const { img, isbn, title, firstName, lastName, editorial, price, stock, latestBook, fanzine, showInHome, homeOrder, recomendedWriter, description, url } = formData;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [activeTab, setActiveTab] = useState<'create' | 'edit'>('create');


  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const payload = prepareBookPayload(formData);
      const newBook = await createBook(payload)
      console.log('Datos del libro creado:', newBook);
      setSubmitStatus('success');
      resetForm();

    } catch (error) {
      console.error('Error al crear el libro:', error);
      setSubmitStatus('error');

    } finally {
      setIsSubmitting(false);
    }
  }

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
              Nuevo Libro
            </button>
            <button
              className={`admin-dashboard__tab ${activeTab === 'edit' ? 'admin-dashboard__tab--active' : ''}`}
              onClick={() => setActiveTab('edit')}
            >
              Editar Libro
            </button>
          </div>
        </div>

        {/* Formulario de Creación */}
        {activeTab === 'create' && (
          <form
            className="admin-dashboard__form"
            onSubmit={handleSubmit}
          >
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

            {/* Acciones */}

            {/* Mensajes de estado */}
            {submitStatus === 'success' && (
              <div className="form-alert form-alert--success">
                ✅ Libro creado exitosamente.
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="form-alert form-alert--error">
                ❌ Error al crear el libro. Intentá de nuevo.
              </div>
            )}

            <div className="admin-dashboard__actions">
              <button
                type="button"
                className="admin-dashboard__button admin-dashboard__button--secondary"
                onClick={resetForm}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="admin-dashboard__button"
                disabled={isSubmitting}>
                Crear libro
              </button>
            </div>
          </form>
        )}

        {/* Formulario de Edición (estructura similar, simplificada para el ejemplo) */}
        {activeTab === 'edit' && (
          <div className="admin-dashboard__edit-mode">
            <div className="admin-dashboard__search-box">
              <label className="admin-dashboard__label" htmlFor="searchBook">
                Buscar libro para editar
              </label>
              <div className="admin-dashboard__search-row">
                <input
                  className="admin-dashboard__input"
                  type="text"
                  id="searchBook"
                  placeholder="Título, ISBN o autor..."

                />
                <button type="button" className="admin-dashboard__button admin-dashboard__button--small">
                  Buscar
                </button>
              </div>
            </div>

            {/* Aquí iría el formulario de edición (misma estructura que create) */}
            <div className="admin-dashboard__placeholder">
              <p>Seleccioná un libro para editar sus datos</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
