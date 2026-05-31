import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { userCanAccessDashboard } from "../utils/roleChecker";
import PerfilUsuario from "../components/PerfilUsuario";
import PerfilCliente from "../components/PerfilCliente";
import Encabezado from "../components/Encabezado";
import HeaderTienda from "../components/tienda/HeaderTienda";
import FooterTienda from "../components/tienda/FooterTienda";
import Layout from "../components/Layout";
import useTitulo from "../hooks/useTitulo";

export default function Perfil() {
  useTitulo("Perfil");
  const { usuario, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const esAdmin = userCanAccessDashboard(usuario);

  const [busqueda, setBusqueda] = useState("");

  const handleVolver = () => {
    navigate(esAdmin ? "/dashboard" : "/tienda");
  };

  const handleBuscar = () => {
    navigate(`/tienda?busqueda=${encodeURIComponent(busqueda)}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleIrAlDashboard = () => {
    navigate("/dashboard");
  };

  if (esAdmin) {
    return (
      <Layout>
        <div className="p-6 lg:p-8 space-y-6">
          <Encabezado titulo="Mi Perfil" />
          <PerfilUsuario usuario={usuario} />
        </div>
      </Layout>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-oscuro">
      <HeaderTienda
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        onBuscar={handleBuscar}
        cantidadCarrito={0}
        cantidadWishlist={0}
        onAbrirCarrito={() => {}}
        categoriaActiva=""
        onSeleccionarCategoria={() => {}}
        onLogout={handleLogout}
        usuario={usuario}
        onIrAlDashboard={handleIrAlDashboard}
      />

      <main className="flex-1 max-w-[1480px] mx-auto px-6 lg:px-10 py-8 w-full">
        <button
          onClick={handleVolver}
          className="flex items-center gap-2 text-lila hover:text-lila-mid transition mb-6"
        >
          <i className="bi bi-arrow-left text-lg" />
          <span className="text-sm font-semibold">Volver a la tienda</span>
        </button>

        <PerfilCliente usuario={usuario} />
      </main>

      <FooterTienda />
    </div>
  );
}
