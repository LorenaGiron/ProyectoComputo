import { useState, useEffect } from "react";
import { api } from "../services/api";

const formatMoney = (n) => `$${Number(n).toLocaleString("es-MX")}`;

const formatFecha = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
};

function EstadoBadge({ estado }) {
  const estilos = {
    pendiente: { bg: "rgba(247,203,87,0.12)", border: "rgba(247,203,87,0.35)", color: "#F7CB57" },
    pagado: { bg: "rgba(163,227,120,0.12)", border: "rgba(163,227,120,0.35)", color: "#A3E378" },
    enviado: { bg: "rgba(126,201,237,0.12)", border: "rgba(126,201,237,0.35)", color: "#7EC9ED" },
    entregado: { bg: "rgba(74,222,128,0.12)", border: "rgba(74,222,128,0.35)", color: "#4ADE80" },
    cancelado: { bg: "rgba(244,63,94,0.12)", border: "rgba(244,63,94,0.35)", color: "#F43F5E" },
  };

  const cfg = estilos[estado] || estilos.pendiente;

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold capitalize"
      style={{ background: cfg.bg, border: `0.5px solid ${cfg.border}`, color: cfg.color }}
    >
      {estado}
    </span>
  );
}

export default function PerfilCliente({ usuario }) {
  const [compras, setCompras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [compraSeleccionada, setCompraSeleccionada] = useState(null);

  useEffect(() => {
    const cargarCompras = async () => {
      try {
        const data = await api.get("/ventas/me");
        const todasLasVentas = data.items || data || [];
        
        const ventasArray = Array.isArray(todasLasVentas) ? todasLasVentas : [];
        const comprasDelCliente = ventasArray
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setCompras(comprasDelCliente);
      } catch (error) {
        console.error("Error cargando compras:", error);
        setCompras([]);
      } finally {
        setCargando(false);
      }
    };

    if (usuario?.id || usuario?.email) {
      cargarCompras();
    }
  }, [usuario?.id, usuario?.email]);

  const totalCompras = compras.reduce((sum, c) => sum + (c.total || 0), 0);
  const comprasEntregadas = compras.filter(c => c.estado === "entregado").length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-lila/10 shadow-lg p-6 w-full bg-blanco dark:bg-[rgba(35,30,60,0.6)] backdrop-blur-sm">
        <div className="flex items-start gap-6 mb-6">
          <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-lila via-lilaMid to-lilaSoft flex items-center justify-center flex-shrink-0">
            <span className="text-4xl font-bold text-oscuro">
              {usuario?.nombre?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-lila mb-2">
              {usuario?.nombre} {usuario?.apellido}
            </h2>
            <div className="space-y-1 text-sm">
              <p className="text-text-muted">
                <span className="font-semibold text-lila-soft">Email:</span> {usuario?.email}
              </p>
              {usuario?.rfc && (
                <p className="text-text-muted">
                  <span className="font-semibold text-lila-soft">RFC:</span> {usuario?.rfc}
                </p>
              )}
              {usuario?.telefono && (
                <p className="text-text-muted">
                  <span className="font-semibold text-lila-soft">Teléfono:</span> {usuario?.telefono}
                </p>
              )}
              {usuario?.direccion && (
                <p className="text-text-muted">
                  <span className="font-semibold text-lila-soft">Dirección:</span> {usuario?.direccion}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl border border-lila/10 shadow-lg p-6 bg-blanco dark:bg-[rgba(35,30,60,0.6)] backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm mb-1">Total Compras</p>
              <p className="text-2xl font-bold text-lila">{compras.length}</p>
            </div>
            <i className="bi bi-bag-check text-4xl text-lila/30" />
          </div>
        </div>
        <div className="rounded-2xl border border-lila/10 shadow-lg p-6 bg-blanco dark:bg-[rgba(35,30,60,0.6)] backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm mb-1">Monto Total</p>
              <p className="text-2xl font-bold text-lila">{formatMoney(totalCompras)}</p>
            </div>
            <i className="bi bi-cash-coin text-4xl text-lila/30" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-lila/10 shadow-lg p-6 w-full bg-blanco dark:bg-[rgba(35,30,60,0.6)] backdrop-blur-sm">
        <h3 className="text-lg font-bold text-lila mb-4 flex items-center gap-2">
          <i className="bi bi-bag-check-fill text-lila-mid" />
          Mis Compras
        </h3>

        {cargando ? (
          <div className="text-center py-8 text-text-muted">
            <p>Cargando compras...</p>
          </div>
        ) : compras.length === 0 ? (
          <div className="text-center py-8 text-text-muted">
            <p>Aún no tienes compras</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {compras.map((compra) => (
              <div
                key={compra.id}
                onClick={() => setCompraSeleccionada(compra)}
                className="p-4 rounded-lg border border-lila/10 bg-oscuro/50 hover:bg-oscuro/70 transition cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold text-lila">Pedido #{compra.id}</span>
                      <EstadoBadge estado={compra.estado} />
                    </div>
                    <p className="text-xs text-text-muted mb-2">
                      {formatFecha(compra.createdAt)}
                    </p>
                    <div className="text-xs text-lila/70 space-y-1">
                      {compra.items?.slice(0, 2).map((item, idx) => (
                        <div key={idx}>
                          {item.nombre || item.producto?.nombre} x {item.cantidad}
                        </div>
                      ))}
                      {compra.items?.length > 2 && (
                        <div className="text-lila/50">
                          +{compra.items.length - 2} más...
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-lila">{formatMoney(compra.total)}</p>
                    {compra.cantidad && (
                      <p className="text-xs text-text-muted">{compra.cantidad} artículos</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalles de compra */}
      {compraSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-oscuro/80 backdrop-blur-sm p-4">
          <div className="bg-blanco dark:bg-[rgba(35,30,60,0.9)] rounded-2xl border border-lila/10 shadow-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-lila flex items-center gap-2">
                <i className="bi bi-receipt text-lila-mid" />
                Detalles del Pedido
              </h3>
              <button
                onClick={() => setCompraSeleccionada(null)}
                className="text-text-muted hover:text-lila transition"
              >
                <i className="bi bi-x text-2xl" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Información general */}
              <div className="pb-4 border-b border-lila/10">
                <p className="text-xs text-text-muted mb-2">ID Pedido</p>
                <p className="font-mono text-sm text-lila">{compraSeleccionada.id}</p>
              </div>

              {/* Estado */}
              <div className="pb-4 border-b border-lila/10">
                <p className="text-xs text-text-muted mb-2">Estado</p>
                <EstadoBadge estado={compraSeleccionada.estado} />
              </div>

              {/* Fecha */}
              <div className="pb-4 border-b border-lila/10">
                <p className="text-xs text-text-muted mb-2">Fecha de Compra</p>
                <p className="text-sm text-lila font-semibold">{formatFecha(compraSeleccionada.createdAt)}</p>
              </div>

              {/* Método de pago */}
              {compraSeleccionada.metodoPago && (
                <div className="pb-4 border-b border-lila/10">
                  <p className="text-xs text-text-muted mb-2">Método de Pago</p>
                  <p className="text-sm text-lila capitalize">{compraSeleccionada.metodoPago}</p>
                </div>
              )}

              {/* Artículos */}
              <div className="pb-4 border-b border-lila/10">
                <p className="text-xs text-text-muted mb-3">Artículos ({compraSeleccionada.items?.length || 0})</p>
                <div className="space-y-2">
                  {compraSeleccionada.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start p-2 bg-oscuro/30 rounded">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-lila">{item.nombre || item.producto?.nombre}</p>
                        {item.talla && <p className="text-xs text-text-muted">Talla: {item.talla}</p>}
                        {item.color && <p className="text-xs text-text-muted">Color: {item.color}</p>}
                        <p className="text-xs text-text-muted">Cantidad: {item.cantidad}</p>
                        <p className="text-xs text-text-muted">Precio unitario: {formatMoney(item.precioUnitario || item.precio || 0)}</p>
                      </div>
                      <p className="text-sm font-bold text-lila-soft">{formatMoney((item.precioUnitario || item.precio || 0) * item.cantidad)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totales */}
              <div className="bg-lila/10 rounded-lg p-4 space-y-2">
                {compraSeleccionada.subtotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Subtotal:</span>
                    <span className="text-lila">{formatMoney(compraSeleccionada.subtotal)}</span>
                  </div>
                )}
                {compraSeleccionada.impuesto > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Impuesto:</span>
                    <span className="text-lila">{formatMoney(compraSeleccionada.impuesto)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Envío:</span>

                  {Number(compraSeleccionada.envio) > 0 ? (
                    <span className="text-lila">
                      {formatMoney(compraSeleccionada.envio)}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span className="text-text-muted line-through opacity-70">
                        {formatMoney(99)}
                      </span>
                      <span className="text-lila font-semibold">
                        {formatMoney(0)}
                      </span>
                    </span>
                  )}
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-lila/20">
                  <span className="text-lila-soft">Total:</span>
                  <span className="text-lila">{formatMoney(compraSeleccionada.total)}</span>
                </div>
              </div>

              {/* Botón cerrar */}
              <button
                onClick={() => setCompraSeleccionada(null)}
                className="w-full py-2 rounded-lg bg-lila text-oscuro font-semibold hover:bg-lila-soft transition mt-4"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
