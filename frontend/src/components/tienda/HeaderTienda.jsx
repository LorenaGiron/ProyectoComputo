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
  cantidadCarrito,
  cantidadWishlist,
  onAbrirCarrito,
  categoriaActiva,
  onSeleccionarCategoria,
}) {
  return (
    <header className="sticky top-0 z-40 bg-oscuro/95 backdrop-blur-md border-b border-lila/10">

      {/* Barra superior: logo + buscador + iconos */}
      <div className="max-w-[1480px] mx-auto px-6 lg:px-10 py-4 flex items-center gap-6">

        {/* Logo */}
        <div className="flex items-baseline gap-2 shrink-0">
          <h1
            className="text-4xl text-lila tracking-tight leading-none drop-shadow-[0_0_18px_rgba(231,214,255,0.25)]"
            style={{ fontFamily: "'Cinzel Decorative', serif" }}
          >
            AURA
          </h1>
          <span className="text-[10px] tracking-[4px] text-lila-mid uppercase">Boutique</span>
        </div>

        {/* Buscador */}
        <div className="relative flex-1 max-w-2xl">
          <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-lila-soft text-sm" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Busca prendas, categorías…"
            className="w-full bg-bg-card text-lila border border-lila/20 rounded-full pl-11 pr-32 py-2.5 text-sm outline-none hover:border-lila focus:ring-1 focus:ring-lila transition placeholder-lila/30"
          />
          <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-lila text-oscuro text-xs font-bold px-5 py-1.5 rounded-full hover:bg-lila-soft transition">
            Buscar
          </button>
        </div>

        {/* Iconos de acción */}
        <div className="flex items-center gap-2 shrink-0">

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
        </div>
      </div>

      {/* Navegación de categorías */}
      <nav className="border-t border-lila/5">
        <div className="max-w-[1480px] mx-auto px-6 lg:px-10 flex items-center gap-1 overflow-x-auto">
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
