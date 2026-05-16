import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { hasPageAccess } from "../utils/permissionMapper";

// Mapeo de roles a páginas accesibles (LEGACY - para fallback)
const ROLE_PERMISSIONS = {
  "role_admin": [
    "dashboard",
    "productos",
    "recepciones",
    "clientes",
    "proveedores",
    "usuarios",
    "auditoria"
  ],
  "GERENTE": [
    "dashboard",
    "productos",
    "recepciones",
    "clientes",
    "proveedores",
    "usuarios",
    "auditoria"
  ],
  "BODEGUERO": [
    "productos",
    "recepciones",
    "clientes",
    "proveedores"
  ],
  "VENDEDOR": [
    "productos",
    "clientes"
  ],
  "CLIENTE": [
    "tienda"
  ]
};

export function useProtectedRoute(requiredPage) {
  const { token, usuario } = useContext(AuthContext);

  // Verificar si hay sesión
  if (!token || !usuario) {
    return { isAuthorized: false, reason: "no-session" };
  }

  // Obtener rol del usuario - Usar roleId primero (ej: "role_admin"), luego role como fallback
  const userRole = usuario?.roleId || usuario?.role;
  
  if (!userRole) {
    return { isAuthorized: false, reason: "no-role" };
  }

  // Primero intenta usar permisos dinámicos del usuario
  if (Array.isArray(usuario?.permissions) && usuario.permissions.length > 0) {
    const hasAccess = hasPageAccess(usuario.permissions, requiredPage);
    if (hasAccess) {
      return { isAuthorized: true, userRole };
    }
    return { isAuthorized: false, reason: "insufficient-permissions", userRole };
  }

  // Fallback a mapeo estático si no hay permisos dinámicos
  const allowedPages = ROLE_PERMISSIONS[userRole] || [];
  
  if (!allowedPages.includes(requiredPage)) {
    return { isAuthorized: false, reason: "insufficient-permissions", userRole };
  }

  return { isAuthorized: true, userRole };
}

export const ROLE_PERMISSIONS_EXPORT = ROLE_PERMISSIONS;
