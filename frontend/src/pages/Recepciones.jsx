import { useState, useEffect, useRef } from "react";
import { api } from "../services/api";
import {
  Eye, Pencil, Trash2, Plus, Filter, Download,
  ChevronLeft, ChevronRight, FileInput, CheckCircle,
  XCircle, Monitor, X, Calendar, User, Package,
} from "lucide-react";

const BADGE_STYLES = {
  CONFIRMED: { backgroundColor: "#8DB051", color: "#ffffff", label: "Confirmada" },
  DRAFT:     { backgroundColor: "#c9c225", color: "#1a1a1a", label: "Draft"      },
};

const OPCIONES_FILTRO = ["DRAFT", "CONFIRMED"];

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX");
}

function formatMoney(n) {
  return `$${Number(n).toLocaleString("es-MX")}`;
}

/* ─── Combobox filtro ─── */
function FiltroCombobox({ value, onChange }) {
  const [inputVal, setInputVal] = useState(value || "");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => { if (!value) setInputVal(""); }, [value]);
  useEffect(() => {
    const h = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const opciones = OPCIONES_FILTRO.filter((o) => o.toLowerCase().includes(inputVal.toLowerCase()));

  return (
    <div ref={wrapperRef} className="relative w-56">
      <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#5A5870" }} />
      <input
        type="text" value={inputVal} placeholder="Filtrar por..."
        onChange={(e) => { setInputVal(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        className="w-full rounded-xl text-sm font-semibold pl-9 pr-8 py-2.5 outline-none transition-colors"
        style={{ backgroundColor: "#221E3A", border: "1px solid #A68DC8", color: inputVal ? "#E7D6FF" : "#5A5870" }}
      />
      {inputVal && (
        <button onClick={() => { setInputVal(""); onChange(""); }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2" style={{ color: "#5A5870" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#E7D6FF")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#5A5870")}>
          <X size={13} />
        </button>
      )}
      {open && opciones.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-xl overflow-hidden shadow-xl"
          style={{ backgroundColor: "#221E3A", border: "1px solid #A68DC8" }}>
          {opciones.map((op) => (
            <li key={op} onMouseDown={() => { setInputVal(op); onChange(op); setOpen(false); }}
              className="px-4 py-2.5 text-sm font-semibold cursor-pointer transition-colors" style={{ color: "#E7D6FF" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(166,141,200,0.2)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
              {BADGE_STYLES[op]?.label ?? op}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ─── Modal detalle recepción ─── */
function ModalDetalle({ row, onClose, onConfirmar }) {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  const badge = BADGE_STYLES[row.status] ?? { backgroundColor: "#5A5870", color: "#fff", label: row.status };
  const unidadesTotales = row.items.reduce((acc, i) => acc + i.cantidad, 0);
  const esDraft = row.status === "DRAFT";

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
                style={{ backgroundColor: "#56538E", border: "1px solid #56538E", color: "#E7D6FF" }}>
                {row.folio}
              </span>
              <span className="px-4 py-1.5 rounded-full text-xs font-bold"
                style={{ backgroundColor: badge.backgroundColor, color: badge.color }}>
                {badge.label.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {esDraft && (
                <button onClick={() => onConfirmar(row.id)}
                  className="px-4 py-1.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 hover:-translate-y-0.5"
                  style={{ backgroundColor: "#E7D6FF", color: "#221E3A" }}>
                  Confirmar
                </button>
              )}
              <button onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                style={{ backgroundColor: "rgba(166,141,200,0.15)", color: "#E7D6FF" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(166,141,200,0.3)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(166,141,200,0.15)")}>
                <X size={16} />
              </button>
            </div>
          </div>

          <h2 className="text-xl font-extrabold text-white mb-2">{row.supplierNombre}</h2>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-sm" style={{ color: "#C9B8E8" }}>
              <Calendar size={13} style={{ color: "#A68DC8" }} />{row.fecha}
            </span>
            <span className="flex items-center gap-1.5 text-sm" style={{ color: "#C9B8E8" }}>
              <User size={13} style={{ color: "#A68DC8" }} />{row.createdBy || "—"}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="mx-6 mb-4 rounded-xl overflow-hidden" style={{ border: "1px solid #A68DC8", backgroundColor: "#2C2A48" }}>
          <div className="grid grid-cols-3">
            <div className="px-4 py-3 text-center" style={{ borderRight: "1px solid rgba(166,141,200,0.3)" }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#5A5870" }}>Items distintos</p>
              <p className="text-2xl font-extrabold text-white">{row.items.length}</p>
            </div>
            <div className="px-4 py-3 text-center" style={{ borderRight: "1px solid rgba(166,141,200,0.3)" }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#5A5870" }}>Unidades totales</p>
              <p className="text-2xl font-extrabold text-white">{unidadesTotales}</p>
            </div>
            <div className="px-4 py-3 text-center">
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#5A5870" }}>Total</p>
              <p className="text-2xl font-extrabold" style={{ color: "#8DB051" }}>{formatMoney(row.total)}</p>
            </div>
          </div>
        </div>

        {/* Detalle de items */}
        <div className="px-6 mb-4">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#5A5870" }}>
            Detalles de Items
          </p>
          <div className="flex flex-col gap-3">
            {row.items.map((item, i) => (
              <div key={i} className="flex items-center gap-4 rounded-xl px-4 py-3"
                style={{ backgroundColor: "#2C2A48", border: "1px solid #56538E" }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "rgba(86,83,142,0.25)", color: "#56538E" }}>
                  <Package size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">{item.sku}</p>
                  <p className="text-xs" style={{ color: "#C9B8E8" }}>{item.productNombre}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold mb-0.5" style={{ color: "#5A5870" }}>Cantidad</p>
                  <p className="text-lg font-extrabold" style={{ color: "#C9B8E8" }}>{item.cantidad}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold mb-0.5" style={{ color: "#5A5870" }}>Costo unit.</p>
                  <p className="text-lg font-extrabold" style={{ color: "#C9B8E8" }}>{formatMoney(item.costoUnitario)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold mb-0.5" style={{ color: "#5A5870" }}>Subtotal</p>
                  <p className="text-lg font-extrabold" style={{ color: "#64A8BD" }}>{formatMoney(item.subtotal)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer modal */}
        <div className="px-6 py-4 flex items-center justify-between"
          style={{ borderTop: "1px solid rgba(166,141,200,0.15)" }}>
          <div className="flex gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#5A5870" }}>Creado</p>
              <p className="text-sm font-semibold" style={{ color: "#A68DC8" }}>{formatDate(row.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#5A5870" }}>Editado</p>
              <p className="text-sm font-semibold" style={{ color: "#A68DC8" }}>{formatDate(row.updatedAt)}</p>
            </div>
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

/* ─── Página principal ─── */
const LIMIT = 10;

export default function Recepciones() {
  const [rows, setRows]                     = useState([]);
  const [stats, setStats]                   = useState({ total: 0, confirmadas: 0, draft: 0, monto: 0 });
  const [filtro, setFiltro]                 = useState("");
  const [paginaActiva, setPaginaActiva]     = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [rowSeleccionada, setRowSeleccionada] = useState(null);
  const [loading, setLoading]               = useState(true);

  // Tabla con paginación y filtro
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: paginaActiva, limit: LIMIT });
    if (filtro) params.set("status", filtro);

    api.get(`/recepciones?${params}`)
      .then((res) => { setRows(res.items); setTotalRegistros(res.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [paginaActiva, filtro]);

  // Stats de las cards
  useEffect(() => {
    Promise.all([
      api.get("/recepciones?limit=1"),
      api.get("/recepciones?status=CONFIRMED&limit=1"),
      api.get("/recepciones?status=DRAFT&limit=1"),
    ]).then(([all, confirmed, draft]) => {
      api.get(`/recepciones?limit=${all.total || 1}`).then((full) => {
        const monto = full.items.reduce((acc, r) => acc + r.total, 0);
        setStats({ total: all.total, confirmadas: confirmed.total, draft: draft.total, monto });
      });
    }).catch(console.error);
  }, []);

  const totalPaginas = Math.ceil(totalRegistros / LIMIT);

  const handleConfirmar = (id) => {
    api.patch(`/recepciones/${id}/confirm`)
      .then(() => {
        setRowSeleccionada(null);
        // Recargar tabla y stats
        setPaginaActiva((p) => p);
      })
      .catch(console.error);
  };

  return (
    <div className="min-h-screen p-7" style={{ backgroundColor: "#2C2A48", color: "#E7D6FF" }}>

      {/* TÍTULO */}
      <h1 className="text-3xl font-extrabold tracking-widest mb-6 text-white">RECEPCIONES</h1>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <StatCard label="Recepciones" value={stats.total}       sub="este mes"        color="#A68DC8" icon={<FileInput size={17}   />} />
        <StatCard label="Confirmadas" value={stats.confirmadas} sub={`${stats.total ? Math.round(stats.confirmadas / stats.total * 100) : 0}% del total`} color="#8DB051" icon={<CheckCircle size={17} />} />
        <StatCard label="Draft"       value={stats.draft}       sub="en borrador"     color="#c9c225" icon={<XCircle size={17}     />} />
        <StatCard label="Total" value={stats.total} sub="recepciones" color="#C9B8E8" icon={<Monitor size={17} />} />
      </div>

      {/* TOOLBAR */}
      <div className="flex justify-between items-center mb-4 gap-3">
        <FiltroCombobox value={filtro} onChange={(v) => { setFiltro(v); setPaginaActiva(1); }} />
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all hover:opacity-90 hover:-translate-y-0.5"
          style={{ backgroundColor: "#E7D6FF", color: "#221E3A" }}>
          <Plus size={15} strokeWidth={3} />
          Recepción
        </button>
      </div>

      {/* TABLA */}
      <div className="rounded-2xl overflow-hidden mb-5" style={{ backgroundColor: "#221E3A", border: "1px solid #A68DC8" }}>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: "rgba(0,0,0,0.18)" }}>
              {["Folio", "Proveedor", "Fecha", "Usuario", "Items", "Total", "Estado", "Acciones"].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-bold tracking-wide" style={{ color: "#E7D6FF" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-10 text-sm opacity-50">Cargando...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-10 text-sm opacity-50">Sin resultados</td></tr>
            ) : rows.map((row) => {
              const badge = BADGE_STYLES[row.status] ?? { backgroundColor: "#5A5870", color: "#fff", label: row.status };
              return (
                <tr key={row.id} className="transition-colors" style={{ borderTop: "1px solid rgba(166,141,200,0.15)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(166,141,200,0.06)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
                  <td className="px-5 py-3.5 text-sm font-bold text-white">{row.folio}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-white">{row.supplierNombre}</td>
                  <td className="px-5 py-3.5 text-sm text-white">{row.fecha}</td>
                  <td className="px-5 py-3.5 text-sm text-white">{row.createdBy || "—"}</td>
                  <td className="px-5 py-3.5 text-sm text-white">{row.items.length}</td>
                  <td className="px-5 py-3.5 text-sm font-bold" style={{ color: "#8DB051" }}>{formatMoney(row.total)}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold"
                      style={{ backgroundColor: badge.backgroundColor, color: badge.color }}>
                      {badge.label}
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
          onConfirmar={handleConfirmar}
        />
      )}
    </div>
  );
}
