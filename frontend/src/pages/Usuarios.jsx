import { useState, useEffect, useRef } from "react";
import { api } from "../services/api";
import {
  Eye, Pencil, Trash2, Plus, Filter, Download,
  ChevronLeft, ChevronRight, Users, CheckCircle,
  XCircle, X, User, ArrowUp, ArrowDown,
} from "lucide-react";

const BADGE_STYLES = {
  ACTIVO: { backgroundColor: "#6cc94b", color: "#ffffff", label: "Activo" },
  INACTIVO: { backgroundColor: "#cf3838", color: "#ffffff", label: "Inactivo" },
  Admin: { backgroundColor: "#A68DC8", color: "#ffffff", label: "Admin" },
  Bodeguero: { backgroundColor: "#64A8BD", color: "#ffffff", label: "Bodeguero" },
  Vendedor: { backgroundColor: "#8DB051", color: "#ffffff", label: "Vendedor" },
};

/* ─── Input de búsqueda por texto ─── */
function FiltroTexto({ value, onChange }) {
  return (
    <div className="relative w-80">
      <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#5A5870" }} />
      <input
        type="text" value={value} placeholder="Buscar por nombre o email..."
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl text-sm font-semibold pl-9 pr-8 py-2.5 outline-none transition-colors"
        style={{ backgroundColor: "#221E3A", border: "1px solid #A68DC8", color: value ? "#E7D6FF" : "#5A5870" }}
      />
      {value && (
        <button onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2" style={{ color: "#5A5870" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#E7D6FF")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#5A5870")}>
          <X size={13} />
        </button>
      )}
    </div>
  );
}

/* ─── Selector de estado ─── */
function SelectorEstado({ value, onChange }) {
  return (
    <div className="relative w-56">
      <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#5A5870" }} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl text-sm font-semibold pl-9 pr-4 py-2.5 outline-none transition-colors appearance-none cursor-pointer"
        style={{ backgroundColor: "#221E3A", border: "1px solid #A68DC8", color: "#E7D6FF" }}>
        <option value="">Todos los estados</option>
        <option value="ACTIVO">Activo</option>
        <option value="INACTIVO">Inactivo</option>
      </select>
      <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#5A5870" }} />
    </div>
  );
}

/* ─── Modal detalle usuario ─── */
function ModalDetalle({ row, onClose }) {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  const badgeStatus = BADGE_STYLES[row.status] ?? { backgroundColor: "#5A5870", color: "#fff", label: row.status };
  const badgeRol = BADGE_STYLES[row.role] ?? { backgroundColor: "#5A5870", color: "#fff", label: row.role };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <div className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
        style={{ backgroundColor: "#221E3A", border: "1px solid #A68DC8", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="px-4 py-1.5 rounded-full text-xs font-bold"
                style={{ backgroundColor: badgeRol.backgroundColor, color: badgeRol.color }}>
                {badgeRol.label}
              </span>
              <span className="px-4 py-1.5 rounded-full text-xs font-bold"
                style={{ backgroundColor: badgeStatus.backgroundColor, color: badgeStatus.color }}>
                {badgeStatus.label}
              </span>
            </div>
            <button onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
              style={{ backgroundColor: "rgba(166,141,200,0.15)", color: "#E7D6FF" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(166,141,200,0.3)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(166,141,200,0.15)")}>
              <X size={16} />
            </button>
          </div>

          <h2 className="text-xl font-extrabold text-white mb-2">{row.name}</h2>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-sm" style={{ color: "#C9B8E8" }}>
              <User size={13} style={{ color: "#A68DC8" }} />{row.username || "—"}
            </span>
          </div>
        </div>

        {/* Info del usuario */}
        <div className="mx-6 mb-4 rounded-xl overflow-hidden" style={{ border: "1px solid #A68DC8", backgroundColor: "#2C2A48" }}>
          <div className="px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#5A5870" }}>Email</p>
            <p className="text-sm font-semibold text-white">{row.email || "—"}</p>
          </div>
        </div>

        {/* Footer modal */}
        <div className="px-6 py-4 flex items-center justify-between"
          style={{ borderTop: "1px solid rgba(166,141,200,0.15)" }}>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#5A5870" }}>Rol</p>
            <p className="text-sm font-semibold" style={{ color: "#A68DC8" }}>{row.role || "—"}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg transition-colors"
              style={{ color: "#ffffff", backgroundColor: "rgba(166,141,200,0.1)", border: "1px solid rgba(166,141,200,0.2)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#e05c5c"; e.currentTarget.style.borderColor = "#e05c5c"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#ffffff"; e.currentTarget.style.borderColor = "rgba(166,141,200,0.2)"; }}>
              <Trash2 size={16} />
            </button>
            <button className="p-2 rounded-lg transition-colors"
              style={{ color: "#ffffff", backgroundColor: "rgba(166,141,200,0.1)", border: "1px solid rgba(166,141,200,0.2)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#8DB051"; e.currentTarget.style.borderColor = "#8DB051"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#ffffff"; e.currentTarget.style.borderColor = "rgba(166,141,200,0.2)"; }}>
              <Pencil size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Componentes auxiliares ─── */
function StatCard({ label, value, sub, color, icon }) {
  return (
    <div className="rounded-2xl p-5 transition-transform hover:-translate-y-1 hover:shadow-xl"
      style={{ backgroundColor: "#221E3A", border: "1px solid #A68DC8", borderLeft: `6px solid ${color}` }}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm font-semibold" style={{ color: "#C9B8E8" }}>{label}</span>
        <span className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}33`, color }}>{icon}</span>
      </div>
      <p className="font-extrabold leading-tight mb-1" style={{ fontSize: "2.6rem", color }}>{value}</p>
      <p className="text-xs font-semibold" style={{ color: "#5A5870" }}>{sub}</p>
    </div>
  );
}

function ActionBtn({ onClick, hoverColor, children }) {
  return (
    <button onClick={onClick} className="p-1 rounded-md transition-colors" style={{ color: "#ffffff" }}
      onMouseEnter={(e) => { e.currentTarget.style.color = hoverColor; e.currentTarget.style.backgroundColor = `${hoverColor}26`; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = "#ffffff"; e.currentTarget.style.backgroundColor = "transparent"; }}>
      {children}
    </button>
  );
}

/* ─── Generador de color consistente ─── */
function getColorForUser(userId) {
  const colors = ["#A68DC8", "#8DB051", "#64A8BD", "#c9c225", "#E07856", "#6cc94b", "#56ABE4", "#D084D0"];
  return colors[userId % colors.length];
}

/* ─── Avatar de usuario ─── */
function UserAvatar({ name }) {
  const initial = (name || "?").charAt(0).toUpperCase();
  const color = getColorForUser(name ? name.charCodeAt(0) : 0);
  
  return (
    <div className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white"
      style={{ backgroundColor: color, color: "#fff" }}>
      {initial}
    </div>
  );
}

/* ─── Página principal ─── */
const LIMIT = 10;

// Datos de ejemplo
const MOCK_USUARIOS = [
  { id: 1, username: "Usuario1", name: "Fernando Mendez", email: "fer@email.com", role: "Admin", status: "ACTIVO" },
  { id: 2, username: "Usuario2", name: "Maria Garcia", email: "maria@email.com", role: "Bodeguero", status: "INACTIVO" },
  { id: 3, username: "Usuario3", name: "Juan Pérez", email: "juan@email.com", role: "Vendedor", status: "ACTIVO" },
  { id: 4, username: "Usuario4", name: "Ana López", email: "ana@email.com", role: "Admin", status: "INACTIVO" },
];

export default function Usuarios() {
  const [rows, setRows]                     = useState(MOCK_USUARIOS);
  const [stats, setStats]                   = useState({ total: 4, activos: 2, inactivos: 2 });
  const [filtroTexto, setFiltroTexto]       = useState("");
  const [filtroEstado, setFiltroEstado]     = useState("");
  const [paginaActiva, setPaginaActiva]     = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(4);
  const [rowSeleccionada, setRowSeleccionada] = useState(null);
  const [loading, setLoading]               = useState(false);
  const [sortField, setSortField]           = useState(null);
  const [sortDirection, setSortDirection]   = useState("asc");

  // Filtrar datos locales basado en los filtros
  useEffect(() => {
    let filtered = MOCK_USUARIOS;

    // Filtrar por texto (nombre o email)
    if (filtroTexto) {
      const searchLower = filtroTexto.toLowerCase();
      filtered = filtered.filter((user) =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    // Filtrar por estado
    if (filtroEstado) {
      filtered = filtered.filter((user) => user.status === filtroEstado);
    }

    setTotalRegistros(filtered.length);
    setPaginaActiva(1);
    setRows(filtered);
  }, [filtroTexto, filtroEstado]);

  // Stats de las cards
  useEffect(() => {
    Promise.all([
      api.get("/users?limit=1"),
      api.get("/users?status=ACTIVO&limit=1"),
      api.get("/users?status=INACTIVO&limit=1"),
    ]).then(([all, activos, inactivos]) => {
      setStats({ total: all.total, activos: activos.total, inactivos: inactivos.total });
    }).catch(console.error);
  }, []);

  const totalPaginas = Math.ceil(totalRegistros / LIMIT);

  // Función para manejar el ordenamiento
  const handleSort = (field) => {
    let newDirection = "asc";
    if (sortField === field && sortDirection === "asc") {
      newDirection = "desc";
    }
    setSortField(field);
    setSortDirection(newDirection);
  };

  // Función para ordenar los datos
  const getSortedRows = () => {
    if (!sortField) return rows;

    const sorted = [...rows].sort((a, b) => {
      let valueA = a[sortField] || "";
      let valueB = b[sortField] || "";

      // Convertir a minúsculas para comparación alfabética
      if (typeof valueA === "string") valueA = valueA.toLowerCase();
      if (typeof valueB === "string") valueB = valueB.toLowerCase();

      if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
      if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  const sortedRows = getSortedRows();

  return (
    <div className="min-h-screen p-7" style={{ backgroundColor: "#2C2A48", color: "#E7D6FF" }}>

      {/* TÍTULO */}
      <h1 className="text-3xl font-extrabold tracking-widest mb-6 text-white">USUARIOS</h1>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-7">
        <StatCard label="TOTAL DE USUARIOS" value={stats.total}       sub="ver todos"        color="#A68DC8" icon={<Users size={17}   />} />
        <StatCard label="ACTIVOS" value={stats.activos} sub={`${stats.total ? Math.round(stats.activos / stats.total * 100) : 0}% del total`} color="#8DB051" icon={<CheckCircle size={17} />} />
        <StatCard label="INACTIVOS"       value={stats.inactivos}       sub={`${stats.total ? Math.round(stats.inactivos / stats.total * 100) : 0}% del total`}     color="#cf3838" icon={<XCircle size={17}     />} />
      </div>

      {/* TOOLBAR */}
      <div className="flex justify-between items-center mb-4 gap-3">
        <div className="flex items-center gap-3">
          <FiltroTexto value={filtroTexto} onChange={(v) => { setFiltroTexto(v); setPaginaActiva(1); }} />
          <SelectorEstado value={filtroEstado} onChange={(v) => { setFiltroEstado(v); setPaginaActiva(1); }} />
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all hover:opacity-90 hover:-translate-y-0.5"
          style={{ backgroundColor: "#E7D6FF", color: "#221E3A" }}>
          <Plus size={15} strokeWidth={3} />
          Usuarlo
        </button>
      </div>

      {/* TABLA */}
      <div className="rounded-2xl overflow-hidden mb-5" style={{ backgroundColor: "#221E3A", border: "1px solid #A68DC8" }}>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: "rgba(0,0,0,0.18)" }}>
              {[
                { label: "Usuario", key: "username", sortable: true },
                { label: "Nombre", key: "name", sortable: true },
                { label: "Email", key: "email", sortable: true },
                { label: "Rol", key: "role", sortable: true },
                { label: "Estado", key: "status", sortable: true },
                { label: "Acciones", key: null, sortable: false },
              ].map((h) => (
                <th key={h.label} onClick={() => h.sortable && handleSort(h.key)}
                  className={`px-5 py-3.5 text-left text-xs font-bold tracking-wide ${h.sortable ? "cursor-pointer hover:opacity-80" : ""}`}
                  style={{ color: "#E7D6FF" }}>
                  <div className="flex items-center gap-2">
                    {h.label}
                    {h.sortable && sortField === h.key && (
                      sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-sm opacity-50">Cargando...</td></tr>
            ) : sortedRows.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-sm opacity-50">Sin resultados</td></tr>
            ) : sortedRows.map((row) => {
              const badgeStatus = BADGE_STYLES[row.status] ?? { backgroundColor: "#5A5870", color: "#fff", label: row.status };
              const badgeRol = BADGE_STYLES[row.role] ?? { backgroundColor: "#5A5870", color: "#fff", label: row.role };
              return (
                <tr key={row.id} className="transition-colors" style={{ borderTop: "1px solid rgba(166,141,200,0.15)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(166,141,200,0.06)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
                  <td className="px-5 py-3.5 text-sm font-bold text-white">
                    <div className="flex items-center gap-2">
                      <UserAvatar name={row.name} />
                      <span>{row.username || "—"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-white">{row.name || "—"}</td>
                  <td className="px-5 py-3.5 text-sm text-white">{row.email || "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold"
                      style={{ backgroundColor: badgeRol.backgroundColor, color: badgeRol.color }}>
                      {badgeRol.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold"
                      style={{ backgroundColor: badgeStatus.backgroundColor, color: badgeStatus.color }}>
                      {badgeStatus.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <ActionBtn onClick={() => setRowSeleccionada(row)} hoverColor="#A68DC8"><Eye size={15} /></ActionBtn>
                      <ActionBtn hoverColor="#8DB051"><Pencil size={14} /></ActionBtn>
                      <ActionBtn hoverColor="#e05c5c"><Trash2 size={14} /></ActionBtn>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="flex justify-between items-center px-1">
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-80"
          style={{ backgroundColor: "#221E3A", border: "1px solid #A68DC8", color: "#E7D6FF" }}>
          <Download size={14} />
          Exportar
        </button>
        <span className="text-xs font-semibold" style={{ color: "#5A5870" }}>
          {totalRegistros === 0
            ? "Sin resultados"
            : `${(paginaActiva - 1) * LIMIT + 1} – ${Math.min(paginaActiva * LIMIT, totalRegistros)} de ${totalRegistros}`}
        </span>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setPaginaActiva((p) => Math.max(1, p - 1))}
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-all hover:opacity-80"
            style={{ backgroundColor: "#221E3A", border: "1px solid #A68DC8", color: "#A68DC8" }}>
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: Math.min(totalPaginas, 4) }, (_, i) => i + 1).map((n) => (
            <button key={n} onClick={() => setPaginaActiva(n)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all"
              style={paginaActiva === n
                ? { backgroundColor: "#E7D6FF", border: "1px solid #E7D6FF", color: "#221E3A" }
                : { backgroundColor: "#221E3A", border: "1px solid #A68DC8", color: "#A68DC8" }}>
              {n}
            </button>
          ))}
          <button onClick={() => setPaginaActiva((p) => Math.min(totalPaginas, p + 1))}
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-all hover:opacity-80"
            style={{ backgroundColor: "#221E3A", border: "1px solid #A68DC8", color: "#A68DC8" }}>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* MODAL */}
      {rowSeleccionada && (
        <ModalDetalle
          row={rowSeleccionada}
          onClose={() => setRowSeleccionada(null)}
        />
      )}
    </div>
  );
}
