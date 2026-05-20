import { useState, useEffect, useContext, use } from "react";
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
import ModalUsuarios from "../components/ModalUsuarios";
import ModalConfirmacion from "../components/ModalConfirmacion";
import FormUsuarios from "../components/FormUsuarios";
import AvatarUser from "../components/AvatarUser";
import useTitulo from "../hooks/useTitulo";

/* ─── Página principal ─── */
const LIMIT = 10;

export default function Usuarios() {
  useTitulo("Usuarios");
  const { usuario: usuarioLogeado } = useContext(AuthContext);
  
  const [filtro, setFiltro] = useState("");
  const [busqueda, setBusqueda] = useState("");
  
  // Estados para la Base de Datos
  const [usuariosDB, setUsuariosDB] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("exito");
  
  // Estados para la paginación
  const [paginaActiva, setPaginaActiva] = useState(1);

  // Estados para Modales
  const [isModalVerAbierto, setIsModalVerAbierto] = useState(false);
  const [isModalFormAbierto, setIsModalFormAbierto] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [usuarioAEditar, setUsuarioAEditar] = useState(null);

  const [modalConf, setModalConf] = useState({
    isOpen: false,
    tipo: "eliminar",
    titulo: "",
    mensaje: "",
    textoConfirmar: "Eliminar",
    onConfirmar: () => {}
  });

  const opcionesFiltroUsuarios = [
    { value: "", label: "Todos" },
    { value: true, label: "Activos" },
    { value: false, label: "Inactivos" }
  ];

  const encabezadosUsuarios = [
    { label: "", key: "avatar" },
    { label: "Usuario", key: "usuario" },
    { label: "Nombre", key: "nombre" },
    { label: "Email", key: "email" },
    { label: "Rol", key: "rol" },
    { label: "Estado", key: "estado" },
    { label: "Acciones", key: "acciones" }
  ];

  // Traer usuarios de Firestore
  const fetchUsuarios = async (silencioso = false) => {
    try {
      if (!silencioso) setCargando(true);
      setError("");
      
      const result = await api.get('/users');
      const datosReales = result.items || result.data?.items || (Array.isArray(result) ? result : []);
      setUsuariosDB(datosReales);
    } catch (err) {
      console.error("Error al cargar los usuarios:", err);
      setError(err.message || "Error al cargar los usuarios");
      mostrarToast("Error al cargar usuarios", "error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  useEffect(() => {
    setPaginaActiva(1);
  }, [filtro, busqueda]);

  const datosFiltrados = usuariosDB
    .filter((row) => {
      // Excluir usuarios con rol CLIENTE
      if (row.roleId === 'CLIENTE' || row.role === 'CLIENTE') {
        return false;
      }
      if (filtro === "") return true;
      return row.activo === filtro;
    })
    .filter((row) => 
      busqueda === "" || 
      (row.nombre && row.nombre.toLowerCase().includes(busqueda.toLowerCase())) || 
      (row.usuario && row.usuario.toLowerCase().includes(busqueda.toLowerCase())) ||
      (row.email && row.email.toLowerCase().includes(busqueda.toLowerCase()))
    );

  // Filtrar usuarios que no sean CLIENTE para estadísticas
  const usuariosSinClientes = usuariosDB.filter(u => u.roleId !== 'CLIENTE' && u.role !== 'CLIENTE');
  const activos = usuariosSinClientes.filter((u) => u.activo !== false).length;
  const inactivos = usuariosSinClientes.filter((u) => u.activo === false).length;

  // Cálculos matemáticos para la paginación
  const start = (paginaActiva - 1) * LIMIT;
  const datosPaginados = datosFiltrados.slice(start, start + LIMIT);

  const textoRango = datosFiltrados.length === 0 
    ? "0" 
    : `${start + 1} – ${Math.min(paginaActiva * LIMIT, datosFiltrados.length)}`;

  const mostrarToast = (mensaje, tipo = "exito") => {
    setToastMessage(mensaje);
    setToastType(tipo);
  };

  // Permisos basados en permiso dinámico o rol
  const puedeAgregar = canPerformAction(usuarioLogeado?.permissions, 'users', 'create') 
    || usuarioLogeado?.roleId === "role_admin" 
    || usuarioLogeado?.roleId === "GERENTE";
    
  const puedeEditar = canPerformAction(usuarioLogeado?.permissions, 'users', 'update')
    || usuarioLogeado?.roleId === "role_admin" 
    || usuarioLogeado?.roleId === "GERENTE";
    
  const puedeBorrar = canPerformAction(usuarioLogeado?.permissions, 'users', 'delete')
    || usuarioLogeado?.roleId === "role_admin";

  // Acciones de Modal
  const handleVerDetalles = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setIsModalVerAbierto(true);
  };

  const handleAbrirFormCrear = () => {
    setUsuarioAEditar(null);
    setIsModalFormAbierto(true);
  };

  const handleAbrirFormEditar = (usuario) => {
    if (!puedeEditar) {
      mostrarToast("No tienes permisos para editar usuarios", "error");
      return;
    }
    setUsuarioAEditar(usuario);
    setIsModalFormAbierto(true);
  };

  const handleAbrirConfirmacionBorrar = (usuario) => {
    if (!puedeBorrar) {
      mostrarToast("No tienes permisos para eliminar usuarios", "error");
      return;
    }
    if (usuario.id === usuarioLogeado?.id) {
      mostrarToast("No puedes eliminar tu propio usuario", "error");
      return;
    }
    
    setModalConf({
      isOpen: true,
      tipo: "eliminar",
      titulo: "Eliminar Usuario",
      mensaje: `¿Estás seguro de que deseas eliminar a ${usuario.nombre} ${usuario.apellido}?`,
      textoConfirmar: "Eliminar",
      onConfirmar: () => handleEliminarUsuario(usuario.id)
    });
  };

  const handleGuardarUsuario = async (formData) => {
    try {
      setGuardando(true);
      
      if (usuarioAEditar) {
        // Editar
        await api.patch(`/users/${usuarioAEditar.id}`, formData);
        mostrarToast("Usuario actualizado correctamente", "exito");
      } else {
        // Crear
        await api.post('/users', formData);
        mostrarToast("Usuario creado correctamente", "exito");
      }
      
      setIsModalFormAbierto(false);
      setUsuarioAEditar(null);
      await fetchUsuarios(true);
    } catch (err) {
      console.error("Error al guardar usuario:", err);
      mostrarToast(err.message || "Error al guardar usuario", "error");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarUsuario = async (usuarioId) => {
    try {
      setGuardando(true);
      await api.delete(`/users/${usuarioId}`);
      mostrarToast("Usuario eliminado correctamente", "exito");
      setModalConf({ ...modalConf, isOpen: false });
      await fetchUsuarios(true);
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      mostrarToast(err.message || "Error al eliminar usuario", "error");
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
    <tr key={i} className="border-b border-lila/5 hover:bg-oscuro/40 transition-colors text-white">
      <td className="p-4 text-center">
        <AvatarUser nombre={row.nombre} apellido={row.apellido} userId={row.id} />
      </td>
      <td className="p-4 text-center text-sm whitespace-nowrap font-medium">{row.usuario || "-"}</td>
      <td className="p-4 text-center text-sm whitespace-nowrap">
        {row.nombre} {row.apellido ? row.apellido : ""}
      </td>
      <td className="p-4 text-center text-sm whitespace-nowrap">{row.email || "-"}</td>
      <td className="p-4 text-center whitespace-nowrap">
        <Etiquetas contenido={row.role || row.roleId || "Sin rol"} />
      </td>
      <td className="p-4 text-center whitespace-nowrap">
        <Etiquetas contenido={row.activo !== false ? "Activo" : "Inactivo"} />
      </td>
      <td className="p-4 align-middle whitespace-nowrap">
        <AccionesTabla 
          onVer={() => handleVerDetalles(row)}
          onEditar={puedeEditar ? () => handleAbrirFormEditar(row) : null}
          onEliminar={puedeBorrar && row.id !== usuarioLogeado?.id ? () => handleAbrirConfirmacionBorrar(row) : null}
        />
      </td>
    </tr>
  );

  // Mostrar error si existe
  if (error && !cargando) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="bg-rojo/20 border border-rojo text-rojo p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  // Mostrar skeleton o loader mientras carga
  if (cargando) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold mb-6 text-blanco uppercase tracking-wide text-center sm:text-left">
          Gestión de Usuarios
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

      <h1 className="text-2xl font-bold mb-6 text-blanco uppercase tracking-wide text-center sm:text-left">
        Gestión de Usuarios
      </h1>

      {/* Tarjetas de estadísticas */}
      <div className="flex flex-col sm:flex-row gap-6 w-full mb-8">
        <Tarjetas 
          label="Total de usuarios" 
          value={usuariosDB.length} 
          sub="Todos los usuarios" 
          icon="bi bi-people"
        />
        <Tarjetas 
          label="Usuarios Activos" 
          value={activos} 
          sub={`${usuariosDB.length ? Math.round(activos / usuariosDB.length * 100) : 0}% del total`} 
          accent="#A3E378" 
          icon="bi bi-check-circle" 
        />
        <Tarjetas 
          label="Usuarios Inactivos" 
          value={inactivos} 
          sub={`${usuariosDB.length ? Math.round(inactivos / usuariosDB.length * 100) : 0}% del total`} 
          accent="#FF6B6B" 
          icon="bi bi-x-circle" 
        />
      </div>

      {/* Buscador y Filtros */}
      <ToolBar 
        filtro={filtro}
        setFiltro={setFiltro}
        opcionesFiltro={opcionesFiltroUsuarios}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        placeholderBuscar="Buscar por usuario, nombre o email..."
        textoBoton={puedeAgregar ? "+ Usuario" : null}
        accionBoton={puedeAgregar ? handleAbrirFormCrear : null}
      />

      {/* Tabla */}
      <Tabla 
        encabezados={encabezadosUsuarios}
        datos={datosPaginados}
        renderRow={renderRow}
        sortableFields={["usuario", "nombre", "email", "rol"]}
      />

      <Paginacion
        paginaActual={paginaActiva}
        totalRegistros={datosFiltrados.length}
        rangoSiguiente={textoRango}
        limit={LIMIT}
        onCambiarPagina={handleCambiarPagina}
        exportTitulo="Gestión de Usuarios"
        exportColumnas={[
          { header: "Usuario",  key: "usuario",  width: 15 },
          { header: "Nombre",   key: "nombre",   width: 20 },
          { header: "Email",    key: "email",    width: 25 },
          { header: "Rol",      key: "rol",      width: 15 },
          { header: "Estado",   key: "estado",   width: 12 },
        ]}
        exportFilas={datosFiltrados.map((u) => ({
          usuario: u.usuario || "-",
          nombre: `${u.nombre || ""} ${u.apellido || ""}`.trim(),
          email: u.email || "-",
          rol: u.role || u.roleId || "Sin rol",
          estado: u.activo !== false ? "Activo" : "Inactivo",
        }))}
      />

      {/* Modal Ver Detalles */}
      <Modal 
        isOpen={isModalVerAbierto} 
        onClose={() => setIsModalVerAbierto(false)}
        ancho="max-w-2xl"
      >
        {usuarioSeleccionado && (
          <ModalUsuarios 
            data={usuarioSeleccionado}
            usuarioLogeado={usuarioLogeado}
          />
        )}
      </Modal>

      {/* Modal Crear/Editar */}
      <Modal 
        isOpen={isModalFormAbierto} 
        onClose={() => setIsModalFormAbierto(false)}
        ancho="max-w-2xl"
      >
        <FormUsuarios 
          data={usuarioAEditar}
          onGuardar={handleGuardarUsuario}
          onCancelar={() => setIsModalFormAbierto(false)}
          usuarioLogeado={usuarioLogeado}
          esNuevo={!usuarioAEditar}
        />
      </Modal>

      {/* Modal Confirmación Eliminar */}
      {modalConf.isOpen && (
        <ModalConfirmacion
          tipo="eliminar"
          titulo={modalConf.titulo}
          mensaje={modalConf.mensaje}
          textoConfirmar={modalConf.textoConfirmar}
          onConfirmar={modalConf.onConfirmar}
          onCancelar={() => setModalConf({ ...modalConf, isOpen: false })}
        />
      )}
    </div>
  );
}
