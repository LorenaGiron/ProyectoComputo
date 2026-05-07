import { useState, useRef, useEffect } from "react";
import {
  Eye, Pencil, Trash2, Plus, Filter, Download,
  ChevronLeft, ChevronRight, FileInput, CheckCircle,
  XCircle, Monitor, X, Calendar, User, Package,
} from "lucide-react";

const ROWS_INIT = [
  {
    folio: "FAC-1000", proveedor: "Proveedor 1", fecha: "10-05-2026", usuario: "Usuario1",
    items: 50, total: "$1,800", estado: "Cancelada",
    creado: "10-05-2025", editado: "10-04-2026",
    itemsDetalle: [
      { sku: "SKU-001", nombre: "Playera Oversize", cantidad: 12, costoUnitario: "$50", subtotal: "$600" },
      { sku: "SKU-002", nombre: "Pantalón Slim",    cantidad: 12, costoUnitario: "$50", subtotal: "$600" },
      { sku: "SKU-003", nombre: "Chamarra Denim",   cantidad: 12, costoUnitario: "$50", subtotal: "$600" },
    ],
  },
  {
    folio: "FAC-1001", proveedor: "Proveedor 1", fecha: "10-05-2026", usuario: "Usuario1",
    items: 50, total: "$1,800", estado: "Confirmada",
    creado: "10-05-2025", editado: "10-04-2026",
    itemsDetalle: [
      { sku: "SKU-002", nombre: "Pantalón Slim",  cantidad: 8,  costoUnitario: "$75",  subtotal: "$600" },
      { sku: "SKU-003", nombre: "Chamarra Denim", cantidad: 5,  costoUnitario: "$120", subtotal: "$600" },
    ],
  },
  {
    folio: "FAC-1002", proveedor: "Proveedor 1", fecha: "10-05-2026", usuario: "Usuario1",
    items: 50, total: "$1,800", estado: "Draft",
    creado: "10-05-2025", editado: "10-04-2026",
    itemsDetalle: [
      { sku: "SKU-001", nombre: "Playera Oversize", cantidad: 12, costoUnitario: "$50", subtotal: "$600" },
      { sku: "SKU-001", nombre: "Playera Oversize", cantidad: 12, costoUnitario: "$50", subtotal: "$600" },
      { sku: "SKU-001", nombre: "Playera Oversize", cantidad: 12, costoUnitario: "$50", subtotal: "$600" },
    ],
  },
  {
    folio: "FAC-1003", proveedor: "Proveedor 1", fecha: "10-05-2026", usuario: "Usuario1",
    items: 50, total: "$1,800", estado: "Confirmada",
    creado: "10-05-2025", editado: "10-04-2026",
    itemsDetalle: [
      { sku: "SKU-001", nombre: "Playera Oversize", cantidad: 12, costoUnitario: "$50", subtotal: "$600" },
      { sku: "SKU-005", nombre: "Falda Plisada",    cantidad: 6,  costoUnitario: "$100", subtotal: "$600" },
    ],
  },
  {
    folio: "FAC-1004", proveedor: "Proveedor 1", fecha: "10-05-2026", usuario: "Usuario1",
    items: 50, total: "$1,800", estado: "Confirmada",
    creado: "10-05-2025", editado: "10-04-2026",
    itemsDetalle: [
      { sku: "SKU-006", nombre: "Blusa Satinada", cantidad: 15, costoUnitario: "$60", subtotal: "$900" },
      { sku: "SKU-007", nombre: "Shorts Lino",    cantidad: 10, costoUnitario: "$90", subtotal: "$900" },
    ],
  },
];

const BADGE_STYLES = {
  Confirmada: { backgroundColor: "#8DB051", color: "#ffffff" },
  Cancelada:  { backgroundColor: "#e05c5c", color: "#ffffff" },
  Draft:      { backgroundColor: "#c9c225", color: "#1a1a1a" },
};

const OPCIONES_FILTRO = ["Cancelada", "Confirmada", "Draft"];

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
        <button onClick={() => { setInputVal(""); onChange(""); }} className="absolute right-2.5 top-1/2 -translate-y-1/2"
          style={{ color: "#5A5870" }}
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
              {op}
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

  const unidadesTotales = row.itemsDetalle.reduce((acc, i) => acc + i.cantidad, 0);
  const esDraft = row.estado === "Draft";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
        style={{ backgroundColor: "#221E3A", border: "1px solid #A68DC8", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="px-4 py-1.5 rounded-full text-xs font-bold"
                style={{ backgroundColor: "#56538E", border: "1px solid #56538E", color: "#E7D6FF" }}>
                {row.folio}
              </span>
              <span className="px-4 py-1.5 rounded-full text-xs font-bold" style={BADGE_STYLES[row.estado]}>
                {row.estado.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Botón Confirmar — solo si es Draft */}
              {esDraft && (
                <button
                  onClick={() => onConfirmar(row.folio)}
                  className="px-4 py-1.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 hover:-translate-y-0.5"
                  style={{ backgroundColor: "#E7D6FF", color: "#221E3A" }}
                >
                  Confirmar
                </button>
              )}
              {/* Cerrar */}
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                style={{ backgroundColor: "rgba(166,141,200,0.15)", color: "#E7D6FF" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(166,141,200,0.3)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(166,141,200,0.15)")}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Proveedor */}
          <h2 className="text-xl font-extrabold text-white mb-2">{row.proveedor}</h2>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-sm" style={{ color: "#C9B8E8" }}>
              <Calendar size={13} style={{ color: "#A68DC8" }} />{row.fecha}
            </span>
            <span className="flex items-center gap-1.5 text-sm" style={{ color: "#C9B8E8" }}>
              <User size={13} style={{ color: "#A68DC8" }} />{row.usuario}
            </span>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="mx-6 mb-4 rounded-xl overflow-hidden" style={{ border: "1px solid #A68DC8", backgroundColor: "#2C2A48" }}>
          <div className="grid grid-cols-3">
            <div className="px-4 py-3 text-center" style={{ borderRight: "1px solid rgba(166,141,200,0.3)" }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#5A5870" }}>Items distintos</p>
              <p className="text-2xl font-extrabold text-white">{row.itemsDetalle.length}</p>
            </div>
            <div className="px-4 py-3 text-center" style={{ borderRight: "1px solid rgba(166,141,200,0.3)" }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#5A5870" }}>Unidades totales</p>
              <p className="text-2xl font-extrabold text-white">{unidadesTotales}</p>
            </div>
            <div className="px-4 py-3 text-center">
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#5A5870" }}>Total</p>
              <p className="text-2xl font-extrabold" style={{ color: "#8DB051" }}>{row.total}</p>
            </div>
          </div>
        </div>

        {/* ── Detalle de items ── */}
        <div className="px-6 mb-4">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#5A5870" }}>
            Detalles de Items
          </p>
          <div className="flex flex-col gap-3">
            {row.itemsDetalle.map((item, i) => (
              <div key={i} className="flex items-center gap-4 rounded-xl px-4 py-3"
                style={{ backgroundColor: "#2C2A48", border: "1px solid #56538E" }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "rgba(86,83,142,0.25)", color: "#56538E" }}>
                  <Package size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">{item.sku}</p>
                  <p className="text-xs" style={{ color: "#C9B8E8" }}>{item.nombre}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold mb-0.5" style={{ color: "#5A5870" }}>Cantidad</p>
                  <p className="text-lg font-extrabold" style={{ color: "#C9B8E8" }}>{item.cantidad}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold mb-0.5" style={{ color: "#5A5870" }}>Costo unitario</p>
                  <p className="text-lg font-extrabold" style={{ color: "#C9B8E8" }}>{item.costoUnitario}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold mb-0.5" style={{ color: "#5A5870" }}>Subtotal</p>
                  <p className="text-lg font-extrabold" style={{ color: "#64A8BD" }}>{item.subtotal}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 flex items-center justify-between"
          style={{ borderTop: "1px solid rgba(166,141,200,0.15)" }}>
          <div className="flex gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#5A5870" }}>Creado</p>
              <p className="text-sm font-semibold" style={{ color: "#A68DC8" }}>{row.creado}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#5A5870" }}>Editado</p>
              <p className="text-sm font-semibold" style={{ color: "#A68DC8" }}>{row.editado}</p>
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

/* ─── Página principal ─── */
export default function Recepciones() {
  const [rows, setRows] = useState(ROWS_INIT);
  const [filtro, setFiltro] = useState("");
  const [paginaActiva, setPaginaActiva] = useState(1);
  const [rowSeleccionada, setRowSeleccionada] = useState(null);

  const filasFiltradas = filtro
    ? rows.filter((r) => {
        const q = filtro.toLowerCase();
        return (
          r.estado.toLowerCase().includes(q) ||
          r.folio.toLowerCase().includes(q) ||
          r.proveedor.toLowerCase().includes(q) ||
          r.usuario.toLowerCase().includes(q) ||
          r.fecha.toLowerCase().includes(q)
        );
      })
    : rows;

  const handleConfirmar = (folio) => {
    setRows((prev) =>
      prev.map((r) => r.folio === folio ? { ...r, estado: "Confirmada" } : r)
    );
    setRowSeleccionada(null);
  };

  return (
    <div className="min-h-screen p-7" style={{ backgroundColor: "#2C2A48", color: "#E7D6FF" }}>

      {/* TÍTULO */}
      <h1 className="text-3xl font-extrabold tracking-widest mb-6 text-white">RECEPCIONES</h1>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <div className="rounded-2xl p-5 transition-transform hover:-translate-y-1 hover:shadow-xl"
          style={{ backgroundColor: "#221E3A", border: "1px solid #A68DC8", borderLeft: "6px solid #A68DC8" }}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-semibold" style={{ color: "#C9B8E8" }}>Recepciones</span>
            <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(166,141,200,0.18)", color: "#A68DC8" }}><FileInput size={17} /></span>
          </div>
          <p className="font-extrabold text-white leading-tight mb-1" style={{ fontSize: "2.6rem" }}>248</p>
          <p className="text-xs font-semibold" style={{ color: "#5A5870" }}>este mes</p>
        </div>

        <div className="rounded-2xl p-5 transition-transform hover:-translate-y-1 hover:shadow-xl"
          style={{ backgroundColor: "#221E3A", border: "1px solid #A68DC8", borderLeft: "6px solid #8DB051" }}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-semibold" style={{ color: "#C9B8E8" }}>Confirmadas</span>
            <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(141,176,81,0.18)", color: "#8DB051" }}><CheckCircle size={17} /></span>
          </div>
          <p className="font-extrabold leading-tight mb-1" style={{ fontSize: "2.6rem", color: "#8DB051" }}>183</p>
          <p className="text-xs font-semibold" style={{ color: "#5A5870" }}>Esto es un 73%</p>
        </div>

        <div className="rounded-2xl p-5 transition-transform hover:-translate-y-1 hover:shadow-xl"
          style={{ backgroundColor: "#221E3A", border: "1px solid #A68DC8", borderLeft: "6px solid #e8814a" }}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-semibold" style={{ color: "#C9B8E8" }}>Canceladas</span>
            <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(232,129,74,0.18)", color: "#e8814a" }}><XCircle size={17} /></span>
          </div>
          <p className="font-extrabold leading-tight mb-1" style={{ fontSize: "2.6rem", color: "#e8814a" }}>41</p>
          <p className="text-xs font-semibold" style={{ color: "#5A5870" }}>Esto es un 9.7%</p>
        </div>

        <div className="rounded-2xl p-5 transition-transform hover:-translate-y-1 hover:shadow-xl"
          style={{ backgroundColor: "#221E3A", border: "1px solid #A68DC8", borderLeft: "6px solid #C9B8E8" }}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-semibold" style={{ color: "#C9B8E8" }}>Total</span>
            <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(201,184,232,0.18)", color: "#C9B8E8" }}><Monitor size={17} /></span>
          </div>
          <p className="font-extrabold text-white leading-tight mb-1" style={{ fontSize: "2.6rem" }}>20,000</p>
          <p className="text-xs font-semibold" style={{ color: "#5A5870" }}>Recepciones</p>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex justify-between items-center mb-4 gap-3">
        <FiltroCombobox value={filtro} onChange={setFiltro} />
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
            {filasFiltradas.map((row, i) => (
              <tr key={i} className="transition-colors" style={{ borderTop: "1px solid rgba(166,141,200,0.15)" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(166,141,200,0.06)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
                <td className="px-5 py-3.5 text-sm font-bold" style={{ color: "#ffffff" }}>{row.folio}</td>
                <td className="px-5 py-3.5 text-sm font-semibold" style={{ color: "#ffffff" }}>{row.proveedor}</td>
                <td className="px-5 py-3.5 text-sm" style={{ color: "#ffffff" }}>{row.fecha}</td>
                <td className="px-5 py-3.5 text-sm" style={{ color: "#ffffff" }}>{row.usuario}</td>
                <td className="px-5 py-3.5 text-sm" style={{ color: "#ffffff" }}>{row.items}</td>
                <td className="px-5 py-3.5 text-sm font-bold" style={{ color: "#8DB051" }}>{row.total}</td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold" style={BADGE_STYLES[row.estado]}>
                    {row.estado}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <button className="p-1 rounded-md transition-colors" style={{ color: "#ffffff" }}
                      onClick={() => setRowSeleccionada(row)}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "#A68DC8"; e.currentTarget.style.backgroundColor = "rgba(166,141,200,0.15)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "#ffffff"; e.currentTarget.style.backgroundColor = "transparent"; }}>
                      <Eye size={15} />
                    </button>
                    <button className="p-1 rounded-md transition-colors" style={{ color: "#ffffff" }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "#8DB051"; e.currentTarget.style.backgroundColor = "rgba(141,176,81,0.15)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "#ffffff"; e.currentTarget.style.backgroundColor = "transparent"; }}>
                      <Pencil size={14} />
                    </button>
                    <button className="p-1 rounded-md transition-colors" style={{ color: "#ffffff" }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "#e05c5c"; e.currentTarget.style.backgroundColor = "rgba(224,92,92,0.15)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "#ffffff"; e.currentTarget.style.backgroundColor = "transparent"; }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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
        <span className="text-xs font-semibold" style={{ color: "#5A5870" }}>1 – 5 de 20,000</span>
        <div className="flex items-center gap-1.5">
          <button className="w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-all hover:opacity-80"
            style={{ backgroundColor: "#221E3A", border: "1px solid #A68DC8", color: "#A68DC8" }}>
            <ChevronLeft size={14} />
          </button>
          {[1, 2, 3, 4].map((n) => (
            <button key={n} onClick={() => setPaginaActiva(n)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all"
              style={paginaActiva === n
                ? { backgroundColor: "#E7D6FF", border: "1px solid #E7D6FF", color: "#221E3A" }
                : { backgroundColor: "#221E3A", border: "1px solid #A68DC8", color: "#A68DC8" }}>
              {n}
            </button>
          ))}
          <button className="w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-all hover:opacity-80"
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