const ACTION_CFG_LOCAL = {
  CREATE:        { label: "CREATE",  bg: "rgba(74,222,128,0.12)",  border: "rgba(74,222,128,0.35)",  color: "#84B140" },
  UPDATE:        { label: "UPDATE",  bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.35)",  color: "#E0DA66" },
  DELETE:        { label: "DELETE",  bg: "rgba(244,63,94,0.12)",   border: "rgba(244,63,94,0.35)",   color: "#D04E37" },
  TOGGLE_ACTIVE: { label: "TOGGLE",  bg: "rgba(56,189,248,0.12)",  border: "rgba(56,189,248,0.35)",  color: "#38bdf8" },
};

function fmtDateLong(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("es-MX", {
    weekday: "long", year: "numeric", month: "long", day: "2-digit",
  }) + " · " + d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function ModalAuditoria({ data }) {
  if (!data) return null;

  const cfg = ACTION_CFG_LOCAL[data.action] || {
    label: data.action, bg: "rgba(167,139,250,0.12)",
    border: "rgba(167,139,250,0.35)", color: "#a78bfa",
  };

  const detalles = data.details
    ? Object.entries(data.details)
    : [];

  return (
    <div className="p-4 md:p-6 text-blanco font-poppins h-full">

      <div className="mb-6 pb-4 border-b border-lila/20">
        <div className="flex items-center gap-3 mb-3">
          <span
            className="inline-flex items-center px-3 py-1 rounded text-sm font-bold"
            style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
          >
            {cfg.label}
          </span>
          <span
            className="inline-block px-3 py-1 rounded text-sm font-medium"
            style={{
              background: "rgba(99,102,241,0.12)",
              border: "0.5px solid rgba(99,102,241,0.25)",
              color: "#a5b4fc",
            }}
          >
            {data.resource}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-blanco">
          {data.usuario || "Usuario desconocido"}
        </h2>
        <p className="text-xs text-lila-soft mt-1">{fmtDateLong(data.createdAt)}</p>
      </div>

      <div className="space-y-1 bg-oscuro/20 p-4 rounded-xl border border-lila/5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Acción",      value: data.action,     color: cfg.color },
            { label: "Recurso",     value: data.resource                      },
            { label: "Resource ID", value: data.resourceId, mono: true        },
            { label: "Usuario",     value: data.usuario                       },
            { label: "Fecha",       value: fmtDateLong(data.createdAt)        },
          ].map(({ label, value, mono, color }) => (
            <div key={label}>
              <p className="text-xs text-lila-soft mb-1 uppercase tracking-wider font-semibold">
                {label}
              </p>
              <p
                className={`text-sm ${mono ? "font-mono" : "font-medium"} text-blanco`}
                style={color ? { color } : {}}
              >
                {value || "—"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {detalles.length > 0 && (
        <div>
          <p className="text-xs font-bold text-lila-soft mb-4 uppercase tracking-wider flex items-center gap-2">
        <i className="bi bi-file-text" /> Detalles del evento          </p>
          <div className="rounded-xl border border-lila/10 overflow-hidden">
            {detalles.map(([key, val], idx) => (
              <div
                key={key}
                className={`flex items-start justify-between gap-4 px-4 py-3 ${
                  idx !== detalles.length - 1 ? "border-b border-lila/5" : ""
                } ${idx % 2 === 0 ? "bg-oscuro/20" : "bg-oscuro/10"}`}
              >
                <span className="text-xs font-bold text-lila-soft uppercase tracking-wider shrink-0 w-1/3">
                  {key}
                </span>
                <span className="text-xs font-mono text-blanco text-right break-all w-2/3">
                  {typeof val === "object" ? JSON.stringify(val) : String(val ?? "—")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Firma */}
      <div className="mt-8 font-cinzel tracking-widest text-xl opacity-90 text-lila">
        A U R A
      </div>
    </div>
  );
}