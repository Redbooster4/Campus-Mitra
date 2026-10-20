import { Navigate } from "react-router-dom";
export default function ProtectedRoute({ children, allowedRoles }){
    const token=localStorage.getItem("token");
    if(!token){
        return <Navigate to="/login" replace/>
    }
    if (allowedRoles && allowedRoles.length > 0) {
        try {
            const storedUser = localStorage.getItem("user");
            const user = storedUser ? JSON.parse(storedUser) : null;
            if(!user || !allowedRoles.includes(user.role)) {
                return <Navigate to="/dashboard" replace />;
            }
        } 
        catch{
            return <Navigate to="/login" replace />;
        }
    }

    return children;
}