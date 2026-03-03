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
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  /**
   * Valida la contraseña según reglas del backend
   * @param password - Contraseña a validar
   * @returns Array de mensajes de error (vacío si es válida)
   */
  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 6) errors.push('Mínimo 6 caracteres');
    if (!/[A-Z]/.test(password)) errors.push('Una mayúscula');
    if (!/[0-9]/.test(password)) errors.push('Un número');
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) errors.push('Un carácter especial');
    if (/\s/.test(password)) errors.push('Sin espacios');
    return errors;
  };

  /**
   * Maneja cambios en los inputs
   * Valida password en tiempo real cuando cambia
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setCredentials(prev => ({
        ...prev,
        [name]: value,
      }));

      if (name === 'password') {
        setPasswordErrors(validatePassword(value));
      }
    }

    if (error) setError(null);
  };

  /**
   * Maneja el envío del formulario
   * Valida todos los campos y registra el usuario
   */
  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

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
      await register(credentials);
      navigate('/login', { 
        replace: true,
        state: { message: 'Registro exitoso. Iniciá sesión.' }
      });
    } catch (err: unknown) {
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

    <form className="register-page__form" onSubmit={handleSubmit}>
      <div className="register-page__field">
        <label className="register-page__label" htmlFor="name">
          Nombre completo
        </label>
        <input
          className="register-page__input"
          type="text"
          id="name"
          name="name"
          value={credentials.name}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="Juan Pérez"
          autoComplete="name"
        />
      </div>

      <div className="register-page__field">
        <label className="register-page__label" htmlFor="email">
          Email
        </label>
        <input
          className="register-page__input"
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

      <div className="register-page__field">
        <label className="register-page__label" htmlFor="password">
          Contraseña
        </label>
        <input
          className="register-page__input"
          type="password"
          id="password"
          name="password"
          value={credentials.password}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="••••••••"
          autoComplete="new-password"
        />
        
        {credentials.password && (
          <ul className="register-page__password-requirements">
            <li className={`register-page__requirement ${passwordErrors.includes('Mínimo 6 caracteres') ? 'register-page__requirement--invalid' : 'register-page__requirement--valid'}`}>
              Mínimo 6 caracteres
            </li>
            <li className={`register-page__requirement ${passwordErrors.includes('Una mayúscula') ? 'register-page__requirement--invalid' : 'register-page__requirement--valid'}`}>
              Una mayúscula
            </li>
            <li className={`register-page__requirement ${passwordErrors.includes('Un número') ? 'register-page__requirement--invalid' : 'register-page__requirement--valid'}`}>
              Un número
            </li>
            <li className={`register-page__requirement ${passwordErrors.includes('Un carácter especial') ? 'register-page__requirement--invalid' : 'register-page__requirement--valid'}`}>
              Un carácter especial (!@#$...)
            </li>
            <li className={`register-page__requirement ${passwordErrors.includes('Sin espacios') ? 'register-page__requirement--invalid' : 'register-page__requirement--valid'}`}>
              Sin espacios
            </li>
          </ul>
        )}
      </div>

      <div className="register-page__field">
        <label className="register-page__label" htmlFor="confirmPassword">
          Confirmar contraseña
        </label>
        <input
          className="register-page__input"
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={confirmPassword}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="••••••••"
          autoComplete="new-password"
        />
        {confirmPassword && confirmPassword !== credentials.password && (
          <span className="register-page__match-error">Las contraseñas no coinciden</span>
        )}
      </div>

      <button 
        className="register-page__button" 
        type="submit" 
        disabled={isLoading || passwordErrors.length > 0}
      >
        {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>
    </form>

    <div className="register-page__footer">
      <span className="register-page__footer-text">¿Ya tenés cuenta?</span>
      <Link className="register-page__link" to="/login">
        Iniciá sesión
      </Link>
    </div>
  </div>
</div>
  );
}