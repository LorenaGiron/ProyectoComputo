import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { hasPageAccess } from "../utils/permissionMapper";

const ROLE_PERMISSIONS = {
  "role_admin": [
    "dashboard", "productos", "recepciones", "ventas",
    "clientes", "proveedores", "usuarios", "auditoria", "inventario"
  ],
  "ADMIN": [
    "dashboard", "productos", "recepciones", "ventas",
    "clientes", "proveedores", "usuarios", "auditoria", "roles", "inventario"
  ],
  "GERENTE": [
    "dashboard", "productos", "recepciones", "ventas",
    "clientes", "proveedores", "usuarios", "auditoria", "roles", "inventario"
  ],
  "BODEGUERO": [
    "productos", "recepciones", "ventas", "clientes", "proveedores", "inventario"
  ],
  "VENDEDOR": [
    "productos", "ventas", "clientes"
  ],
  "CLIENTE": [
    "tienda"
  ]
};

export function useProtectedRoute(requiredPage) {
  const { token, usuario } = useContext(AuthContext);

  if (!token || !usuario) {
    return { isAuthorized: false, reason: "no-session" };
  }

  const userRole = usuario?.roleId || usuario?.role;

  if (!userRole) {
    return { isAuthorized: false, reason: "no-role" };
  }

  // ✅ Estático PRIMERO — cubre páginas nuevas como inventario
  const allowedPages = ROLE_PERMISSIONS[userRole] || [];
  if (allowedPages.includes(requiredPage)) {
    return { isAuthorized: true, userRole };
  }

  // Dinámico como segunda opción
  if (Array.isArray(usuario?.permissions) && usuario.permissions.length > 0) {
    const hasAccess = hasPageAccess(usuario.permissions, requiredPage);
    if (hasAccess) {
      return { isAuthorized: true, userRole };
    }
  }

  return { isAuthorized: false, reason: "insufficient-permissions", userRole };
}

export const ROLE_PERMISSIONS_EXPORT = ROLE_PERMISSIONS;