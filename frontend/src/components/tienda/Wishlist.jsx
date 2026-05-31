import { useState } from "react";

const paletasPorCategoria = {
  "Playeras":   ["#9F86C0", "#E7D6FF"],
  "Blusas":     ["#ED8ABA", "#E7D6FF"],
  "Camisas":    ["#7EC9ED", "#E7D6FF"],
  "Suéteres":   ["#C9B8E8", "#A68DC8"],
  "Sudaderas":  ["#A68DC8", "#2C2A48"],
  "Chamarras":  ["#F7CB57", "#FAA86B"],
  "Abrigos":    ["#7EC9ED", "#2C2A48"],
  "Vestidos":   ["#ED8ABA", "#C9B8E8"],
  "Faldas":     ["#FAA86B", "#ED8ABA"],
  "Shorts":     ["#A3E378", "#7EC9ED"],
  "Pantalones": ["#7EC9ED", "#2C2A48"],
  "Calzado":    ["#FAA86B", "#F7CB57"],
  "Accesorios": ["#C9B8E8", "#ED8ABA"],
};

function ImagenMiniatura({ producto }) {
  if (producto.imagen) {
    return (
      <img
        src={producto.imagen}
        alt={producto.nombre}
        className="w-full h-full object-cover"
      />
    );
  }
  const [c0, c1] = paletasPorCategoria[producto.categoria] || ["#A68DC8", "#E7D6FF"];
  return (
    <div
      className="w-full h-full"
      style={{ background: `linear-gradient(135deg, ${c0}, ${c1})` }}
    />
  );
}

function ItemWishlist({ producto, carrito, onAgregarAlCarrito, onQuitar, onVerDetalle }) {
  const todasLasTallas    = producto.inventario ?? [];
  const tallasDisponibles = todasLasTallas.filter((i) => i.stock > 0);
  const agotado           = producto.stock === 0;

  const [tallaSeleccionada, setTallaSeleccionada] = useState(
    tallasDisponibles[0]?.talla ?? ""
  );

  // ── Palomita: la talla seleccionada ya está en el carrito ──────────────────
  const yaEnCarrito = carrito.some(
    (item) => item.producto.id === producto.id && item.talla === tallaSeleccionada
  );

  const handleAgregar = () => {
  if (!tallaSeleccionada) return;
  onAgregarAlCarrito(producto, { talla: tallaSeleccionada, cantidad: 1 });
  };

  return (
    <div className="flex gap-3 bg-bg-card border border-lila/10 rounded-xl p-3">

      {/* Miniatura con palomita */}
      <div className="relative w-20 h-24 shrink-0">
        <button
          onClick={() => onVerDetalle(producto)}
          className="w-full h-full rounded-lg overflow-hidden border border-lila/15 hover:border-lila/40 transition"
        >
          <ImagenMiniatura producto={producto} />
        </button>

        {/* Palomita verde — esquina superior derecha de la miniatura */}
        {yaEnCarrito && (
          <div
            title="Producto agregado al carrito"
            className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-verde flex items-center justify-center shadow-md border-2 border-oscuro"
          >
            <i className="bi bi-check text-oscuro text-xs font-black" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col">
        <p className="text-[10px] text-lila-mid uppercase tracking-widest font-bold">
          {producto.categoria}
        </p>
        <button
          onClick={() => onVerDetalle(producto)}
          className="text-sm font-semibold text-blanco leading-tight line-clamp-2 text-left hover:text-lila transition mt-0.5"
        >
          {producto.nombre}
        </button>
        <p className="text-base font-extrabold text-lila tabular-nums mt-1">
          ${Number(producto.precioVenta).toLocaleString("es-MX")}
        </p>

        {/* Selector de talla */}
        {todasLasTallas.length > 0 && !agotado && (
          <div className="mt-2 flex flex-wrap gap-1">
            {todasLasTallas.map((item) => {
              const sinStock     = item.stock === 0;
              const seleccionada = tallaSeleccionada === item.talla;
              // Marcar tallas que ya están en el carrito
              const estaEnCarrito = carrito.some(
                (c) => c.producto.id === producto.id && c.talla === item.talla
              );
              return (
                <button
                  key={item.talla}
                  onClick={() => !sinStock && setTallaSeleccionada(item.talla)}
                  disabled={sinStock}
                  title={estaEnCarrito ? "Ya en carrito" : sinStock ? "Sin stock" : undefined}
                  className={`relative min-w-[34px] h-7 px-2 rounded-md text-[11px] font-bold border transition-all
                    ${sinStock
                      ? "border-lila/10 text-lila/20 cursor-not-allowed"
                      : seleccionada
                        ? "bg-lila text-oscuro border-lila"
                        : "bg-transparent text-blanco border-lila/20 hover:border-lila"
                    }`}
                >
                  {item.talla}
                  {/* Punto verde en tallas ya agregadas al carrito */}
                  {estaEnCarrito && !sinStock && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-verde border border-oscuro" />
                  )}
                  {sinStock && (
                    <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="w-full h-px bg-lila/20 absolute rotate-45" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Acciones */}
        <div className="mt-auto pt-2 flex items-center gap-2">
          <button
            onClick={handleAgregar}
            disabled={agotado || !tallaSeleccionada}
            className={`flex-1 text-[11px] font-bold py-1.5 rounded-lg transition flex items-center justify-center gap-1
                ${agotado
                ? "bg-lila/10 text-lila/30 cursor-not-allowed"
                : "bg-lila text-oscuro hover:bg-lila-soft"
                }`}
            >
            <i className="bi bi-bag-plus text-xs" />
            {agotado ? "Agotado" : "Agregar al carrito"}
            </button>
          <button
            onClick={() => onQuitar(producto.id)}
            className="border border-rojo/30 text-rojo/70 font-bold px-3 py-1.5 rounded-lg hover:bg-rojo/10 hover:text-rojo hover:border-rojo/50 transition flex items-center gap-1.5 text-[11px] shrink-0"
            >
            <i className="bi bi-trash text-xs" />
            Eliminar
            </button>
        </div>
      </div>
    </div>
  );
}

export default function Wishlist({
  abierto,
  onCerrar,
  favoritos,
  productos,
  carrito,                  // ← prop nueva que viene de Tienda.jsx
  onProductoClick,
  onAgregarAlCarrito,
  onAgregarTodo,
  onQuitar,
}) {
  const productosEnWishlist = favoritos
    .map((id) => productos.find((p) => p.id === id))
    .filter(Boolean);

  const handleVerDetalle = (producto) => {
    onProductoClick(producto);
    onCerrar();
  };

  // ── Agregar todo al carrito ────────────────────────────────────────────────
  const handleAgregarTodo = () => {
  onAgregarTodo(productosEnWishlist);
};
  // ── Vaciar lista ───────────────────────────────────────────────────────────
  const handleVaciarLista = () => {
    productosEnWishlist.forEach((p) => onQuitar(p.id));
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onCerrar}
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity ${
          abierto ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Panel */}
      <aside
        className={`fixed top-0 right-0 bottom-0 z-[60] w-full max-w-[440px] bg-oscuro border-l border-lila/20 shadow-2xl flex flex-col transition-transform duration-300 ${
          abierto ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Encabezado */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-lila/10">
          <div className="flex items-center gap-3">
            <i className="bi bi-heart-fill text-2xl text-rojo" />
            <div>
              <p className="text-[10px] tracking-[3px] text-lila-mid uppercase font-bold">
                Mi wishlist
              </p>
              <p className="text-lg font-bold text-blanco">
                {productosEnWishlist.length}{" "}
                {productosEnWishlist.length === 1 ? "artículo" : "artículos"}
              </p>
            </div>
          </div>
          <button
            onClick={onCerrar}
            className="w-9 h-9 rounded-full bg-lila/10 text-lila flex items-center justify-center hover:bg-lila/20 transition"
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
          {productosEnWishlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-10">
              <div className="w-20 h-20 rounded-full bg-lila/10 flex items-center justify-center mb-4">
                <i className="bi bi-heart text-3xl text-lila" />
              </div>
              <p className="text-base font-bold text-blanco">Tu wishlist está vacía</p>
              <p className="text-sm text-text-muted mt-1">
                Toca el corazón en cualquier producto para guardarlo aquí
              </p>
              <button
                onClick={onCerrar}
                className="mt-5 bg-lila text-oscuro font-bold px-6 py-2.5 rounded-lg hover:bg-lila-soft transition"
              >
                Seguir comprando
              </button>
            </div>
          ) : (
            productosEnWishlist.map((producto) => (
              <ItemWishlist
                key={producto.id}
                producto={producto}
                carrito={carrito}
                onAgregarAlCarrito={onAgregarAlCarrito}
                onQuitar={onQuitar}
                onVerDetalle={handleVerDetalle}
              />
            ))
          )}
        </div>

        {/* Footer con los 2 botones */}
        {productosEnWishlist.length > 0 && (
          <div className="border-t border-lila/10 px-6 py-4 flex flex-col gap-2">
            <button
              onClick={handleAgregarTodo}
              className="w-full bg-lila text-oscuro font-bold py-3 rounded-xl hover:bg-lila-soft transition flex items-center justify-center gap-2"
            >
              <i className="bi bi-bag-plus" />
              Agregar todo al carrito
            </button>
            <button
              onClick={handleVaciarLista}
              className="w-full border border-rojo/30 text-rojo/70 font-bold py-2.5 rounded-xl hover:bg-rojo/10 hover:text-rojo hover:border-rojo/50 transition flex items-center justify-center gap-2"
            >
              <i className="bi bi-trash" />
              Vaciar lista
            </button>
          </div>
        )}
      </aside>
    </>
  );
}