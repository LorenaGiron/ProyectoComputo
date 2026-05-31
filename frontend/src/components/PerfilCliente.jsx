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
          Mis Compras ({comprasEntregadas} entregadas)
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
                className="p-4 rounded-lg border border-lila/10 bg-oscuro/50 hover:bg-oscuro/70 transition"
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
    </div>
  );
}
