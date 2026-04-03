/**
 * AdminLayout - Layout del panel de administración
 * @module components/layout/AdminLayout
 */

import { Outlet } from 'react-router-dom';
import { ScrollToTop } from '../common/ScrollToTop';
import '../../styles/layout/admin-layout.css'


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