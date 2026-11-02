import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    let redirectPath = null;
    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      if (!user || !allowedRoles.includes(user.role)) {
        redirectPath = user?.role === "Admin" ? "/admin" : "/dashboard";
      }
    } catch {
      redirectPath = "/login";
    }

    if (redirectPath) {
      return <Navigate to={redirectPath} replace />;
    }
  }

  return children;
}
