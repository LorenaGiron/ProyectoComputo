import { useState } from "react";
import HeaderTienda from "../components/tienda/HeaderTienda";
import FooterTienda from "../components/tienda/FooterTienda";
import BarraAnuncios from "../components/tienda/BarraAnuncios";
import HeroCarrusel from "../components/tienda/HeroCarrusel";
import RielCategorias from "../components/tienda/RielCategorias";
import FiltrosSidebar from "../components/tienda/FiltrosSidebar";
import BarraOrdenamiento from "../components/tienda/BarraOrdenamiento";

const filtrosIniciales = {
  precioMax:    2000,
  departamento: "",
  tallas:       [],
  soloEnStock:  false,
};

export default function Tienda() {
  const [busqueda, setBusqueda]               = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("todas");
  const [ordenamiento, setOrdenamiento]       = useState("relevancia");
  const [vista, setVista]                     = useState("grid");
  const [filtros, setFiltros]                 = useState(filtrosIniciales);

  const setFiltro = (key, value) => setFiltros((f) => ({ ...f, [key]: value }));
  const limpiarFiltros = () => setFiltros(filtrosIniciales);

  return (
    <div className="min-h-screen bg-oscuro">

      <BarraAnuncios />

      <HeaderTienda
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        cantidadCarrito={0}
        cantidadWishlist={0}
        onAbrirCarrito={() => {}}
        categoriaActiva={categoriaActiva}
        onSeleccionarCategoria={setCategoriaActiva}
      />

      <HeroCarrusel />

      {/* Catálogo */}
      <section className="max-w-[1480px] mx-auto px-6 lg:px-10 mt-10">

        <RielCategorias
          categoriaActiva={categoriaActiva}
          onSeleccionarCategoria={setCategoriaActiva}
        />

        <div className="flex gap-6">

          <FiltrosSidebar
            filtros={filtros}
            setFiltro={setFiltro}
            onLimpiar={limpiarFiltros}
          />

          <div className="flex-1 min-w-0">

            <BarraOrdenamiento
              total={0}
              ordenamiento={ordenamiento}
              setOrdenamiento={setOrdenamiento}
              vista={vista}
              setVista={setVista}
            />

            {/* Aquí irán las TarjetaProductoTienda */}

          </div>
        </div>
      </section>

      <FooterTienda />

      {/* Aquí irá CarritoDrawer */}

      {/* Aquí irá VistaRapida */}

      {/* Aquí irá ModalCheckout */}

    </div>
  );
}
