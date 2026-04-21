import { Link } from 'react-router-dom';
import '../../styles/pages/admin/admin-dashboard.css';

export default function AdminDashboardPage() {
  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__header">
        <Link to='/admin/dashboard-books' className='link-dashboard'><h1 className="admin-dashboard__title">Gestión de Libros</h1></Link>
        <Link to='/admin/dashboard-writers' className='link-dashboard'><h1 className="admin-dashboard__title">Gestión de Escritores</h1></Link>
        <Link to='/admin/register-admin' className='link-dashboard'><h1 className="admin-dashboard__title">Gestión de Usuarios</h1></Link>
      </div>
    </div>
  );
}