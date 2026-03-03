/**
 * AdminRegisterPage - Registro de nuevos administradores
 * Solo accesible para usuarios con rol 'admin'
 * Conecta con POST /auth/admin del backend
 * @module pages/admin/AdminRegisterPage
 */

import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { registerAdmin } from '../../api/auth';

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
   * Maneja el envío del formulario
   * Valida campos y crea nuevo administrador
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
      <div>
        <div>
          <h2>✓ Administrador creado</h2>
          <p>El nuevo admin puede iniciar sesión con su email y contraseña.</p>
          <button onClick={() => setSuccess(false)}>
            Crear otro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <h1>Nuevo Administrador</h1>
        <Link to="/admin">
          ← Volver al panel
        </Link>
      </div>

      {error && (
        <div role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">
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
          />
        </div>

        <div>
          <label htmlFor="email">
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
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="Mínimo 6 caracteres, mayúscula, número, especial"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword">
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
          />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Creando...' : 'Crear administrador'}
        </button>
      </form>
    </div>
  );
}