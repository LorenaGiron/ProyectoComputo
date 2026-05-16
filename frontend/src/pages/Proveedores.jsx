import { useEffect, useState, useCallback } from "react";
import Etiquetas from "../components/Etiquetas";
import Tarjetas from "../components/Tarjetas";
import Tabla from "../components/Tabla";
import ToolBar from "../components/ToolBar";
import AccionesTabla from "../components/AccionesTabla";
import Paginacion from "../components/Paginacion";
import Modal from "../components/Modal";
import Boton from "../components/Boton";
import ModalConfirmacion from "../components/ModalConfirmacion";
import {
  fetchSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../services/suppliers.service";

const LIMIT = 10;

const encabezadosProveedores = [
  "Nombre", "RFC", "Giro", "Teléfono", "Estado", "Acciones",
];

const opcionesFiltroProv = [
  { value: "", label: "Todos" },
  { value: "Activo", label: "Activos" },
  { value: "Inactivo", label: "Inactivos" },
];

function getInitials(nombre) {
  if (!nombre) return "Pv";
  const words = nombre.trim().split(" ");
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

const FORM_VACIO = {
  id: null, nombre: "", rfc: "", giro: "", email: "",
  telefono: "", contacto: "", direccion: "", notas: "",
  estado: "Activo", creado: "", editado: "",
};

export default function Proveedores() {
  // ─── Datos ────────────────────────────────────────────────────────────
  const [usuarios, setUsuarios] = useState([]);
  const [stats, setStats] = useState({ total: 0, activos: 0, inactivos: 0 });
  const [totalRegistros, setTotalRegistros] = useState(0);

  // ─── Filtros y paginación ─────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [paginaActiva, setPaginaActiva] = useState(1);

  // ─── Carga y errores ──────────────────────────────────────────────────
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // ─── Modales ──────────────────────────────────────────────────────────
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetalleModalOpen, setIsDetalleModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [proveedorDetalle, setProveedorDetalle] = useState(null);
  const [formData, setFormData] = useState(FORM_VACIO);
  const [formDataOriginal, setFormDataOriginal] = useState(FORM_VACIO);

  // ─── Confirmación ─────────────────────────────────────────────────────
  const [confirmacion, setConfirmacion] = useState({
    abierto: false, tipo: "confirmar", titulo: "",
    mensaje: "", textoConfirmar: "", textoCancelar: "Cancelar", onConfirmar: null,
  });
  const cerrarConfirmacion = () =>
    setConfirmacion((prev) => ({ ...prev, abierto: false, onConfirmar: null }));

  // ─── Cargar desde la API ──────────────────────────────────────────────
  const cargarProveedores = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      let activoParam;
      if (statusFilter === "Activo") activoParam = true;
      else if (statusFilter === "Inactivo") activoParam = false;

      const [paginada, todos] = await Promise.all([
        fetchSuppliers({ q: search, activo: activoParam, page: paginaActiva, limit: LIMIT }),
        fetchSuppliers({ limit: 100 }),
      ]);

      setUsuarios(paginada.items);
      setTotalRegistros(paginada.total);

      const activos = todos.items.filter((u) => u.estado === "Activo").length;
      const inactivos = todos.items.filter((u) => u.estado === "Inactivo").length;
      setStats({ total: todos.total, activos, inactivos });

    } catch (err) {
      setError(err.message || "Error al cargar proveedores");
    } finally {
      setCargando(false);
    }
  }, [search, statusFilter, paginaActiva]);

  useEffect(() => { cargarProveedores(); }, [cargarProveedores]);
  useEffect(() => { setPaginaActiva(1); }, [statusFilter, search]);

  // ─── Paginación ───────────────────────────────────────────────────────
  const handleCambiarPagina = (page) => {
    if (page === "‹") setPaginaActiva((c) => Math.max(1, c - 1));
    else if (page === "›") {
      const max = Math.max(1, Math.ceil(totalRegistros / LIMIT));
      setPaginaActiva((c) => Math.min(max, c + 1));
    } else setPaginaActiva(Number(page));
  };

  // ─── Formulario ───────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const hayCambios = () => JSON.stringify(formData) !== JSON.stringify(formDataOriginal);

  const handleCerrarFormModal = () => {
    if (hayCambios()) {
      setConfirmacion({
        abierto: true,
        tipo: "confirmar",
        titulo: "¿Descartar cambios?",
        mensaje: "Tienes cambios sin guardar. ¿Seguro que quieres salir?",
        textoConfirmar: "Salir sin guardar",
        textoCancelar: "Seguir editando",
        onConfirmar: () => {
          cerrarConfirmacion();
          setIsFormModalOpen(false);
          setFormData(FORM_VACIO);
        },
      });
    } else {
      setIsFormModalOpen(false);
    }
  };

  const handleNuevoProveedor = () => {
    setModoEdicion(false);
    setFormData(FORM_VACIO);
    setFormDataOriginal(FORM_VACIO);
    setIsFormModalOpen(true);
  };

  const handleVerProveedor = (usuario) => {
    setProveedorDetalle(usuario);
    setIsDetalleModalOpen(true);
  };

  const handleEditarProveedor = (usuario) => {
    setIsDetalleModalOpen(false);
    setModoEdicion(true);
    setFormData(usuario);
    setFormDataOriginal(usuario);
    setIsFormModalOpen(true);
  };

  // ─── Guardar ──────────────────────────────────────────────────────────
const handleGuardarProveedor = async () => {
  try {
    if (modoEdicion) {
      await updateSupplier(formData.id, formData);
    } else {
      await createSupplier(formData);
    }

    setIsFormModalOpen(false);
    await cargarProveedores();

    setTimeout(() => {
      setConfirmacion({
        abierto: true,
        tipo: "exito",
        titulo: modoEdicion ? "Cambios guardados correctamente" : "Proveedor creado correctamente",
        mensaje: "",
        textoConfirmar: "",
        textoCancelar: "Cancelar",
        onConfirmar: null,
      });
      setTimeout(cerrarConfirmacion, 1800);
    }, 100);

  } catch (err) {
    setError(err.message || "Error al guardar el proveedor");
  }
};

  // ─── Eliminar ─────────────────────────────────────────────────────────
  const handleEliminarProveedor = (id) => {
    setConfirmacion({
      abierto: true,
      tipo: "eliminar",
      titulo: "Eliminar proveedor",
      mensaje: "Esta acción no se puede deshacer. ¿Confirmas que deseas eliminar este proveedor?",
      textoConfirmar: "Eliminar",
      textoCancelar: "Cancelar",
      onConfirmar: async () => {
        try {
          await deleteSupplier(id);
          cerrarConfirmacion();
          setIsDetalleModalOpen(false);
          await cargarProveedores();
        } catch (err) {
          cerrarConfirmacion();
          setError(err.message || "Error al eliminar el proveedor");
        }
      },
    });
  };

  // ─── Estilos ──────────────────────────────────────────────────────────
  const inputCls = "bg-oscuro border border-lila/20 rounded-lg p-3 outline-none text-white placeholder-white/30 focus:border-lila/50 transition-colors w-full";
  const labelCls = "block text-white/50 text-xs mb-1 uppercase tracking-wider";

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6 text-blanco uppercase tracking-wide text-center sm:text-left">
        Proveedores
      </h1>

      {/* Error global */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-4 opacity-60 hover:opacity-100 transition-opacity">
            <i className="bi bi-x-lg" />
          </button>
        </div>
      )}

      {/* TARJETAS */}
      <div className="flex flex-col sm:flex-row gap-6 w-full mb-8">
        <Tarjetas label="Total de proveedores" value={stats.total} sub="Todos los proveedores" icon="bi bi-building" />
        <Tarjetas
          label="Proveedores activos" value={stats.activos}
          sub={stats.total ? `${Math.round((stats.activos / stats.total) * 100)}% del total` : "0%"}
          accent="#22C55E" icon="bi bi-check-circle"
        />
        <Tarjetas
          label="Proveedores inactivos" value={stats.inactivos}
          sub={stats.total ? `${Math.round((stats.inactivos / stats.total) * 100)}% del total` : "0%"}
          accent="#EF4444" icon="bi bi-x-circle"
        />
      </div>

      {/* TOOLBAR */}
      <ToolBar
        filtro={statusFilter} setFiltro={setStatusFilter}
        opcionesFiltro={opcionesFiltroProv}
        busqueda={search} setBusqueda={setSearch}
        placeholderBuscar="Buscar por nombre, RFC, giro o teléfono..."
        textoBoton="+ Proveedor" accionBoton={handleNuevoProveedor}
      />

      {/* TABLA */}
      <Tabla encabezados={encabezadosProveedores}>
        {cargando ? (
          <tr>
            <td colSpan={6} className="text-center py-10 text-sm opacity-50 text-lila">
              <i className="bi bi-arrow-repeat animate-spin mr-2" />Cargando...
            </td>
          </tr>
        ) : usuarios.length === 0 ? (
          <tr>
            <td colSpan={6} className="text-center py-10 text-sm opacity-50 text-lila">
              No hay resultados
            </td>
          </tr>
        ) : (
          usuarios.map((usuario) => (
            <tr key={usuario.id} className="border-b border-lila/5 hover:bg-oscuro/40 transition-colors text-white">
              <td className="p-4 text-center text-sm whitespace-nowrap font-medium">{usuario.nombre}</td>
              <td className="p-4 text-center text-sm whitespace-nowrap">{usuario.rfc}</td>
              <td className="p-4 text-center text-sm whitespace-nowrap">{usuario.giro}</td>
              <td className="p-4 text-center text-sm whitespace-nowrap">{usuario.telefono}</td>
              <td className="p-4 text-center whitespace-nowrap"><Etiquetas contenido={usuario.estado} /></td>
              <td className="p-4 align-middle whitespace-nowrap">
                <AccionesTabla
                  onVer={() => handleVerProveedor(usuario)}
                  onEditar={() => handleEditarProveedor(usuario)}
                  onEliminar={() => handleEliminarProveedor(usuario.id)}
                />
              </td>
            </tr>
          ))
        )}
      </Tabla>

      {/* PAGINACIÓN */}
      <Paginacion
        paginaActual={paginaActiva}
        totalRegistros={totalRegistros}
        rangoSiguiente={`${totalRegistros === 0 ? 0 : (paginaActiva - 1) * LIMIT + 1} – ${Math.min(paginaActiva * LIMIT, totalRegistros)}`}
        onExportar={() => console.log("Exportando proveedores...")}
        onCambiarPagina={handleCambiarPagina}
      />

      {/* ── MODAL NUEVO / EDITAR ────────────────────────────────────────── */}
      <Modal
        isOpen={isFormModalOpen && !confirmacion.abierto}
        onClose={handleCerrarFormModal}
        ancho="max-w-2xl"
      >
        <div className="p-6 text-white">
          <h2 className="text-2xl font-bold mb-6">
            {modoEdicion ? "Editar Proveedor" : "Nuevo proveedor"}
          </h2>

          <div className="mb-4">
            <label className={labelCls}>Nombre</label>
            <input type="text" name="nombre" placeholder="Nombre del proveedor" value={formData.nombre} onChange={handleChange} className={inputCls} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelCls}>RFC</label>
              <input type="text" name="rfc" placeholder="RFC" value={formData.rfc} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" name="email" placeholder="correo@ejemplo.com" value={formData.email} onChange={handleChange} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelCls}>Teléfono</label>
              <input type="text" name="telefono" placeholder="55 0000 0000" value={formData.telefono} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Contacto</label>
              <input type="text" name="contacto" placeholder="Nombre del contacto" value={formData.contacto} onChange={handleChange} className={inputCls} />
            </div>
          </div>

          <div className="mb-4">
            <label className={labelCls}>Dirección</label>
            <input type="text" name="direccion" placeholder="Calle, número, colonia..." value={formData.direccion} onChange={handleChange} className={inputCls} />
          </div>

          <div className="mb-4">
            <label className={labelCls}>Notas</label>
            <textarea name="notas" placeholder="Observaciones o notas adicionales..." value={formData.notas} onChange={handleChange} rows={3} className={`${inputCls} resize-none`} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className={labelCls}>Giro</label>
              <input type="text" name="giro" placeholder="Giro comercial" value={formData.giro} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Estado</label>
              <select name="estado" value={formData.estado} onChange={handleChange} className={inputCls}>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Boton variante="oscuro" onClick={handleCerrarFormModal}>Cancelar</Boton>
            <Boton variante="claro" onClick={handleGuardarProveedor}>
              {modoEdicion ? "Guardar Cambios" : "Guardar"}
            </Boton>
          </div>
        </div>
      </Modal>

      {/* ── MODAL VER DETALLES ──────────────────────────────────────────── */}
      <Modal isOpen={isDetalleModalOpen} onClose={() => setIsDetalleModalOpen(false)} ancho="max-w-sm">
        {proveedorDetalle && (
          <div className="p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-lila/40 flex items-center justify-center text-sm font-bold text-lila shrink-0">
                {getInitials(proveedorDetalle.nombre)}
              </div>
              <h2 className="text-lg font-bold leading-tight">{proveedorDetalle.nombre}</h2>
            </div>

            <div className="flex gap-2 mb-5">
              <span className="px-3 py-1 rounded-full border border-lila/40 text-xs text-lila/80">{proveedorDetalle.rfc}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${proveedorDetalle.estado === "Activo" ? "bg-green-600/80 text-white" : "bg-red-600/80 text-white"}`}>
                {proveedorDetalle.estado}
              </span>
            </div>

            <div className="grid grid-cols-3 divide-x divide-lila/10 border border-lila/10 rounded-lg mb-5 text-center">
              <div className="p-3">
                <p className="text-xs text-white/40 uppercase tracking-wide mb-1">RFC</p>
                <p className="text-xs font-bold text-white/90 break-all">{proveedorDetalle.rfc}</p>
              </div>
              <div className="p-3">
                <p className="text-xs text-white/40 uppercase tracking-wide mb-1">Estado</p>
                <p className="text-xs font-bold text-white/90">{proveedorDetalle.estado}</p>
              </div>
              <div className="p-3">
                <p className="text-xs text-white/40 uppercase tracking-wide mb-1">Creado</p>
                <p className="text-xs font-bold text-white/90">{proveedorDetalle.creado || "—"}</p>
              </div>
            </div>

            <p className="text-sm font-semibold text-white/70 mb-3">Contacto</p>
            <div className="space-y-2 mb-5">
              <DetalleRow label="Email" value={proveedorDetalle.email} />
              <DetalleRow label="Teléfono" value={proveedorDetalle.telefono} />
              <DetalleRow label="Contacto" value={proveedorDetalle.contacto} />
              <DetalleRow label="Dirección" value={proveedorDetalle.direccion} />
            </div>

            {proveedorDetalle.notas && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-white/70 mb-1">Notas</p>
                <p className="text-sm text-lila/80">{proveedorDetalle.notas}</p>
              </div>
            )}

            <div className="mb-4">
              <p className="text-sm font-semibold text-white/70 mb-1">Giro</p>
              <p className="text-sm text-lila/80">{proveedorDetalle.giro || "—"}</p>
            </div>

            {proveedorDetalle.editado && (
              <DetalleRow label="Editado" value={proveedorDetalle.editado} />
            )}

            <div className="flex gap-3 mt-6">
              <Boton variante="secundario" className="flex-1" onClick={() => handleEditarProveedor(proveedorDetalle)}>
                Editar
              </Boton>
              <Boton
                variante="oscuro"
                className="flex-1 border-error-text/60 text-error-text hover:bg-error-text/10 hover:text-error-text"
                onClick={() => handleEliminarProveedor(proveedorDetalle.id)}
              >
                Eliminar
              </Boton>
            </div>
          </div>
        )}
      </Modal>

      {/* ── MODAL CONFIRMACIÓN ───────────────────────────────────────────── */}
      {confirmacion.abierto && (
        <ModalConfirmacion
          tipo={confirmacion.tipo}
          titulo={confirmacion.titulo}
          mensaje={confirmacion.mensaje}
          textoConfirmar={confirmacion.textoConfirmar}
          textoCancelar={confirmacion.textoCancelar}
          onConfirmar={confirmacion.onConfirmar}
          onCancelar={cerrarConfirmacion}
        />
      )}
    </div>
  );
}

function DetalleRow({ label, value }) {
  return (
    <div className="flex justify-between items-center gap-2">
      <span className="text-sm text-lila/60 shrink-0">{label}</span>
      <span className="text-sm text-white/80 text-right truncate">{value || "—"}</span>
    </div>
  );
}