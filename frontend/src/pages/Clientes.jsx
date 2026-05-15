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

const API_BASE = import.meta.env.VITE_API_URL ?? "";
const LIMIT = 10;

const CLIENTES_MOCK = [
  { nombre: "Ana Morales", rfc: "RFCA1234567B8C", email: "ana.morales@email.com", telefono: "554 123 789", estado: "Activo" },
  { nombre: "Jorge Herrera", rfc: "RFCJ2345678D9E", email: "jorge.herrerra@email.com", telefono: "551 987 321", estado: "Inactivo" },
  { nombre: "Carla Sánchez", rfc: "RFCC3456789F0G", email: "carla.sanchez@email.com", telefono: "556 321 654", estado: "Activo" },
  { nombre: "María López", rfc: "RFCM4567890H1I", email: "maria.lopez@email.com", telefono: "557 654 123", estado: "Activo" },
  { nombre: "Luis Martínez", rfc: "RFCL5678901J2K", email: "luis.martinez@email.com", telefono: "553 111 222", estado: "Activo" },
  { nombre: "Sofía Torres", rfc: "RFCS6789012L3M", email: "sofia.torres@email.com", telefono: "558 444 555", estado: "Activo" },
  { nombre: "Héctor Delgado", rfc: "RFCH7890123N4O", email: "hector.delgado@email.com", telefono: "559 888 777", estado: "Inactivo" },
  { nombre: "Patricia Vega", rfc: "RFCP8901234P5Q", email: "patricia.vega@email.com", telefono: "552 666 333", estado: "Activo" },
  { nombre: "Diego Ramírez", rfc: "RFCD9012345Q6R", email: "diego.ramirez@email.com", telefono: "554 222 888", estado: "Activo" },
  { nombre: "Verónica Ríos", rfc: "RFCV0123456R7S", email: "veronica.rios@email.com", telefono: "551 333 999", estado: "Inactivo" },
  { nombre: "Ricardo Paredes", rfc: "RFCR1234567S8T", email: "ricardo.paredes@email.com", telefono: "556 777 000", estado: "Activo" },
  { nombre: "Natalia Cruz", rfc: "RFCN2345678T9U", email: "natalia.cruz@email.com", telefono: "557 555 444", estado: "Activo" },
];

const opcionesFiltroClientes = [
  { value: "", label: "Todos" },
  { value: "Activo", label: "Activos" },
  { value: "Inactivo", label: "Inactivos" }
];

const encabezadosClientes = ["Nombre", "RFC", "Email", "Teléfono", "Estado", "Acciones"];

export default function Clientes() {
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({ total: 0, activos: 0, inactivos: 0 });
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [paginaActiva, setPaginaActiva] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [hasSeeded, setHasSeeded] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [clienteEliminando, setClienteEliminando] = useState(null);
  const [mostrarNuevoCliente, setMostrarNuevoCliente] = useState(false);
  const [modalExito, setModalExito] = useState("");

  const handleVerCliente = (cliente) => {
    setClienteSeleccionado(cliente);
  };

  const handleEditarCliente = (cliente) => {
    setClienteEditando({ ...cliente });
  };

  const guardarClienteEditado = async (clienteActualizado) => {
    try {
      await api.patch(`/clients/${clienteActualizado.id}`, {
        nombre: clienteActualizado.nombre,
        email: clienteActualizado.email,
        telefono: clienteActualizado.telefono,
      });
      setRefresh((prev) => prev + 1);
      setModalExito("Cliente actualizado correctamente");
      setClienteEditando(null);
      setClienteSeleccionado(null);
    } catch (error) {
      console.error("Error actualizando cliente:", error);
      window.alert("No se pudo actualizar el cliente. Revisa la consola.");
    }
  };

  const handleEliminarCliente = (cliente) => {
    setClienteEliminando(cliente);
  };

  const confirmEliminarCliente = async () => {
    if (!clienteEliminando) return;

    try {
      await api.delete(`/clients/${clienteEliminando.id}`);
      setRefresh((prev) => prev + 1);
      setModalExito("Cliente eliminado correctamente");
      setClienteEliminando(null);
      setClienteSeleccionado(null);
    } catch (error) {
      console.error("Error eliminando cliente:", error);
      window.alert("No se pudo eliminar el cliente. Revisa la consola.");
    }
  };

  const cancelarEliminarCliente = () => {
    setClienteEliminando(null);
  };

  const crearNuevoCliente = async (datosCliente) => {
    try {
      await api.post("/clients", {
        nombre: datosCliente.nombre,
        email: datosCliente.email,
        telefono: datosCliente.telefono,
        rfc: datosCliente.rfc,
        activo: true,
      });
      setRefresh((prev) => prev + 1);
      setModalExito("Cliente creado correctamente");
      setMostrarNuevoCliente(false);
    } catch (error) {
      console.error("Error creando cliente:", error);
      window.alert("No se pudo crear el cliente. Revisa la consola.");
    }
  };

  const buildQuery = () => {
    const params = new URLSearchParams();
    params.set("page", String(paginaActiva));
    params.set("limit", String(LIMIT));
    if (search.trim()) params.set("q", search.trim());
    if (statusFilter === "Activo") params.set("activo", "true");
    if (statusFilter === "Inactivo") params.set("activo", "false");
    return params.toString();
  };

  const getStatsFromItems = (items) => {
    const activos = items.filter((item) => item.estado === "Activo").length;
    const inactivos = items.filter((item) => item.estado === "Inactivo").length;
    return {
      total: items.length,
      activos,
      inactivos,
    };
  };

  const seedClients = async () => {
    for (const cliente of CLIENTES_MOCK) {
      try {
        await api.post("/clients", {
          nombre: cliente.nombre,
          rfc: cliente.rfc,
          email: cliente.email,
          telefono: cliente.telefono,
          activo: cliente.estado === "Activo",
        });
      } catch (error) {
        console.error("Error creando cliente de seed:", error);
      }
    }
  };

  useEffect(() => {
    const loadClients = async () => {
      setLoading(true);

      try {
        const queryString = buildQuery();
        const data = await api.get(`/clients?${queryString}`);
        const items = Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : [];
        const normalized = items.map((item) => ({
          ...item,
          estado: item.activo === false ? "Inactivo" : "Activo",
          rol: "CLIENTE",
        }));

        setRows(normalized);
        setTotalRegistros(typeof data.total === "number" ? data.total : normalized.length);
        setStats(getStatsFromItems(normalized));

        if (!hasSeeded && paginaActiva === 1 && normalized.length === 0) {
          setHasSeeded(true);
          await seedClients();
          setRefresh((prev) => prev + 1);
        }
      } catch (error) {
        console.error("Error cargando clientes:", error);
      } finally {
        setLoading(false);
      }
    };

    loadClients();
  }, [statusFilter, search, paginaActiva, hasSeeded, refresh]);

  useEffect(() => {
    setPaginaActiva(1);
  }, [statusFilter, search]);

  const handleCambiarPagina = (page) => {
    if (page === "‹") {
      setPaginaActiva((current) => Math.max(1, current - 1));
    } else if (page === "›") {
      const totalPaginas = Math.max(1, Math.ceil(totalRegistros / LIMIT));
      setPaginaActiva((current) => Math.min(totalPaginas, current + 1));
    } else {
      setPaginaActiva(Number(page));
    }
  };

  function ModalDetalleCliente({ cliente, onClose }) {
    if (!cliente) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-lg rounded-3xl border border-lila/30 bg-oscuro/90 p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute right-5 top-5 text-lila opacity-70 hover:opacity-100 transition-opacity text-xl"
          >
            <i className="bi bi-x-lg" />
          </button>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-blanco mb-2">Detalle de cliente</h2>
            <p className="text-sm text-lila-soft">Revisa la información del cliente y usa las acciones disponibles.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 mb-6">
            <div className="rounded-2xl border border-lila/20 bg-[#1E1A35] p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-lila-soft mb-2">Nombre</p>
              <p className="text-base font-semibold text-white">{cliente.nombre || "—"}</p>
            </div>
            <div className="rounded-2xl border border-lila/20 bg-[#1E1A35] p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-lila-soft mb-2">RFC</p>
              <p className="text-base font-semibold text-white">{cliente.rfc || "—"}</p>
            </div>
            <div className="rounded-2xl border border-lila/20 bg-[#1E1A35] p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-lila-soft mb-2">Email</p>
              <p className="text-base font-semibold text-white">{cliente.email || "—"}</p>
            </div>
            <div className="rounded-2xl border border-lila/20 bg-[#1E1A35] p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-lila-soft mb-2">Teléfono</p>
              <p className="text-base font-semibold text-white">{cliente.telefono || "—"}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-lila-soft mb-2">Estado</p>
              <Etiquetas contenido={cliente.estado || "—"} />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  onClose();
                  handleEditarCliente(cliente);
                }}
                className="rounded-2xl border border-lila/40 bg-lila/10 px-5 py-2 text-sm font-bold text-lila transition hover:bg-lila/20"
              >
                Editar
              </button>
              <button
                onClick={() => {
                  onClose();
                  handleEliminarCliente(cliente);
                }}
                className="rounded-2xl border border-rojo/50 bg-rojo/10 px-5 py-2 text-sm font-bold text-rojo transition hover:bg-rojo/20"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function ModalEditarCliente({ cliente, onClose, onGuardar }) {
    const [form, setForm] = useState({
      nombre: cliente?.nombre || "",
      email: cliente?.email || "",
      telefono: cliente?.telefono || "",
    });

    if (!cliente) return null;

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
          className="relative w-full max-w-lg rounded-3xl border border-lila/30 bg-oscuro/90 p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute right-5 top-5 text-lila opacity-70 hover:opacity-100 transition-opacity text-xl"
          >
            <i className="bi bi-x-lg" />
          </button>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-blanco mb-2 font-baskervville uppercase tracking-widest">Editar cliente</h2>
            <p className="text-sm text-lila-soft">Actualiza la información y guarda los cambios.</p>
          </div>

          <div className="grid gap-5 mb-6">
            <Input
              label="Nombre"
              tipo="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Nombre del cliente"
            />
            <Input
              label="Email"
              tipo="text"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
            />
            <Input
              label="Teléfono"
              tipo="text"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              placeholder="Número de teléfono"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Boton variante="oscuro" onClick={onClose}>
              Cancelar
            </Boton>
            <Boton variante="claro" onClick={() => onGuardar({ ...cliente, ...form })}>
              Guardar cambios
            </Boton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6 text-blanco uppercase tracking-wide text-center sm:text-left">
        Clientes
      </h1>

      <div className="flex flex-col sm:flex-row gap-6 w-full mb-8">
        <Tarjetas
          label="Total de clientes"
          value={stats.total}
          sub="Todos los clientes"
          icon="bi bi-people"
        />
        <Tarjetas
          label="Clientes activos"
          value={stats.activos}
          sub={stats.total ? `${Math.round((stats.activos / stats.total) * 100)}% del total` : "0%"}
          accent="#22C55E"
          icon="bi bi-check-circle"
        />
        <Tarjetas
          label="Clientes inactivos"
          value={stats.inactivos}
          sub={stats.total ? `${Math.round((stats.inactivos / stats.total) * 100)}% del total` : "0%"}
          accent="#EF4444"
          icon="bi bi-x-circle"
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

      <Tabla encabezados={encabezadosClientes}>
        {loading ? (
          <tr>
            <td colSpan={6} className="text-center py-10 text-sm opacity-50 text-lila">
              Cargando clientes...
            </td>
          </tr>
        ) : rows.length === 0 ? (
          <tr>
            <td colSpan={6} className="text-center py-10 text-sm opacity-50 text-lila">
              No hay resultados
            </td>
          </tr>
        ) : (
          rows.map((usuario) => (
            <tr
              key={usuario.id}
              className="border-b border-lila/5 hover:bg-oscuro/40 transition-colors text-white"
            >
              <td className="p-4 text-center text-sm whitespace-nowrap font-medium">{usuario.nombre}</td>
              <td className="p-4 text-center text-sm whitespace-nowrap">{usuario.rfc}</td>
              <td className="p-4 text-center text-sm whitespace-nowrap">{usuario.email}</td>
              <td className="p-4 text-center text-sm whitespace-nowrap">{usuario.telefono}</td>
              <td className="p-4 text-center whitespace-nowrap">
                <Etiquetas contenido={usuario.estado} />
              </td>
              <td className="p-4 align-middle whitespace-nowrap">
                <AccionesTabla
                  onVer={() => handleVerCliente(usuario)}
                  onEditar={() => handleEditarCliente(usuario)}
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
        onExportar={() => console.log("Exportando clientes...")}
        onCambiarPagina={handleCambiarPagina}
      />

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
    nombre: "",
    email: "",
    telefono: "",
    rfc: "",
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
        className="relative w-full max-w-lg rounded-3xl border border-lila/30 bg-oscuro/90 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-lila opacity-70 hover:opacity-100 transition-opacity text-xl"
        >
          <i className="bi bi-x-lg" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-blanco mb-2 font-baskervville uppercase tracking-widest">Nuevo cliente</h2>
          <p className="text-sm text-lila-soft">Ingresa los datos para crear un cliente.</p>
        </div>

        <div className="grid gap-5 mb-6">
          <Input
            label="Nombre"
            tipo="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Nombre del cliente"
            requerido
          />
          <Input
            label="RFC"
            tipo="text"
            name="rfc"
            value={form.rfc}
            onChange={handleChange}
            placeholder="RFC"
            requerido
          />
          <Input
            label="Email"
            tipo="text"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="correo@ejemplo.com"
            requerido
          />
          <Input
            label="Teléfono"
            tipo="text"
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            placeholder="Número de teléfono"
            requerido
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Boton variante="oscuro" onClick={onClose}>
            Cancelar
          </Boton>
          <Boton variante="claro" onClick={() => onGuardar(form)}>
            Crear cliente
          </Boton>
        </div>
      </div>
    </div>
  );
}
