

import { useState } from 'react';
import '../../styles/pages/admin/admin-dashboard.css';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'create' | 'edit'>('create');

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
          <form className="admin-dashboard__form">
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
                  />
                  <span className="admin-dashboard__checkbox-text">Novedad</span>
                </label>

                <label className="admin-dashboard__checkbox-label">
                  <input
                    type="checkbox"
                    name="fanzine"
                    className="admin-dashboard__checkbox"
                  />
                  <span className="admin-dashboard__checkbox-text">Fanzine</span>
                </label>

                <label className="admin-dashboard__checkbox-label">
                  <input
                    type="checkbox"
                    name="showInHome"
                    className="admin-dashboard__checkbox"
                  />
                  <span className="admin-dashboard__checkbox-text">Mostrar en Home</span>
                </label>

                <label className="admin-dashboard__checkbox-label">
                  <input
                    type="checkbox"
                    name="recomendedWriter"
                    className="admin-dashboard__checkbox"
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
                />
              </div>
            </div>

            {/* Acciones */}
            <div className="admin-dashboard__actions">
              <button type="button" className="admin-dashboard__button admin-dashboard__button--secondary">
                Cancelar
              </button>
              <button type="submit" className="admin-dashboard__button">
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
