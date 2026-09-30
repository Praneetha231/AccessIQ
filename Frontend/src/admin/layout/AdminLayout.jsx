// src/admin/layout/AdminLayout.jsx
import { Outlet } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <AdminNavbar />
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}