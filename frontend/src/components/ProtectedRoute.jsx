import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { useProtectedRoute } from "../hooks/useProtectedRoute";

export default function ProtectedRoute({ 
  children, 
  requiredPage,
  redirectTo = "/login"
}) {
  const { token } = useContext(AuthContext);
  const { isAuthorized, reason, userRole } = useProtectedRoute(requiredPage);

  // No hay sesión
  if (!token) {
    return <Navigate to={redirectTo} replace />;
  }

  // No hay autorización
  if (!isAuthorized) {
    if (reason === "insufficient-permissions") {
      // Redirigir a página apropiada según el rol
      if (userRole === "CLIENTE") {
        return <Navigate to="/tienda" replace />;
      }
      // Para otros roles, redirigir a dashboard
      return <Navigate to="/dashboard" replace />;
    }
    
    // Otros casos: login
    return <Navigate to={redirectTo} replace />;
  }

  // Autorizado
  return children;
}
