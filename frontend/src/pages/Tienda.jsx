import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import HeaderTienda from "../components/tienda/HeaderTienda";
import FooterTienda from "../components/tienda/FooterTienda";
import BarraAnuncios from "../components/tienda/BarraAnuncios";
import HeroCarrusel from "../components/tienda/HeroCarrusel";
import RielCategorias from "../components/tienda/RielCategorias";
import FiltrosSidebar from "../components/tienda/FiltrosSidebar";
import BarraOrdenamiento from "../components/tienda/BarraOrdenamiento";
import TarjetaProductoTienda from "../components/tienda/TarjetaProductoTienda";
import { productosSimulados } from "../components/tienda/datosSimulados";
import useTitulo from "../hooks/useTitulo";

const filtrosIniciales = {
  precioMax:    2000,
  departamento: "",
  tallas:       [],
  soloEnStock:  false,
};

export default function Tienda() {
  useTitulo("Tienda");

  const navigate = useNavigate();
  const [busqueda, setBusqueda]               = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("todas");
  const [ordenamiento, setOrdenamiento]       = useState("relevancia");
  const [vista, setVista]                     = useState("grid");
  const [filtros, setFiltros]                 = useState(filtrosIniciales);

  const setFiltro = (key, value) => setFiltros((f) => ({ ...f, [key]: value }));
  const limpiarFiltros = () => setFiltros(filtrosIniciales);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  const productosFiltrados = useMemo(() => {
    let lista = [...productosSimulados];

    // Filtro por categoría
    if (categoriaActiva !== "todas") {
      lista = lista.filter((p) => p.categoria === categoriaActiva);
    }

    // Filtro por búsqueda
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.categoria.toLowerCase().includes(q) ||
          p.marca?.toLowerCase().includes(q)
      );
    }

    // Filtro por precio
    lista = lista.filter((p) => p.precioVenta <= filtros.precioMax);

    // Filtro por departamento
    if (filtros.departamento) {
      lista = lista.filter((p) => p.departamento === filtros.departamento);
    }

    // Filtro por tallas
    if (filtros.tallas.length > 0) {
      lista = lista.filter((p) =>
        p.inventario.some((i) => filtros.tallas.includes(i.talla) && i.stock > 0)
      );
    }

    // Filtro solo en stock
    if (filtros.soloEnStock) {
      lista = lista.filter((p) => p.stock > 0);
    }

    // Ordenamiento
    switch (ordenamiento) {
      case "precio_asc":
        lista.sort((a, b) => a.precioVenta - b.precioVenta);
        break;
      case "precio_desc":
        lista.sort((a, b) => b.precioVenta - a.precioVenta);
        break;
      case "nombre_asc":
        lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case "nombre_desc":
        lista.sort((a, b) => b.nombre.localeCompare(a.nombre));
        break;
      default:
        break;
    }

    return lista;
  }, [categoriaActiva, busqueda, filtros, ordenamiento]);

  const clasesGrid =
    vista === "lista"
      ? "grid-cols-1"
      : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";

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
        onLogout={handleLogout}
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
              total={productosFiltrados.length}
              ordenamiento={ordenamiento}
              setOrdenamiento={setOrdenamiento}
              vista={vista}
              setVista={setVista}
            />

            {productosFiltrados.length === 0 ? (
              <div className="bg-bg-card border border-lila/10 rounded-2xl py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-lila/10 mx-auto flex items-center justify-center mb-3">
                  <i className="bi bi-search text-2xl text-lila" />
                </div>
                <p className="text-base font-bold text-blanco">Sin coincidencias</p>
                <p className="text-sm text-text-muted mt-1">
                  Prueba con otros filtros o categorías
                </p>
                <button
                  onClick={limpiarFiltros}
                  className="mt-4 bg-lila text-oscuro font-bold px-5 py-2 rounded-lg text-sm hover:bg-lila-soft transition"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className={`grid ${clasesGrid} gap-4`}>
                {productosFiltrados.map((producto) => (
                  <TarjetaProductoTienda
                    key={producto.id}
                    producto={producto}
                    vista={vista}
                  />
                ))}
              </div>
            )}

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
