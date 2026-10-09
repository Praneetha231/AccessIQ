import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./Auth.jsx";
import Register from "./Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AdminDashboard from "./admin/pages/AdminDashboard.jsx";

function ProtectedRoute({ children, adminOnly = false }) {
  const email = localStorage.getItem("email");
  const role = localStorage.getItem("role");
  if (!email) return <Navigate to="/" replace />;
  if (adminOnly && email !== "admin@accessiq.com" && role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}