/**
 * AdminRegisterPage - Registro de nuevos administradores
 * Solo accesible para usuarios con rol 'admin'
 * Conecta con POST /auth/admin del backend
 * @module pages/admin/AdminRegisterPage
 */

import { useState, type SubmitEvent, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { registerAdmin } from '../../api/auth';
import '../../styles/pages/admin/admin-register.css'

export default function AdminRegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validaciones
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
      // ACÁ SE CONECTA CON TU BACKEND:
      // POST /auth/admin (requiere JWT de admin en header)
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
        <div className="admin-register-page__success">
          <h2>✓ Administrador creado</h2>
          <p>El nuevo admin puede iniciar sesión con su email y contraseña.</p>
          <button 
            onClick={() => setSuccess(false)}
            className="admin-register-page__button"
          >
            Crear otro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-register-page">
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
            className="admin-register-page__input"
            placeholder="Nombre del administrador"
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
            className="admin-register-page__input"
            placeholder="admin@ejemplo.com"
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
            className="admin-register-page__input"
            placeholder="Mínimo 6 caracteres, mayúscula, número, especial"
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
            className="admin-register-page__input"
            placeholder="Repetir contraseña"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="admin-register-page__submit"
        >
          {isLoading ? 'Creando...' : 'Crear administrador'}
        </button>
      </form>
    </div>
  );
}