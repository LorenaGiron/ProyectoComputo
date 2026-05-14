import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import Tabla from "../components/Tabla";
import Tarjetas from "../components/Tarjetas";
import Paginacion from "../components/Paginacion";
import { useAuth } from "../hooks/useAuth";

const ITEMS_POR_PAGINA = 5;
const API_URL = import.meta.env.VITE_API_URL;

// ─── Configuración de acciones ─────────────────────────────────────────────────
const ACTION_CFG = {
  CREATE:        { label: "CREATE",  bg: "rgba(74,222,128,0.12)",  border: "rgba(74,222,128,0.35)",  color: "#84B140" },
  UPDATE:        { label: "UPDATE",  bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.35)",  color: "#E0DA66" },
  DELETE:        { label: "DELETE",  bg: "rgba(244,63,94,0.12)",   border: "rgba(244,63,94,0.35)",   color: "#D04E37" },
  TOGGLE_ACTIVE: { label: "TOGGLE",  bg: "rgba(56,189,248,0.12)",  border: "rgba(56,189,248,0.35)",  color: "#38bdf8" },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
function fmtDateShort(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return (
    d.toLocaleDateString("es-MX", { day: "2-digit", month: "short" }) +
    " " +
    d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
  );
}

// ─── Sub-componentes ───────────────────────────────────────────────────────────
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

// ─── Página principal ──────────────────────────────────────────────────────────
export default function Auditoria() {
  const { token } = useAuth();

  // ── Estado de la tabla ──────────────────────────────────────────────────────
  const [logs,     setLogs]     = useState([]);
  const [total,    setTotal]    = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState(null);

  // ── Estado de los KPIs (conteos globales, sin filtros) ──────────────────────
  const [kpis, setKpis] = useState({ total: 0, crear: 0, actualizar: 0, eliminar: 0 });

  // ── Estado de filtros y paginación ──────────────────────────────────────────
  const [busqueda,      setBusqueda]      = useState("");
  const [filtroAccion,  setFiltroAccion]  = useState("");
  const [filtroRecurso, setFiltroRecurso] = useState("");
  const [modoKPI,       setModoKPI]       = useState("all");
  const [paginaActual,  setPaginaActual]  = useState(1);

  // ── Helper para fetch autenticado ────────────────────────────────────────────
  const fetchAuth = (url) =>
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

  // ── Fetch de KPIs: una sola vez al montar ────────────────────────────────────
  useEffect(() => {
    if (!token) return;

    const fetchKpis = async () => {
      try {
        // Sin filtros, limit alto para obtener todos y calcular conteos globales
        const res = await fetchAuth(`${API_URL}/audit?page=1&limit=100`);
        if (!res.ok) return;
        const data = await res.json();

        const todos      = data.items || [];
        const crear      = todos.filter((l) => l.action === "CREATE").length;
        const actualizar = todos.filter((l) => l.action === "UPDATE" || l.action === "TOGGLE_ACTIVE").length;
        const eliminar   = todos.filter((l) => l.action === "DELETE").length;

        setKpis({ total: data.total, crear, actualizar, eliminar });
      } catch {
        // Si falla el fetch de KPIs no bloqueamos la tabla
      }
    };

    fetchKpis();
  }, [token]);

  // ── Fetch de tabla: se re-ejecuta al cambiar filtros o página ────────────────
  useEffect(() => {
    if (!token) return;

    const fetchLogs = async () => {
      try {
        setCargando(true);
        setError(null);

        const params = new URLSearchParams({
          page:  paginaActual,
          limit: ITEMS_POR_PAGINA,
          ...(busqueda      && { q:        busqueda }),
          ...(filtroAccion  && { action:   filtroAccion }),
          ...(filtroRecurso && { resource: filtroRecurso }),
        });

        const res = await fetchAuth(`${API_URL}/audit?${params}`);

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || `Error ${res.status}`);
        }

        const data = await res.json();
        setLogs(data.items || []);
        setTotal(data.total || 0);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    fetchLogs();
  }, [token, busqueda, filtroAccion, filtroRecurso, paginaActual]);

  // ── Paginación ───────────────────────────────────────────────────────────────
  const totalPaginas = Math.max(1, Math.ceil(total / ITEMS_POR_PAGINA));
  const inicio       = total === 0 ? 0 : (paginaActual - 1) * ITEMS_POR_PAGINA + 1;
  const fin          = Math.min(paginaActual * ITEMS_POR_PAGINA, total);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleBusqueda = (v) => { setBusqueda(v);      setPaginaActual(1); };
  const handleAccion   = (v) => { setFiltroAccion(v);  setModoKPI("all");  setPaginaActual(1); };
  const handleRecurso  = (v) => { setFiltroRecurso(v); setPaginaActual(1); };
  const handleKPI      = (modo) => {
    setModoKPI(modo);
    setFiltroAccion(modo === "all" ? "" : modo);
    setPaginaActual(1);
  };

  const selectCls =
    "bg-bg-card text-lila-soft border border-lila/20 rounded-lg px-3 py-2 text-sm cursor-pointer outline-none hover:border-lila transition-colors shadow-sm";

  const encabezados = ["Acción", "Recurso", "Resource ID", "Usuario", "Detalles", "Fecha"];

  return (
    <Layout>
      <div className="p-6 flex flex-col gap-5">

        {/* Título */}
        <h1 className="text-2xl font-bold text-blanco m-0">Auditoría</h1>

        {/* ── KPI Cards ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              id:     "all",
              label:  "Total registros",
              value:  kpis.total,
              sub:    "Todos los eventos",
              accent: "#a78bfa",
              icon:   "bi bi-file-earmark-text",
            },
            {
              id:     "CREATE",
              label:  "Creaciones",
              value:  kpis.crear,
              sub:    kpis.total ? `${Math.round((kpis.crear / kpis.total) * 100)}% del total` : "—",
              accent: "#84B140",
              icon:   "bi bi-plus-circle",
            },
            {
              id:     "UPDATE",
              label:  "Actualizaciones",
              value:  kpis.actualizar,
              sub:    kpis.total ? `${Math.round((kpis.actualizar / kpis.total) * 100)}% del total` : "—",
              accent: "#E0DA66",
              icon:   "bi bi-pencil-square",
            },
            {
              id:     "DELETE",
              label:  "Eliminaciones",
              value:  kpis.eliminar,
              sub:    kpis.total ? `${Math.round((kpis.eliminar / kpis.total) * 100)}% del total` : "—",
              accent: "#D04E37",
              icon:   "bi bi-trash",
            },
          ].map((k) => (
            <div
              key={k.id}
              onClick={() => handleKPI(k.id)}
              className="cursor-pointer transition-all hover:-translate-y-0.5"
              style={{
                opacity:      modoKPI === k.id || modoKPI === "all" ? 1 : 0.55,
                outline:      modoKPI === k.id ? `1.5px solid ${k.accent}40` : "none",
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
          <input
            type="text"
            placeholder="Buscar usuario, recurso, ID..."
            value={busqueda}
            onChange={(e) => handleBusqueda(e.target.value)}
            className={`${selectCls} w-full sm:w-64`}
          />

          <select
            value={filtroAccion}
            onChange={(e) => handleAccion(e.target.value)}
            className={selectCls}
          >
            <option value="">Todas las acciones</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="TOGGLE_ACTIVE">TOGGLE_ACTIVE</option>
          </select>

          <select
            value={filtroRecurso}
            onChange={(e) => handleRecurso(e.target.value)}
            className={selectCls}
          >
            <option value="">Todos los recursos</option>
            <option value="users">users</option>
            <option value="clients">clients</option>
            <option value="suppliers">suppliers</option>
            <option value="products">products</option>
            <option value="recepciones">recepciones</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-text-muted ml-auto shrink-0">
            <i className="bi bi-file-lock text-sm" />
            Solo lectura
          </div>
        </div>

        {/* ── Tabla ──────────────────────────────────────────────────── */}
        <Tabla encabezados={encabezados}>
          {cargando ? (
            <tr>
              <td colSpan={6} className="p-8 text-center text-lila-soft/50 text-sm">
                <i className="bi bi-arrow-repeat mr-2" />
                Cargando registros...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={6} className="p-8 text-center text-sm" style={{ color: "#f87171" }}>
                <i className="bi bi-exclamation-circle mr-2" />
                {error}
              </td>
            </tr>
          ) : logs.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-8 text-center text-lila-soft/50 text-sm">
                Sin registros que coincidan con los filtros
              </td>
            </tr>
          ) : (
            logs.map((l) => {
              const detailKeys = Object.keys(l.details || {}).slice(0, 2).join(", ");
              return (
                <tr key={l.id} className="border-b border-lila/5">
                  <td className="p-4 text-center">
                    <ActionBadge action={l.action} />
                  </td>
                  <td className="p-4 text-center">
                    <ResourceBadge resource={l.resource} />
                  </td>
                  <td className="p-4 text-center font-mono text-xs" style={{ color: "#fff" }}>
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
                </tr>
              );
            })
          )}
        </Tabla>

        {/* ── Paginación ─────────────────────────────────────────────── */}
        <Paginacion
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          totalRegistros={total}
          rangoSiguiente={total === 0 ? "0 – 0" : `${inicio} – ${fin}`}
          onExportar={() => console.log("Exportar CSV")}
          onCambiarPagina={(p) => setPaginaActual(p)}
        />

      </div>
    </Layout>
  );
}
