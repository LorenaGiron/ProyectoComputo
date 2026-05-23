import { useEffect, useState } from "react";
import Etiquetas from "../components/Etiquetas";
import Tarjetas from "../components/Tarjetas";
import Tabla from "../components/Tabla";
import ToolBar from "../components/ToolBar";
import AccionesTabla from "../components/AccionesTabla";
import Paginacion from "../components/Paginacion";
import ModalConfirmacion from "../components/ModalConfirmacion";
import Input from "../components/Input";
import Boton from "../components/Boton";
import { api } from "../services/api";
import useTitulo from "../hooks/useTitulo";

const API_BASE = import.meta.env.VITE_API_URL ?? "";
const LIMIT = 10;

const CLIENTES_MOCK = [
  { nombre: "Ana Morales",     rfc: "RFCA1234567B8C", email: "ana.morales@email.com",     telefono: "554 123 789", estado: "Activo"   },
  { nombre: "Jorge Herrera",   rfc: "RFCJ2345678D9E", email: "jorge.herrerra@email.com",  telefono: "551 987 321", estado: "Inactivo" },
  { nombre: "Carla Sánchez",   rfc: "RFCC3456789F0G", email: "carla.sanchez@email.com",   telefono: "556 321 654", estado: "Activo"   },
  { nombre: "María López",     rfc: "RFCM4567890H1I", email: "maria.lopez@email.com",     telefono: "557 654 123", estado: "Activo"   },
  { nombre: "Luis Martínez",   rfc: "RFCL5678901J2K", email: "luis.martinez@email.com",   telefono: "553 111 222", estado: "Activo"   },
  { nombre: "Sofía Torres",    rfc: "RFCS6789012L3M", email: "sofia.torres@email.com",    telefono: "558 444 555", estado: "Activo"   },
  { nombre: "Héctor Delgado",  rfc: "RFCH7890123N4O", email: "hector.delgado@email.com",  telefono: "559 888 777", estado: "Inactivo" },
  { nombre: "Patricia Vega",   rfc: "RFCP8901234P5Q", email: "patricia.vega@email.com",   telefono: "552 666 333", estado: "Activo"   },
  { nombre: "Diego Ramírez",   rfc: "RFCD9012345Q6R", email: "diego.ramirez@email.com",   telefono: "554 222 888", estado: "Activo"   },
  { nombre: "Verónica Ríos",   rfc: "RFCV0123456R7S", email: "veronica.rios@email.com",   telefono: "551 333 999", estado: "Inactivo" },
  { nombre: "Ricardo Paredes", rfc: "RFCR1234567S8T", email: "ricardo.paredes@email.com", telefono: "556 777 000", estado: "Activo"   },
  { nombre: "Natalia Cruz",    rfc: "RFCN2345678T9U", email: "natalia.cruz@email.com",    telefono: "557 555 444", estado: "Activo"   },
];

const opcionesFiltroClientes = [
  { value: "",         label: "Todos"    },
  { value: "Activo",   label: "Activos"  },
  { value: "Inactivo", label: "Inactivos"},
];

const encabezadosClientes = ["Nombre", "RFC", "Email", "Teléfono", "Estado", "Acciones"];

export default function Clientes() {
  useTitulo("Clientes");

  const [rows,                 setRows]                 = useState([]);
  const [stats,                setStats]                = useState({ total: 0, activos: 0, inactivos: 0 });
  const [statusFilter,         setStatusFilter]         = useState("");
  const [search,               setSearch]               = useState("");
  const [paginaActiva,         setPaginaActiva]         = useState(1);
  const [totalRegistros,       setTotalRegistros]       = useState(0);
  const [hasSeeded,            setHasSeeded]            = useState(false);
  const [refresh,              setRefresh]              = useState(0);
  const [loading,              setLoading]              = useState(false);
  const [clienteSeleccionado,  setClienteSeleccionado]  = useState(null);
  const [clienteEditando,      setClienteEditando]      = useState(null);
  const [clienteEliminando,    setClienteEliminando]    = useState(null);
  const [mostrarNuevoCliente,  setMostrarNuevoCliente]  = useState(false);
  const [modalExito,           setModalExito]           = useState("");

  const handleVerCliente     = (c) => setClienteSeleccionado(c);
  const handleEditarCliente  = (c) => setClienteEditando({ ...c });
  const handleEliminarCliente= (c) => setClienteEliminando(c);
  const cancelarEliminarCliente = () => setClienteEliminando(null);

  const guardarClienteEditado = async (clienteActualizado) => {
    try {
      await api.patch(`/clients/${clienteActualizado.id}`, {
        nombre:   clienteActualizado.nombre,
        email:    clienteActualizado.email,
        telefono: clienteActualizado.telefono,
      });
      setRefresh((p) => p + 1);
      setModalExito("Cliente actualizado correctamente");
      setClienteEditando(null);
      setClienteSeleccionado(null);
    } catch (error) {
      console.error("Error actualizando cliente:", error);
      window.alert("No se pudo actualizar el cliente. Revisa la consola.");
    }
  };

  const confirmEliminarCliente = async () => {
    if (!clienteEliminando) return;
    try {
      await api.delete(`/clients/${clienteEliminando.id}`);
      setRefresh((p) => p + 1);
      setModalExito("Cliente eliminado correctamente");
      setClienteEliminando(null);
      setClienteSeleccionado(null);
    } catch (error) {
      console.error("Error eliminando cliente:", error);
      window.alert("No se pudo eliminar el cliente. Revisa la consola.");
    }
  };

  const crearNuevoCliente = async (datosCliente) => {
    try {
      await api.post("/clients", {
        nombre:  datosCliente.nombre,
        email:   datosCliente.email,
        telefono:datosCliente.telefono,
        rfc:     datosCliente.rfc,
        activo:  true,
        roleId:  "CLIENTE",
      });
      if (datosCliente.usuario && datosCliente.password) {
        await api.post("/users", {
          nombre:   datosCliente.nombre,
          apellido: "Cliente",
          email:    datosCliente.email,
          usuario:  datosCliente.usuario,
          password: datosCliente.password,
          roleId:   "CLIENTE",
          activo:   true,
        });
      }
      setRefresh((p) => p + 1);
      setModalExito("Cliente creado correctamente");
      setMostrarNuevoCliente(false);
    } catch (error) {
      console.error("Error creando cliente:", error);
      window.alert("No se pudo crear el cliente. Revisa la consola.");
    }
  };

  const buildQuery = () => {
    const params = new URLSearchParams();
    params.set("page",  String(paginaActiva));
    params.set("limit", String(LIMIT));
    if (search.trim())              params.set("q",      search.trim());
    if (statusFilter === "Activo")  params.set("activo", "true");
    if (statusFilter === "Inactivo")params.set("activo", "false");
    return params.toString();
  };

  const getStatsFromItems = (items) => ({
    total:    items.length,
    activos:  items.filter((i) => i.estado === "Activo").length,
    inactivos:items.filter((i) => i.estado === "Inactivo").length,
  });

  const seedClients = async () => {
    for (const cliente of CLIENTES_MOCK) {
      try {
        await api.post("/clients", {
          nombre:   cliente.nombre,
          rfc:      cliente.rfc,
          email:    cliente.email,
          telefono: cliente.telefono,
          activo:   cliente.estado === "Activo",
          roleId:   "CLIENTE",
        });
      } catch (error) {
        console.error("Error creando cliente de seed:", error);
      }
    }
  };

  const clientesFiltrados = rows.filter((cliente) => {
    const pasaFiltroEstado   = statusFilter === "" || cliente.estado === statusFilter;
    const textoBuscado       = (search || "").toLowerCase();
    const pasaFiltroBusqueda =
      String(cliente.nombre   || "").toLowerCase().includes(textoBuscado) ||
      String(cliente.rfc      || "").toLowerCase().includes(textoBuscado) ||
      String(cliente.email    || "").toLowerCase().includes(textoBuscado) ||
      String(cliente.telefono || "").toLowerCase().includes(textoBuscado);
    return pasaFiltroEstado && pasaFiltroBusqueda;
  });

  useEffect(() => {
    const loadClients = async () => {
      setLoading(true);
      try {
        const data  = await api.get(`/clients?${buildQuery()}`);
        const items = Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : [];
        const normalized = items.map((item) => ({
          ...item,
          estado: item.activo === false ? "Inactivo" : "Activo",
          rol:    "CLIENTE",
        }));
        setRows(normalized);
        setTotalRegistros(typeof data.total === "number" ? data.total : normalized.length);
        setStats(getStatsFromItems(normalized));
        if (!hasSeeded && paginaActiva === 1 && normalized.length === 0) {
          setHasSeeded(true);
          await seedClients();
          setRefresh((p) => p + 1);
        }
      } catch (error) {
        console.error("Error cargando clientes:", error);
      } finally {
        setLoading(false);
      }
    };
    loadClients();
  }, [statusFilter, search, paginaActiva, hasSeeded, refresh]);

  useEffect(() => { setPaginaActiva(1); }, [statusFilter, search]);

  const handleCambiarPagina = (page) => {
    if      (page === "‹") setPaginaActiva((c) => Math.max(1, c - 1));
    else if (page === "›") setPaginaActiva((c) => Math.min(Math.max(1, Math.ceil(totalRegistros / LIMIT)), c + 1));
    else                   setPaginaActiva(Number(page));
  };

  // ── Modal base reutilizable ──────────────────────────────────
  function ModalBase({ onClose, children }) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-lg rounded-3xl border shadow-2xl p-6
            bg-blanco border-oscuro/15
            dark:bg-oscuro/90 dark:border-lila/30"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute right-5 top-5 text-xl transition-opacity opacity-70 hover:opacity-100
              text-oscuro
              dark:text-lila"
          >
            <i className="bi bi-x-lg" />
          </button>
          {children}
        </div>
      </div>
    );
  }

  // ── Tarjeta de campo dentro de modales ──────────────────────
  function CampoCard({ label, value }) {
    return (
      <div className="rounded-2xl border p-4
        bg-oscuro/5 border-oscuro/10
        dark:bg-[#1E1A35] dark:border-lila/20">
        <p className="text-xs uppercase tracking-[0.25em] mb-2
          text-oscuro/50
          dark:text-lila-soft">
          {label}
        </p>
        <p className="text-base font-semibold
          text-oscuro
          dark:text-blanco">
          {value || "—"}
        </p>
      </div>
    );
  }

  // ── Modal Ver Detalle ────────────────────────────────────────
  function ModalDetalleCliente({ cliente, onClose }) {
    if (!cliente) return null;
    return (
      <ModalBase onClose={onClose}>
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2
            text-oscuro dark:text-blanco">
            Detalle de cliente
          </h2>
          <p className="text-sm text-oscuro/50 dark:text-lila-soft">
            Revisa la información del cliente y usa las acciones disponibles.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          <CampoCard label="Nombre"   value={cliente.nombre}   />
          <CampoCard label="RFC"      value={cliente.rfc}      />
          <CampoCard label="Email"    value={cliente.email}    />
          <CampoCard label="Teléfono" value={cliente.telefono} />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] mb-2
              text-oscuro/50 dark:text-lila-soft">
              Estado
            </p>
            <Etiquetas contenido={cliente.estado || "—"} />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { onClose(); handleEditarCliente(cliente); }}
              className="rounded-2xl border px-5 py-2 text-sm font-bold transition
                bg-oscuro/5 border-oscuro/20 text-oscuro hover:bg-oscuro/10
                dark:bg-lila/10 dark:border-lila/40 dark:text-lila dark:hover:bg-lila/20"
            >
              Editar
            </button>
            <button
              onClick={() => { onClose(); handleEliminarCliente(cliente); }}
              className="rounded-2xl border px-5 py-2 text-sm font-bold transition
                bg-rojo/5 border-rojo/20 text-rojo hover:bg-rojo/10
                dark:bg-rojo/10 dark:border-rojo/50 dark:text-rojo dark:hover:bg-rojo/20"
            >
              Eliminar
            </button>
          </div>
        </div>
      </ModalBase>
    );
  }

  // ── Modal Editar ─────────────────────────────────────────────
  function ModalEditarCliente({ cliente, onClose, onGuardar }) {
    const [form, setForm] = useState({
      nombre:   cliente?.nombre   || "",
      email:    cliente?.email    || "",
      telefono: cliente?.telefono || "",
    });
    if (!cliente) return null;
    const handleChange = (e) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
    };
    return (
      <ModalBase onClose={onClose}>
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2 font-baskervville uppercase tracking-widest
            text-oscuro dark:text-blanco">
            Editar cliente
          </h2>
          <p className="text-sm text-oscuro/50 dark:text-lila-soft">
            Actualiza la información y guarda los cambios.
          </p>
        </div>
        <div className="grid gap-5 mb-6">
          <Input label="Nombre"   tipo="text"  name="nombre"   value={form.nombre}   onChange={handleChange} placeholder="Nombre del cliente" />
          <Input label="Email"    tipo="text"  name="email"    value={form.email}    onChange={handleChange} placeholder="correo@ejemplo.com"  />
          <Input label="Teléfono" tipo="text"  name="telefono" value={form.telefono} onChange={handleChange} placeholder="Número de teléfono"  />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Boton variante="oscuro" onClick={onClose}>Cancelar</Boton>
          <Boton variante="claro"  onClick={() => onGuardar({ ...cliente, ...form })}>Guardar cambios</Boton>
        </div>
      </ModalBase>
    );
  }

  // ════════════════════════════════════════════════════════════
  return (
    <div className="p-4 sm:p-6 lg:p-8">

      <h1 className="text-2xl font-bold mb-6 uppercase tracking-wide text-center sm:text-left
        text-oscuro dark:text-blanco">
        Clientes
      </h1>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full mb-8">
        <Tarjetas
          label="Total de clientes" value={stats.total}
          sub="Todos los clientes"  icon="bi bi-people"
          onClick={() => { setStatusFilter(""); setPaginaActiva(1); }}
          isActive={statusFilter === ""}
        />
        <Tarjetas
          label="Clientes activos"  value={stats.activos}
          sub={stats.total ? `${Math.round((stats.activos / stats.total) * 100)}% del total` : "0%"}
          accent="#22C55E" icon="bi bi-check-circle"
          onClick={() => { setStatusFilter(statusFilter === "Activo" ? "" : "Activo"); setPaginaActiva(1); }}
          isActive={statusFilter === "Activo"}
        />
        <Tarjetas
          label="Clientes inactivos" value={stats.inactivos}
          sub={stats.total ? `${Math.round((stats.inactivos / stats.total) * 100)}% del total` : "0%"}
          accent="#EF4444" icon="bi bi-x-circle"
          onClick={() => { setStatusFilter(statusFilter === "Inactivo" ? "" : "Inactivo"); setPaginaActiva(1); }}
          isActive={statusFilter === "Inactivo"}
        />
      </div>

      <ToolBar
        filtro={statusFilter}
        setFiltro={setStatusFilter}
        opcionesFiltro={opcionesFiltroClientes}
        busqueda={search}
        setBusqueda={setSearch}
        placeholderBuscar="Buscar por nombre, RFC, email o teléfono..."
        textoBoton="+ Cliente"
        accionBoton={() => setMostrarNuevoCliente(true)}
      />

      {/* ── Tabla ── */}
      <Tabla encabezados={encabezadosClientes}>
        {loading ? (
          <tr>
            <td colSpan={6} className="text-center py-10 text-sm opacity-50 text-lila dark:text-lila">
              Cargando clientes...
            </td>
          </tr>
        ) : clientesFiltrados.length === 0 ? (
          <tr>
            <td colSpan={6} className="text-center py-10 text-sm opacity-50 text-oscuro dark:text-lila">
              No hay resultados
            </td>
          </tr>
        ) : (
          clientesFiltrados.map((usuario) => (
            <tr
              key={usuario.id}
              className="border-b transition-colors
                border-oscuro/5 hover:bg-oscuro/5
                dark:border-transparent dark:hover:bg-oscuro/40"
            >
              <td className="p-4 text-center text-sm whitespace-nowrap font-medium
                text-oscuro dark:text-blanco">
                {usuario.nombre}
              </td>
              <td className="p-4 text-center text-sm whitespace-nowrap font-mono
                text-oscuro/60 dark:text-lila-soft">
                {usuario.rfc}
              </td>
              <td className="p-4 text-center text-sm whitespace-nowrap
                text-oscuro/70 dark:text-lila-soft">
                {usuario.email}
              </td>
              <td className="p-4 text-center text-sm whitespace-nowrap
                text-oscuro/60 dark:text-lila-soft">
                {usuario.telefono}
              </td>
              <td className="p-4 text-center whitespace-nowrap">
                <Etiquetas contenido={usuario.estado} />
              </td>
              <td className="p-4 align-middle whitespace-nowrap">
                <AccionesTabla
                  onVer={()      => handleVerCliente(usuario)}
                  onEditar={()   => handleEditarCliente(usuario)}
                  onEliminar={() => handleEliminarCliente(usuario)}
                />
              </td>
            </tr>
          ))
        )}
      </Tabla>

      <Paginacion
        paginaActual={paginaActiva}
        totalRegistros={totalRegistros}
        rangoSiguiente={`${totalRegistros === 0 ? 0 : (paginaActiva - 1) * LIMIT + 1} – ${Math.min(paginaActiva * LIMIT, totalRegistros)}`}
        onCambiarPagina={handleCambiarPagina}
        exportTitulo="Clientes"
        exportColumnas={[
          { header: "Nombre",   key: "nombre",   width: 28 },
          { header: "RFC",      key: "rfc",       width: 18 },
          { header: "Email",    key: "email",     width: 28 },
          { header: "Teléfono", key: "telefono",  width: 16 },
          { header: "Estado",   key: "estado",    width: 12 },
        ]}
        exportFilas={rows.map((c) => ({
          nombre:   c.nombre,
          rfc:      c.rfc,
          email:    c.email,
          telefono: c.telefono,
          estado:   c.estado,
        }))}
      />

      {/* ── Modales ── */}
      {clienteSeleccionado && (
        <ModalDetalleCliente
          cliente={clienteSeleccionado}
          onClose={() => setClienteSeleccionado(null)}
        />
      )}
      {clienteEditando && (
        <ModalEditarCliente
          cliente={clienteEditando}
          onClose={() => setClienteEditando(null)}
          onGuardar={guardarClienteEditado}
        />
      )}
      {clienteEliminando && (
        <ModalConfirmacion
          tipo="eliminar"
          titulo="¿Eliminar cliente?"
          mensaje={`${clienteEliminando.nombre || "Cliente"} será eliminado permanentemente.`}
          textoConfirmar="Eliminar"
          onConfirmar={confirmEliminarCliente}
          onCancelar={cancelarEliminarCliente}
        />
      )}
      {mostrarNuevoCliente && (
        <ModalNuevoCliente
          onClose={() => setMostrarNuevoCliente(false)}
          onGuardar={crearNuevoCliente}
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


function ModalNuevoCliente({ onClose, onGuardar }) {
  const [form, setForm] = useState({
    nombre: "", email: "", telefono: "", rfc: "", usuario: "", password: "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl border shadow-2xl p-6 max-h-[90vh] overflow-y-auto
          bg-blanco border-oscuro/15
          dark:bg-oscuro/90 dark:border-lila/30"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-xl transition-opacity opacity-70 hover:opacity-100
            text-oscuro dark:text-lila"
        >
          <i className="bi bi-x-lg" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2 font-baskervville uppercase tracking-widest
            text-oscuro dark:text-blanco">
            Nuevo cliente
          </h2>
          <p className="text-sm text-oscuro/50 dark:text-lila-soft">
            Ingresa los datos para crear un cliente. Los campos de usuario y contraseña son opcionales.
          </p>
        </div>

        <div className="grid gap-5 mb-6">
          <Input label="Nombre"   tipo="text"     name="nombre"   value={form.nombre}   onChange={handleChange} placeholder="Nombre del cliente"       requerido />
          <Input label="RFC"      tipo="text"     name="rfc"      value={form.rfc}      onChange={handleChange} placeholder="RFC"                       requerido />
          <Input label="Email"    tipo="text"     name="email"    value={form.email}    onChange={handleChange} placeholder="correo@ejemplo.com"        requerido />
          <Input label="Teléfono" tipo="text"     name="telefono" value={form.telefono} onChange={handleChange} placeholder="Número de teléfono"        requerido />

          <div className="border-t pt-4 mt-2
            border-oscuro/10 dark:border-lila/20">
            <p className="text-xs uppercase tracking-[0.25em] mb-4 font-bold
              text-oscuro/50 dark:text-lila-soft">
              Credenciales de acceso (opcional)
            </p>
            <div className="grid gap-5">
              <Input label="Usuario"    tipo="text"     name="usuario"  value={form.usuario}  onChange={handleChange} placeholder="Usuario para iniciar sesión"    />
              <Input label="Contraseña" tipo="password" name="password" value={form.password} onChange={handleChange} placeholder="Contraseña para iniciar sesión" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Boton variante="oscuro" onClick={onClose}>Cancelar</Boton>
          <Boton variante="claro"  onClick={() => onGuardar(form)}>Crear cliente</Boton>
        </div>
      </div>
    </div>
  );
}