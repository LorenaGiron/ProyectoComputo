import { useState, useEffect, useRef } from "react";
import { userCanAccessDashboard } from "../../utils/roleChecker";

const categorias = [
  { id: "todas",      label: "Todas"      },
  { id: "Playeras",   label: "Playeras"   },
  { id: "Blusas",     label: "Blusas"     },
  { id: "Camisas",    label: "Camisas"    },
  { id: "Suéteres",   label: "Suéteres"   },
  { id: "Sudaderas",  label: "Sudaderas"  },
  { id: "Chamarras",  label: "Chamarras"  },
  { id: "Abrigos",    label: "Abrigos"    },
  { id: "Vestidos",   label: "Vestidos"   },
  { id: "Faldas",     label: "Faldas"     },
  { id: "Shorts",     label: "Shorts"     },
  { id: "Pantalones", label: "Pantalones" },
  { id: "Calzado",    label: "Calzado"    },
  { id: "Accesorios", label: "Accesorios" },
];

export default function HeaderTienda({
  busqueda,
  setBusqueda,
  onBuscar,
  cantidadCarrito,
  cantidadWishlist,
  onAbrirCarrito,
  categoriaActiva,
  onSeleccionarCategoria,
  onLogout,
  usuario,
  onIrAlDashboard,
}) {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 60) {
        setVisible(true);
      } else if (currentY > lastScrollY.current) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-40 bg-oscuro/95 backdrop-blur-md border-b border-lila/10 transition-transform duration-300 md:translate-y-0 ${visible ? "translate-y-0" : "-translate-y-full"}`}>

      {/* Barra superior */}
      <div className="max-w-[1480px] mx-auto px-6 lg:px-10 py-4 flex flex-col md:grid md:grid-cols-[auto_1fr_auto] items-center gap-3 md:gap-6">

        {/* Móvil: logo centrado */}
        <div className="w-full flex flex-col items-center gap-2 md:contents">

          {/* Logo */}
          <div className="flex items-baseline gap-2">
            <h1
              className="text-4xl text-lila tracking-tight leading-none drop-shadow-[0_0_18px_rgba(231,214,255,0.25)]"
              style={{ fontFamily: "'Cinzel Decorative', serif" }}
            >
              AURA
            </h1>
            <span className="text-[10px] tracking-[4px] text-lila-mid uppercase">Boutique</span>
          </div>

          {/* Iconos de acción — solo visibles en móvil aquí */}
          <div className="flex items-center gap-2 md:hidden">

          {/* Mi cuenta */}
          <button
            className="w-10 h-10 rounded-full text-lila hover:bg-lila/10 flex items-center justify-center transition"
            title="Mi cuenta"
          >
            <i className="bi bi-person text-lg" />
          </button>

          {/* Wishlist */}
          <button
            className="relative w-10 h-10 rounded-full text-lila hover:bg-lila/10 flex items-center justify-center transition"
            title="Wishlist"
          >
            <i className="bi bi-heart text-lg" />
            {cantidadWishlist > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rojo text-blanco text-[10px] font-bold flex items-center justify-center border-2 border-oscuro">
                {cantidadWishlist}
              </span>
            )}
          </button>

          {/* Carrito */}
          <button
            onClick={onAbrirCarrito}
            className="relative w-10 h-10 rounded-full bg-lila text-oscuro hover:bg-lila-soft flex items-center justify-center transition"
            title="Carrito"
          >
            <i className="bi bi-bag text-lg" />
            {cantidadCarrito > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rojo text-blanco text-[10px] font-bold flex items-center justify-center border-2 border-oscuro">
                {cantidadCarrito}
              </span>
            )}
          </button>

          {/* Dashboard — solo para roles administrativos (no clientes) */}
          {userCanAccessDashboard(usuario) && (
            <button
              onClick={onIrAlDashboard}
              className="w-10 h-10 rounded-full text-verde hover:bg-verde hover:text-oscuro flex items-center justify-center transition"
              title="Ir al dashboard"
            >
              <i className="bi bi-speedometer2 text-lg" />
            </button>
          )}

          {/* Logout */}
          <button
            onClick={onLogout}
            className="w-10 h-10 rounded-full text-rojo hover:bg-rojo hover:text-oscuro flex items-center justify-center transition"
            title="Cerrar sesión"
          >
            <i className="bi bi-box-arrow-right text-lg" />
          </button>
        </div>
        </div>{/* cierre fila 1 móvil */}

        {/* Buscador — fila 2 en móvil, columna central en desktop */}
        <div className="relative w-full">
          <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-lila-soft text-sm" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onBuscar()}
            placeholder="Busca prendas, categorías…"
            className="w-full bg-bg-card text-lila border border-lila/20 rounded-full pl-11 pr-32 py-2.5 text-sm outline-none hover:border-lila focus:ring-1 focus:ring-lila transition placeholder-lila/30"
          />
          <button
            onClick={onBuscar}
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-lila text-oscuro text-xs font-bold px-5 py-1.5 rounded-full hover:bg-lila-soft transition"
          >
            Buscar
          </button>
        </div>

        {/* Iconos de acción — solo visibles en desktop */}
        <div className="hidden md:flex items-center gap-2 justify-end">
          <button className="w-10 h-10 rounded-full text-lila hover:bg-lila/10 flex items-center justify-center transition" title="Mi cuenta">
            <i className="bi bi-person text-lg" />
          </button>
          <button className="relative w-10 h-10 rounded-full text-lila hover:bg-lila/10 flex items-center justify-center transition" title="Wishlist">
            <i className="bi bi-heart text-lg" />
            {cantidadWishlist > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rojo text-blanco text-[10px] font-bold flex items-center justify-center border-2 border-oscuro">
                {cantidadWishlist}
              </span>
            )}
          </button>
          <button onClick={onAbrirCarrito} className="relative w-10 h-10 rounded-full bg-lila text-oscuro hover:bg-lila-soft flex items-center justify-center transition" title="Carrito">
            <i className="bi bi-bag text-lg" />
            {cantidadCarrito > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rojo text-blanco text-[10px] font-bold flex items-center justify-center border-2 border-oscuro">
                {cantidadCarrito}
              </span>
            )}
          </button>
          {userCanAccessDashboard(usuario) && (
            <button
              onClick={onIrAlDashboard}
              className="w-10 h-10 rounded-full text-verde hover:bg-verde hover:text-oscuro flex items-center justify-center transition"
              title="Ir al dashboard"
            >
              <i className="bi bi-speedometer2 text-lg" />
            </button>
          )}
          <button onClick={onLogout} className="w-10 h-10 rounded-full text-rojo hover:bg-rojo hover:text-oscuro flex items-center justify-center transition" title="Cerrar sesión">
            <i className="bi bi-box-arrow-right text-lg" />
          </button>
        </div>
      </div>

      {/* Navegación de categorías — solo en desktop */}
      <nav className="hidden md:block border-t border-lila/5">
        <div className="max-w-[1480px] mx-auto px-6 lg:px-10 flex items-center justify-center gap-1 overflow-x-auto">
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSeleccionarCategoria(cat.id)}
              className={`relative px-4 py-3 text-[13px] font-semibold tracking-wide uppercase whitespace-nowrap transition-colors ${
                categoriaActiva === cat.id
                  ? "text-blanco"
                  : "text-lila-soft hover:text-blanco"
              }`}
            >
              {cat.label}
              {categoriaActiva === cat.id && (
                <span className="absolute left-3 right-3 -bottom-px h-[2px] rounded-full bg-lila shadow-[0_0_10px_rgba(231,214,255,0.6)]" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}
