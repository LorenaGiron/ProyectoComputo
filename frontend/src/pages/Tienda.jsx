import { useState } from "react";
import HeaderTienda from "../components/tienda/HeaderTienda";
import FooterTienda from "../components/tienda/FooterTienda";

export default function Tienda() {
  const [busqueda, setBusqueda]               = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("todas");

  return (
    <div className="min-h-screen bg-oscuro">

      {/* Aquí irá BarraAnuncios */}

      <HeaderTienda
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        cantidadCarrito={0}
        cantidadWishlist={0}
        onAbrirCarrito={() => {}}
        categoriaActiva={categoriaActiva}
        onSeleccionarCategoria={setCategoriaActiva}
      />

      {/* Aquí irá HeroCarrusel */}

      {/* Aquí irá BandaConfianza */}

      {/* Catálogo */}
      <section className="max-w-[1480px] mx-auto px-6 lg:px-10 mt-10">

        {/* Aquí irá RielCategorias */}

        <div className="flex gap-6">

          {/* Aquí irá FiltrosSidebar */}

          <div className="flex-1 min-w-0">

            {/* Aquí irá BarraOrdenamiento */}

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
