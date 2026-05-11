import { useState, useEffect } from "react";
import { X, Calendar, User, Package } from "lucide-react";

import Tarjetas    from "../components/Tarjetas";
import ToolBar     from "../components/ToolBar";
import Tabla       from "../components/Tabla";
import AccionesTabla from "../components/AccionesTabla";
import Etiquetas   from "../components/Etiquetas";
import Paginacion  from "../components/Paginacion";

const LIMIT = 10;

const MOCK_ROWS = [
  {
    id: 1, folio: "REC-001", supplierNombre: "Distribuidora Norte S.A.", fecha: "10/05/2026",
    createdBy: "admin", status: "CONFIRMED", total: 45800,
    createdAt: "2026-05-10T10:00:00Z", updatedAt: "2026-05-10T11:30:00Z",
    items: [
      { sku: "PROD-001", productNombre: "Papel Bond A4 500 hojas", cantidad: 20, costoUnitario: 85, subtotal: 1700 },
      { sku: "PROD-002", productNombre: "Tóner HP LaserJet", cantidad: 5, costoUnitario: 1200, subtotal: 6000 },
      { sku: "PROD-003", productNombre: "Silla Ergonómica Ejecutiva", cantidad: 10, costoUnitario: 3810, subtotal: 38100 },
    ],
  },
  {
    id: 2, folio: "REC-002", supplierNombre: "Tecnología Total S.R.L.", fecha: "09/05/2026",
    createdBy: "jgarcia", status: "DRAFT", total: 128500,
    createdAt: "2026-05-09T08:00:00Z", updatedAt: "2026-05-09T09:15:00Z",
    items: [
      { sku: "TECH-010", productNombre: "Monitor 27\" Full HD", cantidad: 8, costoUnitario: 5500, subtotal: 44000 },
      { sku: "TECH-011", productNombre: "Teclado Mecánico RGB", cantidad: 8, costoUnitario: 1800, subtotal: 14400 },
      { sku: "TECH-012", productNombre: "Laptop Dell Inspiron 15", cantidad: 5, costoUnitario: 14020, subtotal: 70100 },
    ],
  },
  {
    id: 3, folio: "REC-003", supplierNombre: "Abarrotes del Centro", fecha: "08/05/2026",
    createdBy: "mlopez", status: "CONFIRMED", total: 9200,
    createdAt: "2026-05-08T14:00:00Z", updatedAt: "2026-05-08T14:45:00Z",
    items: [
      { sku: "ALM-020", productNombre: "Café Molido 1kg", cantidad: 30, costoUnitario: 180, subtotal: 5400 },
      { sku: "ALM-021", productNombre: "Azúcar estándar 5kg", cantidad: 20, costoUnitario: 95, subtotal: 1900 },
      { sku: "ALM-022", productNombre: "Agua purificada 20L", cantidad: 20, costoUnitario: 95, subtotal: 1900 },
    ],
  },
  {
    id: 4, folio: "REC-004", supplierNombre: "Ferretera Guadalajara", fecha: "07/05/2026",
    createdBy: "admin", status: "DRAFT", total: 32400,
    createdAt: "2026-05-07T16:00:00Z", updatedAt: "2026-05-07T16:30:00Z",
    items: [
      { sku: "FERR-005", productNombre: "Taladro Percutor 800W", cantidad: 4, costoUnitario: 2850, subtotal: 11400 },
      { sku: "FERR-006", productNombre: "Caja de herramientas 120 pzas", cantidad: 6, costoUnitario: 1800, subtotal: 10800 },
      { sku: "FERR-007", productNombre: "Escalera de aluminio 3m", cantidad: 4, costoUnitario: 2550, subtotal: 10200 },
    ],
  },
  {
    id: 5, folio: "REC-005", supplierNombre: "Papelería el Estudiante", fecha: "06/05/2026",
    createdBy: "rnunez", status: "CONFIRMED", total: 5600,
    createdAt: "2026-05-06T09:00:00Z", updatedAt: "2026-05-06T09:20:00Z",
    items: [
      { sku: "PAP-030", productNombre: "Cuaderno profesional 100 hojas", cantidad: 50, costoUnitario: 42, subtotal: 2100 },
      { sku: "PAP-031", productNombre: "Plumas BIC azul (caja 12)", cantidad: 30, costoUnitario: 55, subtotal: 1650 },
      { sku: "PAP-032", productNombre: "Folder manila tamaño carta", cantidad: 100, costoUnitario: 18.5, subtotal: 1850 },
    ],
  },
];

const MOCK_STATS = { total: 5, confirmadas: 3, draft: 2 };

const ENCABEZADOS = ["Folio", "Proveedor", "Fecha", "Usuario", "Items", "Total", "Estado", "Acciones"];

const OPCIONES_FILTRO = [
  { value: "",          label: "Todos"       },
  { value: "CONFIRMED", label: "Confirmadas" },
  { value: "DRAFT",     label: "Draft"       },
];

function formatMoney(n) {
  return `$${Number(n).toLocaleString("es-MX")}`;
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX");
}

/* ─── Modal detalle ─── */
function ModalDetalle({ row, onClose, onConfirmar }) {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  const unidadesTotales = row.items.reduce((acc, i) => acc + i.cantidad, 0);
  const esDraft = row.status === "DRAFT";
  const estadoLabel = row.status === "CONFIRMED" ? "Confirmado" : "Draft";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <div className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
        style={{ backgroundColor: "#221E3A", border: "1px solid #A68DC8", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header modal */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="px-4 py-1.5 rounded-full text-xs font-bold"
                style={{ backgroundColor: "#56538E", color: "#E7D6FF" }}>
                {row.folio}
              </span>
              <Etiquetas contenido={estadoLabel} />
            </div>
            <div className="flex items-center gap-2">
              {esDraft && (
                <button onClick={() => onConfirmar(row.id)}
                  className="px-4 py-1.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
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
        <div className="mx-6 mb-4 rounded-xl overflow-hidden"
          style={{ border: "1px solid #A68DC8", backgroundColor: "#2C2A48" }}>
          <div className="grid grid-cols-3">
            {[
              { label: "Items distintos",  value: row.items.length,      color: "text-white" },
              { label: "Unidades totales", value: unidadesTotales,        color: "text-white" },
              { label: "Total",            value: formatMoney(row.total), color: "text-[#8DB051]" },
            ].map((stat, i) => (
              <div key={i} className="px-4 py-3 text-center"
                style={{ borderRight: i < 2 ? "1px solid rgba(166,141,200,0.3)" : "none" }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#5A5870" }}>{stat.label}</p>
                <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Items */}
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
                {[
                  { label: "Cantidad",    value: item.cantidad },
                  { label: "Costo unit.", value: formatMoney(item.costoUnitario) },
                  { label: "Subtotal",    value: formatMoney(item.subtotal) },
                ].map((col) => (
                  <div key={col.label} className="text-center">
                    <p className="text-xs font-semibold mb-0.5" style={{ color: "#5A5870" }}>{col.label}</p>
                    <p className="text-lg font-extrabold" style={{ color: "#C9B8E8" }}>{col.value}</p>
                  </div>
                ))}
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
          <AccionesTabla onEliminar={() => {}} onEditar={() => {}} />
        </div>
      </div>
    </div>
  );
}

/* ─── Página principal ─── */
export default function Recepciones() {
  const [rows, setRows]                       = useState([]);
  const [stats, setStats]                     = useState({ total: 0, confirmadas: 0, draft: 0 });
  const [filtro, setFiltro]                   = useState("");
  const [busqueda, setBusqueda]               = useState("");
  const [paginaActiva, setPaginaActiva]       = useState(1);
  const [totalRegistros, setTotalRegistros]   = useState(0);
  const [rowSeleccionada, setRowSeleccionada] = useState(null);
  const [loading, setLoading]                 = useState(false);

  useEffect(() => {
    let resultado = [...MOCK_ROWS];
    if (filtro)   resultado = resultado.filter((r) => r.status === filtro);
    if (busqueda) resultado = resultado.filter((r) =>
      r.folio.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.supplierNombre.toLowerCase().includes(busqueda.toLowerCase())
    );
    setTotalRegistros(resultado.length);
    const inicio = (paginaActiva - 1) * LIMIT;
    setRows(resultado.slice(inicio, inicio + LIMIT));
  }, [paginaActiva, filtro, busqueda]);

  useEffect(() => {
    setStats(MOCK_STATS);
  }, []);

  const totalPaginas = Math.ceil(totalRegistros / LIMIT);

  const handleCambiarPagina = (p) => {
    if (p === "‹") setPaginaActiva((prev) => Math.max(1, prev - 1));
    else if (p === "›") setPaginaActiva((prev) => Math.min(totalPaginas, prev + 1));
    else setPaginaActiva(Number(p));
  };

  const handleConfirmar = (id) => {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, status: "CONFIRMED" } : r));
    setRowSeleccionada(null);
  };

  const rango = totalRegistros === 0
    ? "0"
    : `${(paginaActiva - 1) * LIMIT + 1} – ${Math.min(paginaActiva * LIMIT, totalRegistros)}`;

  return (
    <div className="flex flex-col min-h-screen bg-oscuro">
      <div className="flex-1 p-6 lg:p-8 space-y-6">

        <h1 className="text-2xl lg:text-3xl font-extrabold tracking-widest text-blanco uppercase">
          Recepciones
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Tarjetas label="Recepciones" value={stats.total}       sub="este mes"        accent="#7C6AF7" icon="bi bi-box-seam"      />
          <Tarjetas label="Confirmadas" value={stats.confirmadas} sub={`${stats.total ? Math.round(stats.confirmadas / stats.total * 100) : 0}% del total`} accent="#8DB051" icon="bi bi-check-circle" />
          <Tarjetas label="Draft"       value={stats.draft}       sub="en borrador"     accent="#c9c225" icon="bi bi-pencil-square" />
          <Tarjetas label="Total"       value={stats.total}       sub="recepciones"     accent="#A68DC8" icon="bi bi-layers"        />
        </div>

        <ToolBar
          filtro={filtro}
          setFiltro={(v) => { setFiltro(v); setPaginaActiva(1); }}
          opcionesFiltro={OPCIONES_FILTRO}
          busqueda={busqueda}
          setBusqueda={(v) => { setBusqueda(v); setPaginaActiva(1); }}
          placeholderBuscar="Buscar por folio, proveedor..."
          textoBoton="+ Recepción"
          accionBoton={() => {}}
        />

        <Tabla encabezados={ENCABEZADOS}>
          {loading ? (
            <tr><td colSpan={8} className="text-center py-10 text-sm text-lila-soft opacity-50">Cargando...</td></tr>
          ) : rows.length === 0 ? (
            <tr><td colSpan={8} className="text-center py-10 text-sm text-lila-soft opacity-50">Sin resultados</td></tr>
          ) : rows.map((row) => (
            <tr key={row.id} className="border-t border-lila/10 hover:bg-lila/5 transition-colors">
              <td className="p-4 text-center text-sm font-bold text-blanco">{row.folio}</td>
              <td className="p-4 text-center text-sm text-lila-soft">{row.supplierNombre}</td>
              <td className="p-4 text-center text-sm text-lila-soft">{row.fecha}</td>
              <td className="p-4 text-center text-sm text-lila-soft">{row.createdBy || "—"}</td>
              <td className="p-4 text-center text-sm text-lila-soft">{row.items.length}</td>
              <td className="p-4 text-center text-sm font-bold text-verde">{formatMoney(row.total)}</td>
              <td className="p-4 text-center">
                <Etiquetas contenido={row.status === "CONFIRMED" ? "Confirmado" : "Draft"} />
              </td>
              <td className="p-4 text-center">
                <AccionesTabla
                  onVer={() => setRowSeleccionada(row)}
                  onEditar={() => {}}
                  onEliminar={() => {}}
                />
              </td>
            </tr>
          ))}
        </Tabla>

        <Paginacion
          paginaActual={paginaActiva}
          totalRegistros={totalRegistros}
          rangoSiguiente={rango}
          onExportar={() => {}}
          onCambiarPagina={handleCambiarPagina}
        />

      </div>

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
