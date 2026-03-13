import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/layout/admin-layout.css'

export default function AdminAside() {
  const { logout, user } = useAuth();
  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">Panel Admin</div>
      <nav className="admin-nav">
        <Link to="/admin">Dashboard</Link>
        <Link to="/admin/register-admin">Nuevo Admin</Link>
        <Link to="/">← Volver a la tienda</Link>
      </nav>
      <div className="admin-user">
        <span>{user?.name}</span>
        <button onClick={logout}>Cerrar sesión</button>
      </div>
    </aside>
  )
}
