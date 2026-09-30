import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Auth from './Auth';
import Dashboard from './components/Dashboard';

// Admin Imports
import AdminLayout from './admin/layout/AdminLayout';
import AdminRoute from "./admin/routes/AdminRoute";
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminLogin from './admin/pages/AdminLogin';
import UserManagement from './admin/pages/UserManagement';
import SystemLogs from './admin/pages/SystemLogs';

export default function App() {
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || null);
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');

  const handleLoginSuccess = (email) => {
    localStorage.setItem('userEmail', email);
    localStorage.setItem('email', email);
    setUserEmail(email);
  };

  const handleSignOut = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('email');
    setUserEmail(null);
  };

  const handleAdminLogin = () => {
    localStorage.setItem('isAdmin', 'true');
    setIsAdmin(true);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('isAdmin');
    setIsAdmin(false);
  };

  return (
    <Routes>
      <Route 
        path="/*" 
        element={
          <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
            {!userEmail ? (
              <Auth onLoginSuccess={handleLoginSuccess} />
            ) : (
              <Dashboard userEmail={userEmail} onSignOut={handleSignOut} />
            )}
          </div>
        } 
      />

      <Route 
        path="/admin/login" 
        element={<AdminLogin onAdminLogin={handleAdminLogin} />} 
      />
      
      <Route 
        path="/admin" 
        element={
          <AdminRoute isAdmin={isAdmin}>
            <AdminLayout onAdminLogout={handleAdminLogout} />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="logs" element={<SystemLogs />} />
      </Route>
    </Routes>
  );
}