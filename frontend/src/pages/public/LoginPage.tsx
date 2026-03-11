/**
 * LoginPage - Página de inicio de sesión
 * Conecta con POST /auth/login del backend
 * @module pages/public/LoginPage
 */

import { useState, type SubmitEvent, type ChangeEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { LoginCredentials } from '../../types';
import '../../styles/pages/public/login.css'

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading} = useAuth();

  // Estado del formulario
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });

  const [formError, setFormError] = useState<string | null>(null);

  /**
   * Maneja cambios en los inputs del formulario
   * Actualiza el estado de credenciales y limpia errores
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value,
    }));
    if (formError) setFormError(null);
  };

  /**
   * Maneja el envío del formulario
   * Valida campos, llama a login y redirige al origen o home
   */
  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    if (!credentials.email || !credentials.password) {
      setFormError('Completa todos los campos');
      return;
    }

    try {
      await login(credentials);
      const from = (location.state as { from?: string })?.from || '/';
      navigate(from, { replace: true });
    } catch (err) {
     const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setFormError(message);
    }
  };

  return (
    <div className="login-page">
    <div className="login-page__container">
    <h1 className="login-page__title">Iniciar Sesión</h1>

    {(formError) && (
      <div className="login-page__error" role="alert">
        {formError}
      </div>
    )}

    <form className="login-page__form" onSubmit={handleSubmit}>
      <div className="login-page__field">
        <label className="login-page__label" htmlFor="email">
          Email
        </label>
        <input
          className="login-page__input"
          type="email"
          id="email"
          name="email"
          value={credentials.email}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="tu@email.com"
          autoComplete="email"
        />
      </div>

      <div className="login-page__field">
        <label className="login-page__label" htmlFor="password">
          Contraseña
        </label>
        <input
          className="login-page__input"
          type="password"
          id="password"
          name="password"
          value={credentials.password}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </div>

      <button 
        className="login-page__button" 
        type="submit" 
        disabled={isLoading}
      >
        {isLoading ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>

    <div className="login-page__footer">
      <span className="login-page__footer-text">¿No tenés cuenta?</span>
      <Link className="login-page__link" to="/register">
        Crear cuenta
      </Link>
    </div>
  </div>
</div>
  );
}