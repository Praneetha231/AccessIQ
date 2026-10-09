import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("role");

  console.log("[AdminRoute] token:",!!token, "role:", role); // DEBUG

  if (!token) return <Navigate to="/login" replace />;

  if (role!== "admin") {
    // Don't return null — show why it's blank!
    return (
      <div style={{padding:40}}>
        <h2>Access Denied</h2>
        <p>Your current role is: <b>{role || "no role"}</b></p>
        <p>You need admin role. Login as admin@accessiq.com</p>
        <p>Debug: token exists? {token? "Yes" : "No"}</p>
        <a href="/login">Go to Login</a>
      </div>
    );
  }
  return children;
}