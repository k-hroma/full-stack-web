import { useForm } from '../../hooks/useForm';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import type { CreateWriterInput, Writer } from '../../types/writer';
import { createWriter, updateWriter, deleteWriter, searchWriters, getWriters, getWritersByCategory } from '../../api/writers';
import '../../styles/pages/admin/admin-writers-management.css';


type CategoryFilter = 'all' | 'recomended' | 'viewAll';

const INITIAL_FORM_WRITER_DATA: CreateWriterInput = {
  lastName: "",
  firstName: "",
  titleBookQuote: "",
  recomended: false,
  bioDescription: "",
  bioQuote: "",
}

export default function AdminWritersManagementPage() {
  const { formData, handleChange, resetForm, setFormData } = useForm<CreateWriterInput>(INITIAL_FORM_WRITER_DATA);

  const { lastName, firstName, titleBookQuote, recomended, bioDescription, bioQuote } = formData;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [activeTab, setActiveTab] = useState<'create' | 'edit'>('create');

  const [writerResults, setWriterResults] = useState<Writer[]>([]);

  const [inputValue, setInputValue] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [editingWriterId, setEditingWriterId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');


  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      if (editingWriterId) {
        await updateWriter(editingWriterId, formData);
        setSubmitStatus('success');
        setTimeout(() => {
          resetForm();
          setEditingWriterId(null);
          setSubmitStatus('idle');
          setWriterResults([]);
          setActiveCategory('all');
          setInputValue('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 1500);
      } else {
        await createWriter(formData);
        setSubmitStatus('success');
        setTimeout(() => {
          resetForm();
          setSubmitStatus('idle');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 1500);
      }

    } catch (error) {
      console.error('Error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (writer: Writer) => {
    setFormData({
      lastName: writer.lastName,
      firstName: writer.firstName,
      titleBookQuote: writer.titleBookQuote || '',
      recomended: writer.recomended,
      bioDescription: writer.bioDescription || '',
      bioQuote: writer.bioQuote || '',
    });
    setEditingWriterId(writer._id);
    setActiveTab('create');
    window.scrollTo({ top: 0, behavior: 'smooth' })
  };

  const handleDelete = async (writerId: string) => {
    try {
      await deleteWriter(writerId);
      setWriterResults(writerResults.filter(w => w._id !== writerId));
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Error al eliminar:', error);
      setErrorMsg('Error al eliminar el escritor');
    }
  };

  const handleCancelEdit = () => {
    resetForm();
    setEditingWriterId(null);
    setSubmitStatus('idle');
    setWriterResults([]);
    setActiveCategory('all');
    setInputValue('');
    setErrorMsg('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchTerm = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setErrorMsg('');
  };

  const handleSearchSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (inputValue.trim() === '') {
      setErrorMsg('La búsqueda no puede estar vacía.');
      setWriterResults([]);
      return;
    }
    try {
      const searchResults = await searchWriters(inputValue.trim());

      // ====== DEBUG ======
      console.log('=== DEBUG handleSearchSubmit ===');
      console.log('bioDescription raw:', searchResults[0]?.bioDescription);
      console.log('bioDescription JSON.stringify:', JSON.stringify(searchResults[0]?.bioDescription));
      console.log('bioQuote raw:', searchResults[0]?.bioQuote);
      console.log('bioQuote JSON.stringify:', JSON.stringify(searchResults[0]?.bioQuote));
      // ===================

      if (searchResults.length > 0) {
        setInputValue(inputValue.trim());
        setWriterResults(searchResults);
        setInputValue('');
        setErrorMsg('');
        setActiveCategory('all');
      } else {
        setWriterResults([]);
        setErrorMsg(`No se encontraron resultados para "${inputValue}"`);
        setInputValue('');
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Error inesperado';
      setErrorMsg(`Ocurrió un error al buscar: ${errMsg}`);
      setWriterResults([]);
    }
  };

  const handleCategorySearch = async (category: CategoryFilter) => {
    setActiveCategory(category);
    setErrorMsg('');
    setInputValue('');

    if (category === 'all') {
      setWriterResults([]);
      return;
    }

    try {
      let writers;
      if (category === 'viewAll') {
        writers = await getWriters();
      } else {
        writers = await getWritersByCategory(category);
      }

      // ====== DEBUG ======
      console.log('=== DEBUG handleCategorySearch ===');
      console.log('bioDescription raw:', writers[0]?.bioDescription);
      console.log('bioDescription JSON.stringify:', JSON.stringify(writers[0]?.bioDescription));
      console.log('bioQuote raw:', writers[0]?.bioQuote);
      console.log('bioQuote JSON.stringify:', JSON.stringify(writers[0]?.bioQuote));
      // ===================

      setWriterResults(writers);

      if (writers.length === 0) {
        setErrorMsg(category === 'viewAll'
          ? 'No hay escritores registrados'
          : `No se encontraron escritores en esta categoría`
        );
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Error inesperado';
      setErrorMsg(`Ocurrió un error al buscar: ${errMsg}`);
      setWriterResults([]);
    }
  }

  return (
    <div className="admin-writers-dashboard">
      <div className="admin-writers-dashboard__container">
        {/* Header con navegación de tabs */}
        <div className="admin-writers-dashboard__header">
          <div className="admin-dashboard__tabs">
            <button
              className={`admin-dashboard__tab ${activeTab === 'create' ? 'admin-dashboard__tab--active' : ''}`}
              onClick={() => setActiveTab('create')}
            >
              {editingWriterId ? 'Editar Escritor' : 'Nuevo Escritor'}
            </button>
            <button
              className={`admin-dashboard__tab ${activeTab === 'edit' ? 'admin-dashboard__tab--active' : ''}`}
              onClick={() => setActiveTab('edit')}
            >
              Editar Escritor
            </button>
          </div>
          <div>
            <Link to="/admin" className="admin-dashboard-writer-page__back">
              ← Volver al panel
            </Link>
          </div>
        </div>

        {/* Formulario de Creación/Edición */}
        {activeTab === 'create' && (
          <form
            className="admin-dashboard__form"
            onSubmit={handleSubmit}
          >
            {editingWriterId && (
              <div className="admin-dashboard__edit-banner">
                <span>✏️ Editando: {firstName} {lastName}</span>
                <button type="button" onClick={handleCancelEdit} className="admin-dashboard__edit-banner-close">
                  Cancelar edición
                </button>
              </div>
            )}

            {/* Sección: Información Básica */}
            <div className="admin-dashboard__section">
              <h2 className="admin-dashboard__section-title">Información Básica</h2>

              <div className="admin-dashboard__row">
                <div className="admin-dashboard__field">
                  <label className="admin-dashboard__label" htmlFor="firstName">
                    Nombre
                  </label>
                  <input
                    className="admin-dashboard__input"
                    type="text"
                    id="firstName"
                    name="firstName"
                    placeholder="Ej: Gabriel"
                    value={firstName}
                    onChange={handleChange}
                  />
                </div>

                <div className="admin-dashboard__field">
                  <label className="admin-dashboard__label" htmlFor="lastName">
                    Apellido
                  </label>
                  <input
                    className="admin-dashboard__input"
                    type="text"
                    id="lastName"
                    name="lastName"
                    placeholder="Ej: García Márquez"
                    value={lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="admin-dashboard__row">
                <div className="admin-dashboard__field admin-dashboard__field--large">
                  <label className="admin-dashboard__label" htmlFor="titleBookQuote">
                    Cita del libro/Título
                  </label>
                  <input
                    className="admin-dashboard__input"
                    type="text"
                    id="titleBookQuote"
                    name="titleBookQuote"
                    placeholder="Ej: Cien años de soledad..."
                    value={titleBookQuote}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Sección: Categorización */}
            <div className="admin-dashboard__section">
              <h2 className="admin-dashboard__section-title">Categorización</h2>

              <div className="admin-dashboard__checkboxes">
                <label className="admin-dashboard__checkbox-label">
                  <input
                    type="checkbox"
                    name="recomended"
                    className="admin-dashboard__checkbox"
                    checked={recomended}
                    onChange={handleChange}
                  />
                  <span className="admin-dashboard__checkbox-text">Escritor Recomendado</span>
                </label>
              </div>
            </div>

            {/* Sección: Biografía */}
            <div className="admin-dashboard__section">
              <h2 className="admin-dashboard__section-title">Biografía</h2>

              <div className="admin-dashboard__field">
                <label className="admin-dashboard__label" htmlFor="bioQuote">
                  Cita biográfica
                </label>
                <textarea
                  className="admin-dashboard__textarea"
                  id="bioQuote"
                  name="bioQuote"
                  rows={3}
                  placeholder="Cita destacada del escritor..."
                  value={bioQuote}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-dashboard__field" style={{ marginTop: '16px' }}>
                <label className="admin-dashboard__label" htmlFor="bioDescription">
                  Descripción biográfica
                </label>
                <textarea
                  className="admin-dashboard__textarea"
                  id="bioDescription"
                  name="bioDescription"
                  rows={6}
                  placeholder="Biografía completa del escritor..."
                  value={bioDescription}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Mensajes de estado */}
            {submitStatus === 'success' && (
              <div className="form-alert form-alert--success">
                ✅ {editingWriterId ? 'Escritor actualizado exitosamente' : 'Escritor creado exitosamente'}
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="form-alert form-alert--error">
                ❌ Error al {editingWriterId ? 'actualizar' : 'crear'} el escritor. Intentá de nuevo.
              </div>
            )}

            <div className="admin-dashboard__actions">
              <button
                type="button"
                className="admin-dashboard__button admin-dashboard__button--secondary"
                onClick={editingWriterId ? handleCancelEdit : resetForm}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="admin-dashboard__button"
                disabled={isSubmitting}>
                {editingWriterId ? 'Guardar cambios' : 'Crear escritor'}
              </button>
            </div>
          </form>
        )}

        {/* Modo Edición - Búsqueda y Resultados */}
        {activeTab === 'edit' && (
          <div className="admin-dashboard__edit-mode">
            {/* Búsqueda por texto */}
            <div className="admin-dashboard__search-box">
              <label className="admin-dashboard__label" htmlFor="searchWriter">
                Buscar escritor para editar
              </label>
              <form
                className="admin-dashboard__search-row"
                onSubmit={handleSearchSubmit}>
                <input
                  className="admin-dashboard__input"
                  type="text"
                  id="searchWriter"
                  placeholder="Nombre o apellido..."
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

            {/*Botones de búsqueda por categoría */}
            <div className="admin-dashboard__category-filters">
              <h3 className="admin-dashboard__category-title">O buscar por categoría:</h3>
              <div className="admin-dashboard__category-buttons">
                <button
                  className={`admin-dashboard__category-btn ${activeCategory === 'viewAll' ? 'admin-dashboard__category-btn--active' : ''}`}
                  onClick={() => handleCategorySearch('viewAll')}
                >
                  📋 Ver todos
                </button>
                <button
                  className={`admin-dashboard__category-btn ${activeCategory === 'recomended' ? 'admin-dashboard__category-btn--active' : ''}`}
                  onClick={() => handleCategorySearch('recomended')}
                >
                  ⭐ Recomendados
                </button>

                <button
                  className="admin-dashboard__category-btn admin-dashboard__category-btn--clear"
                  onClick={() => {
                    setActiveCategory('all');
                    setWriterResults([]);
                    setErrorMsg('');
                  }}
                >
                  ❌ Limpiar filtros
                </button>
              </div>
            </div>

            {/* Mostrar categoría activa */}
            {activeCategory !== 'all' && writerResults.length > 0 && (
              <div className="admin-dashboard__active-filter">
                <span>Mostrando: </span>
                <strong>
                  {activeCategory === 'viewAll' && 'Todos los escritores'}
                  {activeCategory === 'recomended' && 'Recomendados'}
                </strong>
                <span> ({writerResults.length} {writerResults.length === 1 ? 'escritor' : 'escritores'})</span>
              </div>
            )}

            {writerResults.length === 0 ? (
              <div className="admin-dashboard__placeholder">
                <p>
                  {activeCategory !== 'all'
                    ? `No hay escritores en esta categoría`
                    : inputValue
                      ? `No se encontraron resultados`
                      : 'Realizá una búsqueda para encontrar escritores, seleccioná una categoría o ver todos'}
                </p>
              </div>
            ) : (
              <div className="admin-dashboard__results-grid">
                {writerResults.map((writer) => (
                  <div key={writer._id} className="admin-writer-card">
                    <div className="admin-writer-card__content">
                      <h3 className="admin-writer-card__name">{writer.firstName} {writer.lastName}</h3>
                      {writer.titleBookQuote && (
                        <p className="admin-writer-card__quote">"{writer.titleBookQuote}"</p>
                      )}

                      <div className="admin-writer-card__badges">
                        {writer.recomended && <span className="badge badge--recommended">Recomendado</span>}
                      </div>

                      {writer.bioDescription && (
                        <p className="admin-writer-card__bio">
                          {writer.bioDescription.length > 100
                            ? `${writer.bioDescription.substring(0, 100)}...`
                            : writer.bioDescription}
                        </p>
                      )}
                    </div>

                    <div className="admin-writer-card__actions">
                      <button
                        className="admin-writer-card__btn admin-writer-card__btn--edit"
                        onClick={() => handleEdit(writer)}
                      >
                        <span className="btn-icon">✏️</span>
                        Editar
                      </button>

                      {deleteConfirmId === writer._id ? (
                        <div className="admin-writer-card__confirm">
                          <span>¿Eliminar?</span>
                          <button
                            className="admin-writer-card__btn admin-writer-card__btn--confirm-yes"
                            onClick={() => handleDelete(writer._id)}
                          >
                            Sí
                          </button>
                          <button
                            className="admin-writer-card__btn admin-writer-card__btn--confirm-no"
                            onClick={() => setDeleteConfirmId(null)}
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          className="admin-writer-card__btn admin-writer-card__btn--delete"
                          onClick={() => setDeleteConfirmId(writer._id)}
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
