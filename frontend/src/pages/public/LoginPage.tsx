/**
 * LoginPage - Página de inicio de sesión
 * Conecta con POST /auth/login del backend
 * @module pages/public/LoginPage
 */

import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { LoginCredentials } from '../../types';

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
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
    } catch {
      setFormError('Credenciales inválidas');
    }
  };

  return (
    <div>
      <div>
        <h1>Iniciar Sesión</h1>

        {(formError || authError) && (
          <div role="alert">
            {formError || authError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">
              Email
            </label>
            <input
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

          <div>
            <label htmlFor="password">
              Contraseña
            </label>
            <input
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

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div>
          <span>¿No tenés cuenta?</span>
          <Link to="/register">
            Crear cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}