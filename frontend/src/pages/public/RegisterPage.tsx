/**
 * RegisterPage - Página de registro de usuarios
 * Conecta con POST /auth/register del backend
 * @module pages/public/RegisterPage
 */

import { useState, type SubmitEvent, type ChangeEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../api';
import type { RegisterCredentials } from '../../types';
import '../../styles/pages/public/register.css'

export default function RegisterPage() {
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState<RegisterCredentials>({
    name: '',
    email: '',
    password: '',
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validación de password en tiempo real
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 6) errors.push('Mínimo 6 caracteres');
    if (!/[A-Z]/.test(password)) errors.push('Una mayúscula');
    if (!/[0-9]/.test(password)) errors.push('Un número');
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) errors.push('Un carácter especial');
    if (/\s/.test(password)) errors.push('Sin espacios');
    return errors;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setCredentials(prev => ({
        ...prev,
        [name]: value,
      }));

      // Validar password en tiempo real
      if (name === 'password') {
        setPasswordErrors(validatePassword(value));
      }
    }

    if (error) setError(null);
  };

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!credentials.name || !credentials.email || !credentials.password) {
      setError('Completa todos los campos');
      return;
    }

    if (passwordErrors.length > 0) {
      setError('La contraseña no cumple los requisitos');
      return;
    }

    if (credentials.password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      // ACÁ SE CONECTA CON TU BACKEND:
      // POST /auth/register
      // Tu backend valida con Zod, hashea password, crea usuario
      await register(credentials);

      // Registro exitoso → redirigir al login o auto-login
      navigate('/login', { 
        replace: true,
        state: { message: 'Registro exitoso. Iniciá sesión.' }
      });

    } catch (err:unknown ) {
      // Error del backend (409 = email duplicado, 400 = datos inválidos)
      const errorMessage = err instanceof Error ? err.message : 'Error al registrarse';
      
      if (errorMessage.includes('duplicate') || errorMessage.includes('already')) {
        setError('Este email ya está registrado');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-page__container">
        <h1 className="register-page__title">Crear Cuenta</h1>

        {error && (
          <div className="register-page__error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-page__form">
          <div className="register-page__field">
            <label htmlFor="name" className="register-page__label">
              Nombre completo
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={credentials.name}
              onChange={handleChange}
              disabled={isLoading}
              className="register-page__input"
              placeholder="Juan Pérez"
              autoComplete="name"
            />
          </div>

          <div className="register-page__field">
            <label htmlFor="email" className="register-page__label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              disabled={isLoading}
              className="register-page__input"
              placeholder="tu@email.com"
              autoComplete="email"
            />
          </div>

          <div className="register-page__field">
            <label htmlFor="password" className="register-page__label">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              disabled={isLoading}
              className={`register-page__input ${
                passwordErrors.length > 0 && credentials.password 
                  ? 'register-page__input--error' 
                  : ''
              }`}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            
            {/* Requisitos de password */}
            {credentials.password && (
              <ul className="register-page__requirements">
                <li className={passwordErrors.includes('Mínimo 6 caracteres') ? 'invalid' : 'valid'}>
                  Mínimo 6 caracteres
                </li>
                <li className={passwordErrors.includes('Una mayúscula') ? 'invalid' : 'valid'}>
                  Una mayúscula
                </li>
                <li className={passwordErrors.includes('Un número') ? 'invalid' : 'valid'}>
                  Un número
                </li>
                <li className={passwordErrors.includes('Un carácter especial') ? 'invalid' : 'valid'}>
                  Un carácter especial (!@#$...)
                </li>
                <li className={passwordErrors.includes('Sin espacios') ? 'invalid' : 'valid'}>
                  Sin espacios
                </li>
              </ul>
            )}
          </div>

          <div className="register-page__field">
            <label htmlFor="confirmPassword" className="register-page__label">
              Confirmar contraseña
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
              className={`register-page__input ${
                confirmPassword && confirmPassword !== credentials.password 
                  ? 'register-page__input--error' 
                  : ''
              }`}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            {confirmPassword && confirmPassword !== credentials.password && (
              <span className="register-page__hint">Las contraseñas no coinciden</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || passwordErrors.length > 0}
            className="register-page__submit"
          >
            {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <div className="register-page__links">
          <span>¿Ya tenés cuenta?</span>
          <Link to="/login" className="register-page__link">
            Iniciá sesión
          </Link>
        </div>
      </div>
    </div>
  );
}