import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { api } from "../services/api";
import { canPerformAction } from "../utils/permissionMapper";
import Toast from "../components/Toast";
import Tarjetas from "../components/Tarjetas";
import Etiquetas from "../components/Etiquetas";
import ToolBar from "../components/ToolBar";
import AccionesTabla from "../components/AccionesTabla";
import Paginacion from "../components/Paginacion";
import Tabla from "../components/Tabla";
import Modal from "../components/Modal";
import ModalConfirmacion from "../components/ModalConfirmacion";
import ModalRoles from "../components/ModalRoles";
import ModalPermisos from "../components/ModalPermisos";
import useTitulo from "../hooks/useTitulo";
import Encabezado from "../components/Encabezado";

const LIMIT = 10;

export default function Roles() {
  useTitulo("Roles");
  const { usuario: usuarioLogeado } = useContext(AuthContext);

  // Verificar que sea admin
  const esAdmin = usuarioLogeado?.roleId === "role_admin" || 
                  usuarioLogeado?.roleId === "ADMIN" ||
                  usuarioLogeado?.role === "role_admin" ||
                  usuarioLogeado?.role === "ADMIN" ||
                  canPerformAction(usuarioLogeado?.permissions, 'roles', 'read');

  const [filtro, setFiltro] = useState("");
  const [busqueda, setBusqueda] = useState("");

  // Estados para Roles
  const [rolesDB, setRolesDB] = useState([]);
  const [permisosDB, setPermisosDB] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("exito");

  // Paginación
  const [paginaActiva, setPaginaActiva] = useState(1);

  // Modales
  const [isModalVerAbierto, setIsModalVerAbierto] = useState(false);
  const [isModalFormAbierto, setIsModalFormAbierto] = useState(false);
  const [isModalPermisosAbierto, setIsModalPermisosAbierto] = useState(false);
  const [isModalNuevoPermisoAbierto, setIsModalNuevoPermisoAbierto] = useState(false);
  const [rolSeleccionado, setRolSeleccionado] = useState(null);
  const [rolAEditar, setRolAEditar] = useState(null);

  const [modalConf, setModalConf] = useState({
    isOpen: false,
    tipo: "eliminar",
    titulo: "",
    mensaje: "",
    textoConfirmar: "Eliminar",
    onConfirmar: () => {}
  });

  const encabezadosRoles = [
    { label: "Nombre", key: "nombre" },
    { label: "Descripción", key: "descripcion" },
    { label: "Permisos", key: "permisos" },
    { label: "Creado", key: "createdAt" },
    { label: "Acciones", key: "acciones" }
  ];

  // Traer roles y permisos
  const fetchRolesYPermisos = async (silencioso = false) => {
    try {
      if (!silencioso) setCargando(true);
      setError("");

      const [rolesRes, permisosRes] = await Promise.all([
        api.get('/roles'),
        api.get('/permissions')
      ]);

      const rolesData = rolesRes.items || rolesRes.data?.items || (Array.isArray(rolesRes) ? rolesRes : []);
      const permisosData = permisosRes.items || permisosRes.data?.items || (Array.isArray(permisosRes) ? permisosRes : []);

      setRolesDB(rolesData);
      setPermisosDB(permisosData);
    } catch (err) {
      console.error("Error al cargar roles y permisos:", err);
      setError(err.message || "Error al cargar roles y permisos");
      mostrarToast("Error al cargar datos", "error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    // Verificar que sea admin antes de cargar
    if (!esAdmin) {
      setError("No tienes permisos para acceder a esta página. Solo administradores pueden gestionar roles.");
      return;
    }
    fetchRolesYPermisos();
  }, [esAdmin]);

  useEffect(() => {
    setPaginaActiva(1);
  }, [filtro, busqueda]);

  // Filtrar roles
  const datosFiltrados = rolesDB
    .filter((row) => {
      if (filtro === "") return true;
      return true; // Agregar más lógica de filtro si es necesario
    })
    .filter((row) =>
      busqueda === "" ||
      (row.nombre && row.nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
      (row.descripcion && row.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
    );

  // Estadísticas
  const totalPermisos = permisosDB.length;
  const rolesConMasPermisos = rolesDB.length > 0
    ? rolesDB.reduce((max, rol) => (rol.permissions?.length > max.permissions?.length ? rol : max))
    : null;
  const promPermisosPorRol = rolesDB.length > 0
    ? Math.round(rolesDB.reduce((sum, rol) => sum + (rol.permissions?.length || 0), 0) / rolesDB.length)
    : 0;

  // Paginación
  const start = (paginaActiva - 1) * LIMIT;
  const datosPaginados = datosFiltrados.slice(start, start + LIMIT);

  const textoRango = datosFiltrados.length === 0
    ? "0"
    : `${start + 1} – ${Math.min(paginaActiva * LIMIT, datosFiltrados.length)}`;

  const mostrarToast = (mensaje, tipo = "exito") => {
    setToastMessage(mensaje);
    setToastType(tipo);
  };

  // Acciones
  const handleVerDetalles = (rol) => {
    setRolSeleccionado(rol);
    setIsModalVerAbierto(true);
  };

  const handleAbrirFormCrear = () => {
    setRolAEditar(null);
    setIsModalFormAbierto(true);
  };

  const handleAbrirFormEditar = (rol) => {
    setRolAEditar(rol);
    setIsModalFormAbierto(true);
  };

  const handleAbrirPermisos = (rol) => {
    setRolSeleccionado(rol);
    setIsModalPermisosAbierto(true);
  };

  const handleAbrirConfirmacionBorrar = (rol) => {
    setModalConf({
      isOpen: true,
      tipo: "eliminar",
      titulo: "Eliminar Rol",
      mensaje: `¿Estás seguro de que deseas eliminar el rol "${rol.nombre}"?`,
      textoConfirmar: "Eliminar",
      onConfirmar: () => handleEliminarRol(rol.id)
    });
  };

  const handleGuardarRol = async (formData) => {
    try {
      setGuardando(true);

      if (rolAEditar) {
        // Editar
        await api.patch(`/roles/${rolAEditar.id}`, formData);
        mostrarToast("Rol actualizado correctamente", "exito");
      } else {
        // Crear
        await api.post('/roles', formData);
        mostrarToast("Rol creado correctamente", "exito");
      }

      setIsModalFormAbierto(false);
      setRolAEditar(null);
      await fetchRolesYPermisos(true);
    } catch (err) {
      console.error("Error al guardar rol:", err);
      mostrarToast(err.message || "Error al guardar rol", "error");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarRol = async (rolId) => {
    try {
      setGuardando(true);
      await api.delete(`/roles/${rolId}`);
      mostrarToast("Rol eliminado correctamente", "exito");
      setModalConf({ ...modalConf, isOpen: false });
      await fetchRolesYPermisos(true);
    } catch (err) {
      console.error("Error al eliminar rol:", err);
      mostrarToast(err.message || "Error al eliminar rol", "error");
    } finally {
      setGuardando(false);
    }
  };

  const handleActualizarPermisos = async (permisosSeleccionados) => {
    try {
      setGuardando(true);
      await api.patch(`/roles/${rolSeleccionado.id}`, {
        permissions: permisosSeleccionados
      });
      mostrarToast("Permisos actualizados correctamente", "exito");
      setIsModalPermisosAbierto(false);
      await fetchRolesYPermisos(true);
    } catch (err) {
      console.error("Error al actualizar permisos:", err);
      mostrarToast(err.message || "Error al actualizar permisos", "error");
    } finally {
      setGuardando(false);
    }
  };

  const handleCrearPermiso = async (formData) => {
    try {
      setGuardando(true);
      await api.post('/permissions', formData);
      mostrarToast("Permiso creado correctamente", "exito");
      setIsModalNuevoPermisoAbierto(false);
      await fetchRolesYPermisos(true);
    } catch (err) {
      console.error("Error al crear permiso:", err);
      mostrarToast(err.message || "Error al crear permiso", "error");
    } finally {
      setGuardando(false);
    }
  };

  const handleCambiarPagina = (page) => {
    const totalPaginas = Math.ceil(datosFiltrados.length / LIMIT);
    if (page === "‹") setPaginaActiva((prev) => Math.max(1, prev - 1));
    else if (page === "›") setPaginaActiva((prev) => Math.min(totalPaginas, prev + 1));
    else setPaginaActiva(Number(page));
  };

  const renderRow = (row, i) => (
    <tr key={i} className="border-b hover:bg-lila/30 dark:hover:bg-oscuro/40 transition-colors">
      <td className="p-4 text-left text-sm font-medium">{row.nombre || "-"}</td>
      <td className="p-4 text-left text-sm">{row.descripcion || "-"}</td>
      <td className="p-4 text-center">
        <span className="px-3 py-1 bg-lila/20 text-lila-soft rounded-full text-sm font-medium">
          {row.permissions?.length || 0}
        </span>
      </td>
      <td className="p-4 text-center text-sm">
        {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-"}
      </td>
      <td className="p-4 align-middle whitespace-nowrap">
        <div className="flex items-center justify-center gap-1">
          <AccionesTabla
            onVer={() => handleVerDetalles(row)}
            onEditar={() => handleAbrirFormEditar(row)}
            onEliminar={() => handleAbrirConfirmacionBorrar(row)}
          />
          <button
            onClick={() => handleAbrirPermisos(row)}
            className="relative group bg-transparent border-none cursor-pointer text-md outline-none transition-all
              opacity-70 hover:opacity-100
              text-lila-mid hover:text-cian
              dark:text-lila-soft dark:hover:text-cian"
            title="Gestionar Permisos"
          >
            <i className="bi bi-shield-lock inline-block transition-transform group-hover:scale-125"></i>
            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-poppins px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl z-50 pointer-events-none
              bg-oscuro text-blanco
              dark:bg-oscuro dark:text-blanco">
              Gestionar Permisos
            </span>
          </button>
        </div>
      </td>
    </tr>
  );

  // Mostrar error si existe
  if (error && !cargando) {
    if (!esAdmin) {
      return (
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="bg-rojo/20 border border-rojo text-rojo p-4 rounded-lg text-center">
            <i className="bi bi-exclamation-triangle mr-2"></i>
            {error}
          </div>
        </div>
      );
    }
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="bg-rojo/20 border border-rojo text-rojo p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  // Mostrar skeleton mientras carga
  if (cargando) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold mb-6 text-blanco uppercase tracking-wide text-center sm:text-left">
          Gestión de Roles
        </h1>
        <div className="flex justify-center items-center py-20">
          <i className="bi bi-hourglass-split text-4xl text-lila animate-spin"></i>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage("")}
      />

      <Encabezado 
        titulo="Gestión de Roles" 
      />

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full mb-8">
        <Tarjetas
          label="Total de Roles"
          value={rolesDB.length}
          sub="Roles en el sistema"
          icon="bi bi-shield-check"
          onClick={() => setFiltro("")}
          isActive={filtro === ""}
        />
        <Tarjetas
          label="Total de Permisos"
          value={totalPermisos}
          sub="Permisos disponibles"
          accent="#A3E378"
          icon="bi bi-key"
          onClick={() => setFiltro("")}
          isActive={filtro === ""}
        />
        <Tarjetas
          label="Promedio de Permisos"
          value={promPermisosPorRol}
          sub="Por rol"
          accent="#FFB347"
          icon="bi bi-graph-up"
        />
      </div>

      {/* Buscador y Filtros */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-5 w-full">
        <ToolBar
          filtro={filtro}
          setFiltro={setFiltro}
          opcionesFiltro={[{ value: "", label: "Todos" }]}
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          placeholderBuscar="Buscar por nombre o descripción..."
          textoBoton="+ Rol"
          accionBoton={handleAbrirFormCrear}
        />
        <button
          onClick={() => setIsModalNuevoPermisoAbierto(true)}
          className="bg-verde text-oscuro border-none rounded-lg px-6 py-2.5 font-bold text-sm cursor-pointer hover:bg-verde/80 hover:scale-102 transition-all active:scale-95 w-full lg:w-auto"
        >
          + Permiso
        </button>
      </div>

      {/* Tabla */}
      <Tabla
        encabezados={encabezadosRoles}
        datos={datosPaginados}
        renderRow={renderRow}
        sortableFields={["nombre", "descripcion"]}
      />

      <Paginacion
        paginaActual={paginaActiva}
        totalRegistros={datosFiltrados.length}
        rangoSiguiente={textoRango}
        limit={LIMIT}
        onCambiarPagina={handleCambiarPagina}
        exportTitulo="Gestión de Roles"
        exportColumnas={["nombre", "descripcion", "permisos", "createdAt"]}
      />

      {/* Modales */}
      <ModalRoles
        isOpen={isModalFormAbierto}
        onClose={() => {
          setIsModalFormAbierto(false);
          setRolAEditar(null);
        }}
        rolData={rolAEditar}
        onGuardar={handleGuardarRol}
        guardando={guardando}
      />

      <ModalPermisos
        isOpen={isModalPermisosAbierto}
        onClose={() => {
          setIsModalPermisosAbierto(false);
          setRolSeleccionado(null);
        }}
        rol={rolSeleccionado}
        permisos={permisosDB}
        onActualizar={handleActualizarPermisos}
        guardando={guardando}
      />

      <Modal isOpen={isModalNuevoPermisoAbierto} onClose={() => setIsModalNuevoPermisoAbierto(false)}>
        <div className="p-6">
          <h2 className="text-xl font-bold text-blanco mb-4">Crear Nuevo Permiso</h2>
          <FormPermisoNuevo onGuardar={handleCrearPermiso} onCancelar={() => setIsModalNuevoPermisoAbierto(false)} />
        </div>
      </Modal>

      <Modal isOpen={isModalVerAbierto} onClose={() => setIsModalVerAbierto(false)}>
        <div className="p-6">
          <h2 className="text-xl font-bold text-blanco mb-4">{rolSeleccionado?.nombre}</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-lila-soft">Descripción</label>
              <p className="text-blanco">{rolSeleccionado?.descripcion || "-"}</p>
            </div>
            <div>
              <label className="text-sm text-lila-soft">Permisos ({rolSeleccionado?.permissions?.length || 0})</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {rolSeleccionado?.permissions?.map((perm, i) => (
                  <Etiquetas key={i} contenido={perm} />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <label className="text-lila-soft">Creado</label>
                <p className="text-blanco">{rolSeleccionado?.createdAt ? new Date(rolSeleccionado.createdAt).toLocaleDateString() : "-"}</p>
              </div>
              <div>
                <label className="text-lila-soft">Actualizado</label>
                <p className="text-blanco">{rolSeleccionado?.updatedAt ? new Date(rolSeleccionado.updatedAt).toLocaleDateString() : "-"}</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <ModalConfirmacion
        isOpen={modalConf.isOpen}
        titulo={modalConf.titulo}
        mensaje={modalConf.mensaje}
        textoConfirmar={modalConf.textoConfirmar}
        onConfirmar={modalConf.onConfirmar}
        onCancelar={() => setModalConf((prev) => ({ ...prev, isOpen: false }))}
        cargando={guardando}
      />
    </div>
  );
}

// Componente para formulario de nuevo permiso
function FormPermisoNuevo({ onGuardar, onCancelar }) {
  const [formData, setFormData] = useState({
    code: "",
    nombre: "",
    descripcion: "",
    modulo: ""
  });

  const [errores, setErrores] = useState({});

  const modulos = ["audit", "auth", "clients", "dashboard", "inventory", "permissions", "products", "recepciones", "roles", "suppliers", "tienda", "users", "ventas"];

  const validar = () => {
    const nuevosErrores = {};
    if (!formData.code) nuevosErrores.code = "El código es requerido";
    if (!formData.nombre) nuevosErrores.nombre = "El nombre es requerido";
    if (!formData.modulo) nuevosErrores.modulo = "El módulo es requerido";
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validar()) {
      onGuardar(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-lila-soft mb-2">Código</label>
        <input
          type="text"
          placeholder="ej: roles:create"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          className="w-full px-3 py-2 bg-oscuro border border-lila/30 rounded-lg text-blanco placeholder-gris focus:outline-none focus:border-lila"
        />
        {errores.code && <p className="text-rojo text-sm mt-1">{errores.code}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-lila-soft mb-2">Nombre</label>
        <input
          type="text"
          placeholder="ej: Crear Rol"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          className="w-full px-3 py-2 bg-oscuro border border-lila/30 rounded-lg text-blanco placeholder-gris focus:outline-none focus:border-lila"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-lila-soft mb-2">Módulo</label>
        <select
          value={formData.modulo}
          onChange={(e) => setFormData({ ...formData, modulo: e.target.value })}
          className="w-full px-3 py-2 bg-oscuro border border-lila/30 rounded-lg text-blanco focus:outline-none focus:border-lila"
        >
          <option value="">Selecciona un módulo</option>
          {modulos.map((mod) => (
            <option key={mod} value={mod}>{mod}</option>
          ))}
        </select>
        {errores.modulo && <p className="text-rojo text-sm mt-1">{errores.modulo}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-lila-soft mb-2">Descripción</label>
        <textarea
          placeholder="Describe qué permite este permiso..."
          value={formData.descripcion}
          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          className="w-full px-3 py-2 bg-oscuro border border-lila/30 rounded-lg text-blanco placeholder-gris focus:outline-none focus:border-lila resize-none"
          rows="3"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-lila text-blanco rounded-lg hover:bg-lila/80 font-medium transition-colors"
        >
          Crear Permiso
        </button>
        <button
          type="button"
          onClick={onCancelar}
          className="flex-1 px-4 py-2 bg-oscuro border border-lila/30 text-blanco rounded-lg hover:bg-oscuro/80 font-medium transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
