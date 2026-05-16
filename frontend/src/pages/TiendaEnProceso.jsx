import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function TiendaEnProceso() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-oscuro to-oscuro/80 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Icono */}
        <div className="mb-6 text-6xl">
          <i className="bi bi-tools text-lila"></i>
        </div>

        {/* Título */}
        <h1 className="text-3xl md:text-4xl font-bold text-blanco mb-4">
          Tienda en Construcción
        </h1>

        {/* Descripción */}
        <p className="text-lila-soft text-base md:text-lg mb-8">
          Estamos trabajando para ofrecerte la mejor experiencia de compra. 
          Por favor, intenta más tarde.
        </p>

        {/* Decoración */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 text-lila">
            <i className="bi bi-arrow-repeat animate-spin"></i>
            <span className="text-sm">Mejoras en progreso</span>
          </div>
        </div>

        {/* Botón Logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-lila hover:bg-lila/80 text-oscuro font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <i className="bi bi-box-arrow-right"></i>
          Cerrar Sesión
        </button>

        {/* Footer */}
        <p className="text-lila-soft/50 text-xs mt-8">
          © 2026 ProyectoComputo. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
