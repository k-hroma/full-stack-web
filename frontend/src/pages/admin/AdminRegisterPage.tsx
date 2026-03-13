/**
 * AdminRegisterPage - Registro de nuevos administradores
 * Solo accesible para usuarios con rol 'admin'
 * Conecta con POST /auth/admin del backend
 * @module pages/admin/AdminRegisterPage
 */

import { useState, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerAdmin } from '../../api/auth';
import '../../styles/pages/admin/admin-register.css';

export default function AdminRegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Maneja cambios en los inputs del formulario
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
  };

  /**
   * Cierra el estado de success y vuelve al formulario
   */
  const handleCloseSuccess = () => {
    setSuccess(false);
  };

  /**
   * Navega de vuelta al panel admin
   */
  const handleGoToPanel = () => {
    navigate('/admin');
  };

  /**
   * Maneja el envío del formulario
   * Valida campos y crea nuevo administrador
   */
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.name || !formData.email || !formData.password) {
      setError('Completa todos los campos');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      await registerAdmin({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al crear administrador';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="admin-register-page">
        <div className="admin-register-page__container">
          <div className="admin-register-page__success">
            {/* Cruz para cerrar */}
            <button
              onClick={handleGoToPanel}
              className="admin-register-page__close"
              aria-label="Cerrar y volver al panel"
            >
              ×
            </button>

            <span className="admin-register-page__success-icon">✓</span>
            <h2>Administrador creado</h2>
            <p>El nuevo admin puede iniciar sesión con su email y contraseña.</p>

            <div className="admin-register-page__success-actions">
              <button
                onClick={handleCloseSuccess}
                className="admin-register-page__button admin-register-page__button--secondary"
              >
                Crear otro
              </button>

              <button
                onClick={handleGoToPanel}
                className="admin-register-page__button"
              >
                Volver al panel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-register-page">
      <div className="admin-register-page__container">
        <div className="admin-register-page__header">
          <h1 className="admin-register-page__title">Nuevo Administrador</h1>
          <Link to="/admin" className="admin-register-page__back">
            ← Volver al panel
          </Link>
        </div>

        {error && (
          <div className="admin-register-page__error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-register-page__form">
          <div className="admin-register-page__field">
            <label htmlFor="name" className="admin-register-page__label">
              Nombre completo
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Nombre del administrador"
              className="admin-register-page__input"
              autoComplete="name"
            />
          </div>

          <div className="admin-register-page__field">
            <label htmlFor="email" className="admin-register-page__label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="admin@ejemplo.com"
              className="admin-register-page__input"
              autoComplete="email"
            />
          </div>

          <div className="admin-register-page__field">
            <label htmlFor="password" className="admin-register-page__label">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Mínimo 6 caracteres, mayúscula, número, especial"
              className="admin-register-page__input"
              autoComplete="new-password"
            />
          </div>

          <div className="admin-register-page__field">
            <label htmlFor="confirmPassword" className="admin-register-page__label">
              Confirmar contraseña
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Repetir contraseña"
              className="admin-register-page__input"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="admin-register-page__button"
          >
            {isLoading ? 'Creando...' : 'Crear administrador'}
          </button>
        </form>
      </div>
    </div>
  );
}