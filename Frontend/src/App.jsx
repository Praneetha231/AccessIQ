import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Auth from "./Auth.jsx"
import Register from "./Register.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import AdminDashboard from "./admin/pages/AdminDashboard.jsx"
import AdminLogin from "./admin/pages/AdminLogin.jsx"
import AdminRoute from "./admin/routes/AdminRoute.jsx"

function ProtectedUser({children}){ 
  const email=localStorage.getItem("email"); 
  return email? children : <Navigate to="/login" replace /> 
}

export default function App(){
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Register />} />
        
        {/* User protected area - Dashboard handles Inbox, Alerts, LoginHistory, Settings via sidebar */}
        <Route path="/dashboard" element={<ProtectedUser><Dashboard /></ProtectedUser>} />
        <Route path="/dashboard/*" element={<ProtectedUser><Dashboard /></ProtectedUser>} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}