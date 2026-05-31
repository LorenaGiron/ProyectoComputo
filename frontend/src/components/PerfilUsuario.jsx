import { useState, useEffect } from "react";
import { api } from "../services/api";

const ACTION_CFG = {
  CREATE:        { label: "CREATE",  bg: "rgba(74,222,128,0.12)",  border: "rgba(74,222,128,0.35)",  color: "#84B140" },
  UPDATE:        { label: "UPDATE",  bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.35)",  color: "#E0DA66" },
  DELETE:        { label: "DELETE",  bg: "rgba(244,63,94,0.12)",   border: "rgba(244,63,94,0.35)",   color: "#D04E37" },
  TOGGLE_ACTIVE: { label: "TOGGLE",  bg: "rgba(56,189,248,0.12)",  border: "rgba(56,189,248,0.35)",  color: "#38bdf8" },
};

function fmtDateShort(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return (
    d.toLocaleDateString("es-MX", { day: "2-digit", month: "short" }) +
    " " +
    d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
  );
}

function ActionBadge({ action }) {
  const cfg = ACTION_CFG[action] || {
    label: action, bg: "rgba(167,139,250,0.12)",
    border: "rgba(167,139,250,0.35)", color: "#a78bfa",
  };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
      style={{ background: cfg.bg, border: `0.5px solid ${cfg.border}`, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

function formatDetails(details) {
  if (!details) return "Sin detalles";
  if (typeof details === "string") return details;
  if (typeof details === "object") {
    return Object.entries(details)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join(", ");
  }
  return String(details);
}

export default function PerfilUsuario({ usuario }) {
  const [auditoria, setAuditoria] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarAuditoria = async () => {
      try {
        const data = await api.get("/audit?limit=50");
        const movimientos = (data.items || [])
          .filter(item => item.usuario === usuario?.usuario)
          .slice(0, 20);
        setAuditoria(movimientos);
      } catch (error) {
        console.error("Error cargando auditoría:", error);
      } finally {
        setCargando(false);
      }
    };

    if (usuario?.usuario) {
      cargarAuditoria();
    }
  }, [usuario?.usuario]);

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
                <span className="font-semibold text-lila-soft">Usuario:</span> @{usuario?.usuario}
              </p>
              <p className="text-text-muted">
                <span className="font-semibold text-lila-soft">Email:</span> {usuario?.email}
              </p>
              <p className="text-text-muted">
                <span className="font-semibold text-lila-soft">Rol:</span> {usuario?.role?.nombre || "N/A"}
              </p>
              <p className="text-text-muted">
                <span className="font-semibold text-lila-soft">Estado:</span>{" "}
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                  usuario?.activo
                    ? "bg-verde/20 text-verde border border-verde/30"
                    : "bg-rojo/20 text-rojo border border-rojo/30"
                }`}>
                  {usuario?.activo ? "Activo" : "Inactivo"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-lila/10 shadow-lg p-6 w-full bg-blanco dark:bg-[rgba(35,30,60,0.6)] backdrop-blur-sm">
        <h3 className="text-lg font-bold text-lila mb-4 flex items-center gap-2">
          <i className="bi bi-clock-history text-lila-mid" />
          Movimientos Recientes
        </h3>

        {cargando ? (
          <div className="text-center py-8 text-text-muted">
            <p>Cargando movimientos...</p>
          </div>
        ) : auditoria.length === 0 ? (
          <div className="text-center py-8 text-text-muted">
            <p>No hay movimientos registrados</p>
          </div>
        ) : (
          <div className="space-y-3">
            {auditoria.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg border border-lila/10 bg-oscuro/50 hover:bg-oscuro/70 transition"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <ActionBadge action={item.action} />
                      <span className="text-xs font-semibold text-lila/60 uppercase">
                        {item.resource}
                      </span>
                    </div>
                    <p className="text-sm text-lila">{formatDetails(item.details)}</p>
                  </div>
                  <span className="text-xs text-text-muted whitespace-nowrap">
                    {fmtDateShort(item.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
