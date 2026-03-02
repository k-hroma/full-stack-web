
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
  const { login, isLoading, error: authError } = useAuth();

  // Estado del formulario
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });

  const [formError, setFormError] = useState<string | null>(null);

  // Manejar cambios en inputs
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar errores al escribir
    if (formError) setFormError(null);
  };

  // Enviar formulario
  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validación básica
    if (!credentials.email || !credentials.password) {
      setFormError('Completa todos los campos');
      return;
    }

    try {
      // ACÁ ES DONDE LLAMOS AL BACKEND. 
      //BE-> valida, setea cookies, devuelve JWT
      await login(credentials);

      // Redirigir: si venía de otra página, volver ahí. Si no, al home.
      const from = (location.state as { from?: string })?.from || '/';
      navigate(from, { replace: true });

    } catch (err) {
      console.log(err)
      // Error viene del backend (401, 400, etc.)
      setFormError('Credenciales inválidas');
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__container">
        <h1 className="login-page__title">Iniciar Sesión</h1>

        {/* Errores */}
        {(formError || authError) && (
          <div className="login-page__error" role="alert">
            {formError || authError}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="login-page__form">
          <div className="login-page__field">
            <label htmlFor="email" className="login-page__label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              disabled={isLoading}
              className="login-page__input"
              placeholder="tu@email.com"
              autoComplete="email"
            />
          </div>

          <div className="login-page__field">
            <label htmlFor="password" className="login-page__label">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              disabled={isLoading}
              className="login-page__input"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="login-page__submit"
          >
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        {/* Links */}
        <div className="login-page__links">
          <span>¿No tenés cuenta?</span>
          <Link to="/register" className="login-page__link">
            Crear cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}
