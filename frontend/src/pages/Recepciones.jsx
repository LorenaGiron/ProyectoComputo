import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import { X, Calendar, User, Package } from "lucide-react";

import Tarjetas      from "../components/Tarjetas";
import ToolBar       from "../components/ToolBar";
import Tabla         from "../components/Tabla";
import AccionesTabla from "../components/AccionesTabla";
import Etiquetas     from "../components/Etiquetas";
import Paginacion    from "../components/Paginacion";
import ModalConfirmacion from "../components/ModalConfirmacion";

const LIMIT = 10;

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

const inputStyle = {
  backgroundColor: "#2C2A48",
  border: "1px solid #56538E",
  color: "#E7D6FF",
  borderRadius: "10px",
  padding: "8px 12px",
  fontSize: "14px",
  width: "100%",
  outline: "none",
};

const labelStyle = {
  fontSize: "11px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#5A5870",
  marginBottom: "4px",
  display: "block",
};

/* ─── Modal crear / editar ─── */
function ModalForm({ row, esNuevo, onClose, onGuardar }) {
  const [suppliers, setSuppliers]                     = useState([]);
  const [products, setProducts]                       = useState([]);
  const [guardando, setGuardando]                     = useState(false);
  const [error, setError]                             = useState("");
  const [confirmarDescartar, setConfirmarDescartar]   = useState(false);

  const [form, setForm] = useState({
    supplierId:     row.supplierId     || "",
    supplierNombre: row.supplierNombre || "",
    folio:          row.folio          || "",
    fecha:          row.fecha          || new Date().toLocaleDateString("es-MX"),
    comentarios:    row.comentarios    || "",
    status:         row.status         || "DRAFT",
    items:          row.items.map((i) => ({ ...i })),
  });

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") setConfirmarDescartar(true); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  useEffect(() => {
    api.get("/suppliers?limit=100").then((res) => setSuppliers(res.items)).catch(console.error);
    api.get("/products?limit=100&activo=true").then((res) => setProducts(res.items)).catch(console.error);
  }, []);

  const handleSupplierChange = (id) => {
    const sup = suppliers.find((s) => s.id === id);
    setForm((p) => ({ ...p, supplierId: id, supplierNombre: sup ? sup.nombre : "" }));
  };

  const handleProductChange = (idx, productId) => {
    const prod = products.find((p) => p.id === productId);
    setForm((prev) => {
      const items = prev.items.map((item, i) => {
        if (i !== idx) return item;
        const costoUnitario = prod ? prod.precioCompra : 0;
        const cantidad = item.cantidad || 1;
        return { ...item, productId, sku: prod?.sku || "", productNombre: prod?.nombre || "", costoUnitario, subtotal: cantidad * costoUnitario };
      });
      return { ...prev, items };
    });
  };

  const handleItemChange = (idx, campo, valor) => {
    setForm((prev) => {
      const items = prev.items.map((item, i) => {
        if (i !== idx) return item;
        const updated = { ...item, [campo]: campo === "cantidad" || campo === "costoUnitario" ? Number(valor) : valor };
        updated.subtotal = updated.cantidad * updated.costoUnitario;
        return updated;
      });
      return { ...prev, items };
    });
  };

  const agregarItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { productId: "", sku: "", productNombre: "", cantidad: 1, costoUnitario: 0, subtotal: 0 }],
    }));
  };

  const eliminarItem = (idx) => {
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  const totalCalculado = form.items.reduce((acc, i) => acc + i.subtotal, 0);

  const handleGuardar = async () => {
    setError("");
    if (!form.supplierId) return setError("Selecciona un proveedor.");
    if (!form.folio)      return setError("El folio es requerido.");
    if (form.items.some((i) => !i.productId)) return setError("Todos los items deben tener un producto seleccionado.");

    const body = {
      supplierId: form.supplierId, supplierNombre: form.supplierNombre,
      fecha: form.fecha, folio: form.folio, comentarios: form.comentarios || "",
      items: form.items.map((item) => ({
        productId: item.productId, sku: item.sku, productNombre: item.productNombre,
        cantidad: item.cantidad, costoUnitario: item.costoUnitario, subtotal: item.subtotal,
      })),
    };

    setGuardando(true);
    try {
      if (esNuevo) await api.post("/recepciones", body);
      else         await api.patch(`/recepciones/${row.id}`, body);
      onGuardar();
      onClose();
    } catch (e) {
      setError(e.message || "Ocurrió un error al guardar.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        onClick={() => setConfirmarDescartar(true)}>
        <div className="relative w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl"
          style={{ backgroundColor: "#221E3A", border: "1px solid #A68DC8", maxHeight: "90vh", overflowY: "auto" }}
          onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="px-6 pt-6 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="px-4 py-1.5 rounded-full text-xs font-bold"
                style={{ backgroundColor: "#56538E", color: "#E7D6FF" }}>
                {esNuevo ? "NUEVO" : row.folio}
              </span>
              <h2 className="text-lg font-extrabold text-white">
                {esNuevo ? "Nueva Recepción" : "Editar Recepción"}
              </h2>
            </div>
            <button onClick={() => setConfirmarDescartar(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
              style={{ backgroundColor: "rgba(166,141,200,0.15)", color: "#E7D6FF" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(166,141,200,0.3)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(166,141,200,0.15)")}>
              <X size={16} />
            </button>
          </div>

          {/* Campos generales */}
          <div className="px-6 pb-4 grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Proveedor</label>
              <select style={inputStyle} value={form.supplierId}
                onChange={(e) => handleSupplierChange(e.target.value)}>
                <option value="">— Seleccionar —</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Folio</label>
              <input style={esNuevo ? inputStyle : { ...inputStyle, opacity: 0.6, cursor: "not-allowed" }}
                value={form.folio} readOnly={!esNuevo}
                onChange={(e) => setForm((p) => ({ ...p, folio: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Fecha</label>
              <input style={inputStyle} value={form.fecha}
                onChange={(e) => setForm((p) => ({ ...p, fecha: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Estado</label>
              <select style={inputStyle} value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                <option value="DRAFT">Draft</option>
                <option value="CONFIRMED">Confirmado</option>
              </select>
            </div>
            <div className="col-span-2">
              <label style={labelStyle}>Comentarios</label>
              <textarea style={{ ...inputStyle, resize: "none", height: "64px" }}
                value={form.comentarios}
                onChange={(e) => setForm((p) => ({ ...p, comentarios: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <div className="w-full rounded-xl px-4 py-2 text-center"
                style={{ backgroundColor: "#2C2A48", border: "1px solid #56538E" }}>
                <p style={{ ...labelStyle, marginBottom: 2 }}>Total calculado</p>
                <p className="text-lg font-extrabold" style={{ color: "#8DB051" }}>{formatMoney(totalCalculado)}</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="px-6 pb-4">
            <div className="flex items-center justify-between mb-3">
              <p style={labelStyle}>Items</p>
              <button onClick={agregarItem}
                className="px-3 py-1 rounded-lg text-xs font-bold transition-opacity hover:opacity-80"
                style={{ backgroundColor: "rgba(86,83,142,0.4)", color: "#E7D6FF" }}>
                + Agregar item
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {form.items.map((item, i) => (
                <div key={i} className="rounded-xl px-4 py-3"
                  style={{ backgroundColor: "#2C2A48", border: "1px solid #56538E" }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "rgba(86,83,142,0.25)", color: "#56538E" }}>
                        <Package size={15} />
                      </div>
                      <span className="text-xs font-bold" style={{ color: "#A68DC8" }}>Item {i + 1}</span>
                    </div>
                    {form.items.length > 1 && (
                      <button onClick={() => eliminarItem(i)}
                        className="text-xs transition-opacity hover:opacity-70"
                        style={{ color: "#e05c5c" }}>
                        <i className="bi bi-trash" />
                      </button>
                    )}
                  </div>
                  <div className="mb-2">
                    <label style={labelStyle}>Producto</label>
                    <select style={inputStyle} value={item.productId}
                      onChange={(e) => handleProductChange(i, e.target.value)}>
                      <option value="">— Seleccionar producto —</option>
                      {products.map((p) => <option key={p.id} value={p.id}>{p.sku} — {p.nombre}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label style={labelStyle}>Cantidad</label>
                      <input style={inputStyle} type="number" min="1" value={item.cantidad}
                        onChange={(e) => handleItemChange(i, "cantidad", e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Costo unit.</label>
                      <input style={inputStyle} type="number" min="0" value={item.costoUnitario}
                        onChange={(e) => handleItemChange(i, "costoUnitario", e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Subtotal</label>
                      <input style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }}
                        value={formatMoney(item.subtotal)} readOnly />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="mx-6 mb-4 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: "rgba(224,92,92,0.15)", color: "#e05c5c", border: "1px solid rgba(224,92,92,0.3)" }}>
              {error}
            </div>
          )}

          {/* Footer */}
          <div className="px-6 py-4 flex justify-end gap-3"
            style={{ borderTop: "1px solid rgba(166,141,200,0.15)" }}>
            <button onClick={() => setConfirmarDescartar(true)} disabled={guardando}
              className="px-5 py-2 rounded-xl text-sm font-bold transition-opacity hover:opacity-70"
              style={{ backgroundColor: "rgba(166,141,200,0.15)", color: "#E7D6FF" }}>
              Cancelar
            </button>
            <button onClick={handleGuardar} disabled={guardando}
              className="px-5 py-2 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#E7D6FF", color: "#221E3A", opacity: guardando ? 0.7 : 1 }}>
              {guardando ? "Guardando..." : esNuevo ? "Crear recepción" : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>

      {confirmarDescartar && (
        <ModalConfirmacion
          tipo="confirmar"
          titulo="¿Seguro que quieres descartar los cambios?"
          mensaje="Los cambios no guardados se perderán."
          textoConfirmar="Descartar"
          textoCancelar="Seguir editando"
          onConfirmar={onClose}
          onCancelar={() => setConfirmarDescartar(false)}
        />
      )}
    </>
  );
}

/* ─── Modal detalle ─── */
function ModalDetalle({ row, onClose, onConfirmar, onEditar, onEliminar }) {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  const unidadesTotales = row.items.reduce((acc, i) => acc + i.cantidad, 0);
  const esDraft     = row.status === "DRAFT";
  const estadoLabel = row.status === "CONFIRMED" ? "Confirmado" : "Draft";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <div className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
        style={{ backgroundColor: "#221E3A", border: "1px solid #A68DC8", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}>

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
          {row.comentarios && (
            <p className="mt-2 text-sm" style={{ color: "#C9B8E8" }}>{row.comentarios}</p>
          )}
        </div>

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
          <AccionesTabla
            onEliminar={esDraft ? onEliminar : undefined}
            onEditar={esDraft ? onEditar : undefined}
          />
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
  const [rowEditando, setRowEditando]         = useState(null);
  const [rowEliminando, setRowEliminando]     = useState(null);
  const [mostrarNueva, setMostrarNueva]       = useState(false);
  const [loading, setLoading]                 = useState(true);
  const [refresh, setRefresh]                 = useState(0);
  const [modalExito, setModalExito]           = useState("");

  const refetch = useCallback(() => setRefresh((r) => r + 1), []);

  // Tabla
  useEffect(() => {
    const params = new URLSearchParams({ page: paginaActiva, limit: LIMIT });
    if (filtro)   params.set("status", filtro);
    if (busqueda) params.set("q", busqueda);

    api.get(`/recepciones?${params}`)
      .then((res) => { setRows(res.items); setTotalRegistros(res.total); setLoading(false); })
      .catch(() => setLoading(false));
  }, [paginaActiva, filtro, busqueda, refresh]);

  // Stats
  useEffect(() => {
    Promise.all([
      api.get("/recepciones?limit=1"),
      api.get("/recepciones?status=CONFIRMED&limit=1"),
      api.get("/recepciones?status=DRAFT&limit=1"),
    ]).then(([all, confirmed, draft]) => {
      setStats({ total: all.total, confirmadas: confirmed.total, draft: draft.total });
    }).catch(console.error);
  }, [refresh]);

  const totalPaginas = Math.ceil(totalRegistros / LIMIT);

  const handleCambiarPagina = (p) => {
    if (p === "‹") setPaginaActiva((prev) => Math.max(1, prev - 1));
    else if (p === "›") setPaginaActiva((prev) => Math.min(totalPaginas, prev + 1));
    else setPaginaActiva(Number(p));
  };

  const handleConfirmar = (id) => {
    api.patch(`/recepciones/${id}/confirm`)
      .then(() => {
        setRowSeleccionada(null);
        refetch();
        setModalExito("Recepción confirmada correctamente");
      })
      .catch(console.error);
  };

  const handleEliminar = (id) => {
    api.delete(`/recepciones/${id}`)
      .then(() => {
        refetch();
        setModalExito("Recepción eliminada correctamente");
      })
      .catch(console.error);
  };

  const plantillaNueva = {
    id: null, folio: "", supplierNombre: "", supplierId: "",
    fecha: new Date().toLocaleDateString("es-MX"),
    comentarios: "", status: "DRAFT", total: 0,
    createdAt: null, updatedAt: null,
    items: [{ productId: "", sku: "", productNombre: "", cantidad: 1, costoUnitario: 0, subtotal: 0 }],
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
          <Tarjetas label="Recepciones" value={stats.total}       sub="este mes"    accent="#7C6AF7" icon="bi bi-box-seam"      />
          <Tarjetas label="Confirmadas" value={stats.confirmadas} sub={`${stats.total ? Math.round(stats.confirmadas / stats.total * 100) : 0}% del total`} accent="#8DB051" icon="bi bi-check-circle" />
          <Tarjetas label="Draft"       value={stats.draft}       sub="en borrador" accent="#c9c225" icon="bi bi-pencil-square" />
          <Tarjetas label="Total"       value={stats.total}       sub="recepciones" accent="#A68DC8" icon="bi bi-layers"        />
        </div>

        <ToolBar
          filtro={filtro}
          setFiltro={(v) => { setFiltro(v); setPaginaActiva(1); }}
          opcionesFiltro={OPCIONES_FILTRO}
          busqueda={busqueda}
          setBusqueda={(v) => { setBusqueda(v); setPaginaActiva(1); }}
          placeholderBuscar="Buscar por folio, proveedor..."
          textoBoton="+ Recepción"
          accionBoton={() => setMostrarNueva(true)}
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
                  onEditar={row.status === "DRAFT" ? () => setRowEditando(row) : undefined}
                  onEliminar={row.status === "DRAFT" ? () => setRowEliminando(row) : undefined}
                />
              </td>
            </tr>
          ))}
        </Tabla>

        <Paginacion
          paginaActual={paginaActiva}
          totalRegistros={totalRegistros}
          rangoSiguiente={rango}
          limit={LIMIT}
          onExportar={() => {}}
          onCambiarPagina={handleCambiarPagina}
        />

      </div>

      {rowSeleccionada && (
        <ModalDetalle
          row={rowSeleccionada}
          onClose={() => setRowSeleccionada(null)}
          onConfirmar={handleConfirmar}
          onEditar={() => { setRowEditando(rowSeleccionada); setRowSeleccionada(null); }}
          onEliminar={() => { setRowEliminando(rowSeleccionada); setRowSeleccionada(null); }}
        />
      )}

      {rowEditando && (
        <ModalForm
          row={rowEditando}
          esNuevo={false}
          onClose={() => setRowEditando(null)}
          onGuardar={() => { refetch(); setModalExito("Recepción actualizada correctamente"); }}
        />
      )}

      {mostrarNueva && (
        <ModalForm
          row={plantillaNueva}
          esNuevo={true}
          onClose={() => setMostrarNueva(false)}
          onGuardar={() => { refetch(); setMostrarNueva(false); setModalExito("Recepción creada correctamente"); }}
        />
      )}

      {rowEliminando && (
        <ModalConfirmacion
          tipo="eliminar"
          titulo="¿Seguro que quieres eliminar esta recepción?"
          mensaje={`${rowEliminando.folio} — ${rowEliminando.supplierNombre}. Esta acción no se puede deshacer.`}
          textoConfirmar="Eliminar"
          onConfirmar={() => { handleEliminar(rowEliminando.id); setRowEliminando(null); }}
          onCancelar={() => setRowEliminando(null)}
        />
      )}

      {modalExito && (
        <ModalConfirmacion
          tipo="exito"
          titulo={modalExito}
          onCancelar={() => setModalExito("")}
        />
      )}
    </div>
  );
}
