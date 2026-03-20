/**
 * AdminLayout - Layout del panel de administración
 * @module components/layout/AdminLayout
 */

import { Outlet } from 'react-router-dom';
import '../../styles/layout/admin-layout.css'
import ScrollToTop from '../common/ScrollToTop';


export function AdminLayout() {
  return (
    <div className='admin-layout'>
      <ScrollToTop />
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}