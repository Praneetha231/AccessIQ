import { Navigate } from 'react-router-dom';

export default function AdminRoute({ children }) {
  const userEmail = localStorage.getItem('userEmail');
  const isAdmin = localStorage.getItem('isAdmin') === 'true'; // Or check backend role

  // If not logged in or not an admin, redirect to login/dashboard
  if (!userEmail) {
    return <Navigate to="/" replace />;
  }

  return children;
}