
/**
 * LoginPage - Página de inicio de sesión
 * Conecta con POST /auth/login del backend
 * @module pages/public/LoginPage
 */

import { useState, type FormEvent, type ChangeEvent } from 'react';
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
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validación básica
    if (!credentials.email || !credentials.password) {
      setFormError('Completa todos los campos');
      return;
    }

    try {
      // ACÁ SE CONECTA CON TU BACKEND:
      // POST http://localhost:3000/auth/login
      // Tu backend valida, setea cookies, devuelve JWT
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
          <Link to="/" className="login-page__link">
            ← Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  );
}
