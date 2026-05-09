import { useState, useMemo } from "react";
import Layout from "../components/Layout";
import Tabla from "../components/Tabla";
import Tarjetas from "../components/Tarjetas";
import Paginacion from "../components/Paginacion";
// ─── Datos de ejemplo ─────────────────────────────────────────────────────────
const logs = [
  { id:"a1",  action:"CREATE",        resource:"users",       resourceId:"USR-001", details:{ usuario:"m.lopez", email:"m.lopez@aura.com", role:"Admin", activo:true },                         userId:"u-admin", usuario:"sistema",  createdAt:"2025-04-28T09:15:00Z" },
  { id:"a2",  action:"UPDATE",        resource:"products",    resourceId:"SKU-001", details:{ changes:["precioVenta","stock"], nombre:"Auriculares BT Pro", activo:true },                      userId:"u1",      usuario:"m.lopez",  createdAt:"2025-04-28T10:30:00Z" },
  { id:"a3",  action:"CREATE",        resource:"recepciones", resourceId:"REC-006", details:{ folio:"FAC-0061", supplierNombre:"ErgoSit Global", total:11200 },                                 userId:"u2",      usuario:"a.reyes",  createdAt:"2025-04-28T11:00:00Z" },
  { id:"a4",  action:"TOGGLE_ACTIVE", resource:"clients",     resourceId:"CLI-003", details:{ nombre:"Gamma Textiles", activo:false },                                                          userId:"u1",      usuario:"m.lopez",  createdAt:"2025-04-27T14:22:00Z" },
  { id:"a5",  action:"DELETE",        resource:"users",       resourceId:"USR-012", details:{ usuario:"carlos.m", email:"c.m@aura.com" },                                                       userId:"u1",      usuario:"m.lopez",  createdAt:"2025-04-27T16:45:00Z" },
  { id:"a6",  action:"CREATE",        resource:"suppliers",   resourceId:"SUP-031", details:{ nombre:"NuevoProv SA", rfc:"NPR031231AB3", activo:true },                                         userId:"u3",      usuario:"j.garcia", createdAt:"2025-04-27T08:10:00Z" },
  { id:"a7",  action:"UPDATE",        resource:"recepciones", resourceId:"REC-005", details:{ changes:["status"], status:"CONFIRMADA" },                                                        userId:"u2",      usuario:"a.reyes",  createdAt:"2025-04-26T13:55:00Z" },
  { id:"a8",  action:"CREATE",        resource:"clients",     resourceId:"CLI-088", details:{ nombre:"Distribuidora Alfa", rfc:"DAL901231AB3", activo:true },                                   userId:"u1",      usuario:"m.lopez",  createdAt:"2025-04-26T10:20:00Z" },
  { id:"a9",  action:"DELETE",        resource:"products",    resourceId:"SKU-099", details:{ nombre:"Producto obsoleto", sku:"SKU-099" },                                                      userId:"u3",      usuario:"j.garcia", createdAt:"2025-04-25T17:30:00Z" },
  { id:"a10", action:"UPDATE",        resource:"users",       resourceId:"USR-003", details:{ changes:["role","permissions"], usuario:"j.garcia", role:"Gerente" },                             userId:"u1",      usuario:"m.lopez",  createdAt:"2025-04-25T09:05:00Z" },
  { id:"a11", action:"TOGGLE_ACTIVE", resource:"suppliers",   resourceId:"SUP-004", details:{ nombre:"DeskGear Corp", activo:false },                                                           userId:"u3",      usuario:"j.garcia", createdAt:"2025-04-24T11:40:00Z" },
  { id:"a12", action:"CREATE",        resource:"recepciones", resourceId:"REC-004", details:{ folio:"FAC-0022", supplierNombre:"DeskGear Corp", total:1700 },                                   userId:"u2",      usuario:"a.reyes",  createdAt:"2025-04-24T08:30:00Z" },
];

// ─── Configuración de acciones ─────────────────────────────────────────────────
const ACTION_CFG = {
  CREATE:        { label:"CREATE",  bg:"rgba(74,222,128,0.12)",  border:"rgba(74,222,128,0.35)",  color:"#84B140",  iconBg:"rgba(74,222,128,0.18)",  iconColor:"#4ade80"  },
  UPDATE:        { label:"UPDATE",  bg:"rgba(251,191,36,0.12)",  border:"rgba(251,191,36,0.35)",  color:"#E0DA66",  iconBg:"rgba(251,191,36,0.18)",  iconColor:"#fbbf24"  },
  DELETE:        { label:"DELETE",  bg:"rgba(244,63,94,0.12)",   border:"rgba(244,63,94,0.35)",   color:"#D04E37",  iconBg:"rgba(244,63,94,0.18)",   iconColor:"#f87171"  },
  TOGGLE_ACTIVE: { label:"TOGGLE",  bg:"rgba(56,189,248,0.12)",  border:"rgba(56,189,248,0.35)",  color:"#38bdf8",  iconBg:"rgba(56,189,248,0.18)",  iconColor:"#38bdf8"  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return (
    d.toLocaleDateString("es-MX", { day:"2-digit", month:"short", year:"numeric" }) +
    " " +
    d.toLocaleTimeString("es-MX", { hour:"2-digit", minute:"2-digit" })
  );
}

function fmtDateShort(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return (
    d.toLocaleDateString("es-MX", { day:"2-digit", month:"short" }) +
    " " +
    d.toLocaleTimeString("es-MX", { hour:"2-digit", minute:"2-digit" })
  );
}

// ─── Sub-componentes locales ───────────────────────────────────────────────────
function ActionBadge({ action }) {
  const cfg = ACTION_CFG[action] || {
    label: action,
    bg: "rgba(167,139,250,0.12)",
    border: "rgba(167,139,250,0.35)",
    color: "#a78bfa",
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

function ResourceBadge({ resource }) {
  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-xs font-medium"
      style={{
        background: "rgba(99,102,241,0.12)",
        border: "0.5px solid rgba(99,102,241,0.25)",
        color: "#a5b4fc",
      }}
    >
      {resource}
    </span>
  );
}

// ─── Modal de Detalle ──────────────────────────────────────────────────────────
function DetalleModal({ log, onClose }) {
  if (!log) return null;
  const cfg = ACTION_CFG[log.action] || { iconBg:"rgba(167,139,250,0.18)", iconColor:"#a78bfa" };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(10,8,20,0.82)" }}
      onClick={onClose}
    >
      <div
        className="flex flex-col overflow-hidden"
        style={{
          background: "#211e38",
          border: "1.5px solid #4a3fa0",
          borderRadius: 16,
          width: 480,
          maxHeight: "90vh",
          boxShadow: "0 0 0 1px rgba(100,80,255,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-start gap-3 p-5"
          style={{ borderBottom: "1px solid rgba(100,80,255,0.2)" }}
        >
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: 44, height: 44, borderRadius: 10,
              background: cfg.iconBg, color: cfg.iconColor, fontSize: 20,
            }}
          >
            <i
              className={`bi ${
                log.action === "CREATE" ? "bi-plus-lg"
                : log.action === "DELETE" ? "bi-trash"
                : log.action === "TOGGLE_ACTIVE" ? "bi-toggles"
                : "bi-pencil"
              }`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="m-0 text-base font-bold text-white">{log.action}</p>
            <p className="m-0 text-xs mt-1" style={{ color: "#818cf8" }}>
              {log.resource} / {log.resourceId || "—"}
            </p>
            <p className="m-0 text-xs mt-1 text-text-muted">{fmtDate(log.createdAt)}</p>
          </div>

          <button
            onClick={onClose}
            className="flex items-center justify-center shrink-0 cursor-pointer"
            style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              border: "1.5px solid rgba(255,255,255,0.15)",
              color: "#a0a0c0", fontSize: 15,
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
          {/* Sección info */}
          <div>
            <p
              className="m-0 mb-2 text-xs font-semibold uppercase tracking-widest flex items-center gap-1"
              style={{ color: "#6366f1" }}
            >
              <i className="bi bi-person-circle text-xs" />
              Información del evento
            </p>

            {[
              ["Usuario",     log.usuario,    false, true],
              ["User ID",     log.userId,     true],
              ["Recurso",     log.resource],
              ["Resource ID", log.resourceId, true],
              ["Acción",      log.action],
              ["Fecha",       fmtDate(log.createdAt)],
            ].map(([k, v, mono, bold]) => (
              <div
                key={k}
                className="flex items-baseline justify-between py-1.5"
                style={{ borderBottom: "1px solid rgba(100,80,255,0.1)" }}
              >
                <span className="text-xs shrink-0" style={{ color: "#8b85b8", minWidth: 90 }}>{k}</span>
                <span
                  className="text-xs text-right break-all"
                  style={{
                    color: mono ? "#818cf8" : bold ? "#e8e0ff" : "#c4b5fd",
                    fontWeight: bold ? 500 : 400,
                    fontFamily: mono ? "monospace" : "inherit",
                  }}
                >
                  {v || "—"}
                </span>
              </div>
            ))}
          </div>

          {/* Sección detalles */}
          <div>
            <p
              className="m-0 mb-2 text-xs font-semibold uppercase tracking-widest flex items-center gap-1"
              style={{ color: "#6366f1" }}
            >
              <i className="bi bi-file-text text-xs" />
              Detalles del cambio
            </p>

            <div
              className="rounded-lg p-3"
              style={{
                background: "rgba(0,0,0,0.25)",
                border: "0.5px solid rgba(100,80,255,0.2)",
              }}
            >
              {Object.keys(log.details || {}).length > 0
                ? Object.entries(log.details).map(([k, v]) => (
                    <div
                      key={k}
                      className="flex items-start gap-2 py-1"
                      style={{ borderBottom: "0.5px solid rgba(100,80,255,0.08)" }}
                    >
                      <span className="text-xs shrink-0" style={{ color: "#8b85b8", minWidth: 80 }}>{k}</span>
                      <span className="text-xs text-right flex-1 break-words" style={{ color: "#e8e0ff" }}>
                        {Array.isArray(v) ? v.join(", ") : String(v)}
                      </span>
                    </div>
                  ))
                : (
                  <p className="m-0 text-xs italic text-center py-2" style={{ color: "#5a5280" }}>
                    Sin detalles adicionales
                  </p>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────────
export default function Auditoria() {
  const [busqueda,      setBusqueda]      = useState("");
  const [filtroAccion,  setFiltroAccion]  = useState("");
  const [filtroRecurso, setFiltroRecurso] = useState("");
  const [modoKPI,       setModoKPI]       = useState("all");
  const [detalle,       setDetalle]       = useState(null);

  // KPIs (sobre todos los logs, sin filtro)
  const kpis = useMemo(() => {
    const t  = logs.length;
    const cr = logs.filter(l => l.action === "CREATE").length;
    const up = logs.filter(l => l.action === "UPDATE" || l.action === "TOGGLE_ACTIVE").length;
    const dl = logs.filter(l => l.action === "DELETE").length;
    return { total: t, crear: cr, actualizar: up, eliminar: dl };
  }, []);

  // Logs filtrados
  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase();
    const a = filtroAccion || (modoKPI !== "all" ? modoKPI : "");
    return logs
      .filter(l => {
        const mq = !q ||
          l.usuario.toLowerCase().includes(q) ||
          l.resource.toLowerCase().includes(q) ||
          l.resourceId.toLowerCase().includes(q) ||
          JSON.stringify(l.details).toLowerCase().includes(q);
        const ma = !a || l.action === a;
        const mr = !filtroRecurso || l.resource === filtroRecurso;
        return mq && ma && mr;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [busqueda, filtroAccion, filtroRecurso, modoKPI]);

  // Clic en tarjeta KPI → filtra tabla
  const handleKPI = (modo) => {
    setModoKPI(modo);
    setFiltroAccion(modo === "all" ? "" : modo);
  };

  const encabezados = ["Acción", "Recurso", "Resource ID", "Usuario", "Detalles", "Fecha", "Ver"];

  const selectCls =
    "bg-bg-card text-lila-soft border border-lila/20 rounded-lg px-3 py-2 text-sm cursor-pointer outline-none hover:border-lila transition-colors shadow-sm";

  return (
    <Layout>
      <div className="p-6 flex flex-col gap-5">

        {/* Título */}
        <h1 className="text-2xl font-bold text-blanco m-0">Auditoría</h1>

        {/* ── KPI Cards ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              id: "all",
              label: "Total registros",
              value: kpis.total,
              sub: "Todos los eventos",
              accent: "#a78bfa",
              icon: "bi bi-file-earmark-text",
            },
            {
              id: "CREATE",
              label: "Creaciones",
              value: kpis.crear,
              sub: `${Math.round((kpis.crear / kpis.total) * 100)}% del total`,
              accent: "#84B140",
              icon: "bi bi-plus-circle",
            },
            {
              id: "UPDATE",
              label: "Actualizaciones",
              value: kpis.actualizar,
              sub: `${Math.round((kpis.actualizar / kpis.total) * 100)}% del total`,
              accent: "#E0DA66",
              icon: "bi bi-pencil-square",
            },
            {
              id: "DELETE",
              label: "Eliminaciones",
              value: kpis.eliminar,
              sub: `${Math.round((kpis.eliminar / kpis.total) * 100)}% del total`,
              accent: "#D04E37",
              icon: "bi bi-trash",
            },
          ].map((k) => (
            <div
              key={k.id}
              onClick={() => handleKPI(k.id)}
              className="cursor-pointer transition-all hover:-translate-y-0.5"
              style={{
                opacity: modoKPI === k.id || modoKPI === "all" ? 1 : 0.55,
                outline: modoKPI === k.id ? `1.5px solid ${k.accent}40` : "none",
                borderRadius: 12,
              }}
            >
              <Tarjetas
                label={k.label}
                value={k.value}
                sub={k.sub}
                accent={k.accent}
                icon={k.icon}
              />
            </div>
          ))}
        </div>

        {/* ── Toolbar ────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
          {/* Buscador */}
          <input
            type="text"
            placeholder="Buscar usuario, recurso, ID..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className={`${selectCls} w-full sm:w-64`}
          />

          {/* Filtro acción */}
          <select
            value={filtroAccion}
            onChange={(e) => { setFiltroAccion(e.target.value); setModoKPI("all"); }}
            className={selectCls}
          >
            <option value="">Todas las acciones</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="TOGGLE_ACTIVE">TOGGLE_ACTIVE</option>
          </select>

          {/* Filtro recurso */}
          <select
            value={filtroRecurso}
            onChange={(e) => setFiltroRecurso(e.target.value)}
            className={selectCls}
          >
            <option value="">Todos los recursos</option>
            <option value="users">users</option>
            <option value="clients">clients</option>
            <option value="suppliers">suppliers</option>
            <option value="products">products</option>
            <option value="recepciones">recepciones</option>
          </select>

          {/* Nota solo lectura */}
          <div className="flex items-center gap-1.5 text-xs text-text-muted ml-auto shrink-0">
            <i className="bi bi-file-lock text-sm" />
            Solo lectura
          </div>
        </div>

        {/* ── Tabla ──────────────────────────────────────────────────── */}
        <Tabla encabezados={encabezados}>
          {filtrados.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-8 text-center text-lila-soft/50 text-sm">
                Sin registros que coincidan con los filtros
              </td>
            </tr>
          ) : (
            filtrados.map((l) => {
              const detailKeys = Object.keys(l.details || {}).slice(0, 2).join(", ");
              return (
                <tr
                  key={l.id}
                  onClick={() => setDetalle(l)}
                  className="border-b border-lila/5 cursor-pointer hover:bg-lila/5 transition-colors"
                >
                  <td className="p-4 text-center"><ActionBadge action={l.action} /></td>
                  <td className="p-4 text-center"><ResourceBadge resource={l.resource} /></td>
                  <td className="p-4 text-center font-mono text-xs" style={{ color: "#ffff" }}>
                    {l.resourceId || "—"}
                  </td>
                  <td className="p-4 text-center text-sm font-medium text-white">
                    {l.usuario || "—"}
                  </td>
                  <td
                    className="p-4 text-center text-xs text-white/80"
                    style={{ maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                  >
                    {detailKeys || "—"}
                  </td>
                  <td className="p-4 text-center text-xs text-white/60">
                    {fmtDateShort(l.createdAt)}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); setDetalle(l); }}
                      className="mx-auto flex items-center justify-center w-7 h-7 rounded-md cursor-pointer transition-all hover:opacity-100 opacity-60"
                      style={{
                        border: "0.5px solid rgba(196,181,253,0.2)",
                        background: "rgba(196,181,253,0.07)",
                        color: "#a78bfa",
                      }}
                    >
                      <i className="bi bi-eye text-sm" />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </Tabla>

        {/* ── Paginación ─────────────────────────────────────────────── */}
        <Paginacion
          paginaActual={1}
          totalRegistros={filtrados.length}
          rangoSiguiente={`1 – ${filtrados.length}`}
          onExportar={() => console.log("Exportar CSV")}
          onCambiarPagina={(p) => console.log("Página:", p)}
        />
      </div>

      {/* ── Modal de Detalle ─────────────────────────────────────────── */}
      <DetalleModal log={detalle} onClose={() => setDetalle(null)} />
    </Layout>
  );
}
