/**
 * AdminLayout - Layout del panel de administración
 * @module components/layout/AdminLayout
 */

import { Outlet } from 'react-router-dom';
import '../../styles/layout/admin-layout.css'
import AdminAside from './AdminAside';
import ScrollToTop from '../common/ScrollToTop';

export function AdminLayout() {


  return (
    <div className='admin-layout'>
      <ScrollToTop />
      <AdminAside />
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}