import { Navigate } from "react-router-dom"
const ADMIN_EMAILS = ["admin@accessiq.com", "praneethadukkipati@gmail.com"]
export default function AdminRoute({children}){
  const email = localStorage.getItem("email")?.toLowerCase()
  const role = localStorage.getItem("role")
  if(!email) return <Navigate to="/admin/login" replace />
  if(!ADMIN_EMAILS.includes(email)) return <Navigate to="/login" replace />
  if(role!=="admin") return <Navigate to="/admin/login" replace />
  return children
}