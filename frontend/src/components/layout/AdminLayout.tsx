/**
 * AdminLayout - Layout del panel de administración
 * @module components/layout/AdminLayout
 */

import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function AdminLayout() {
  const { logout, user } = useAuth();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">Panel Admin</div>
        <nav className="admin-nav">
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/books">Gestión de Libros</Link>
          <Link to="/">← Volver a la tienda</Link>
        </nav>
        <div className="admin-user">
          <span>{user?.name}</span>
          <button onClick={logout}>Cerrar sesión</button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />  {/* Acá se renderizan las páginas admin */}
      </main>
    </div>
  );
}