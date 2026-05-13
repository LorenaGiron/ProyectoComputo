import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Etiquetas from "../components/Etiquetas";
import Tarjetas from "../components/Tarjetas";
import Tabla from "../components/Tabla";
import ToolBar from "../components/ToolBar";
import AccionesTabla from "../components/AccionesTabla";
import Paginacion from "../components/Paginacion";

const LIMIT = 10;

const USUARIOS_MOCK = [
  { id: 1, nombre: "Ana Morales", rfc: "RFCA1234567B8C", email: "ana.morales@email.com", telefono: "554 123 789", estado: "Activo" },
  { id: 2, nombre: "Jorge Herrera", rfc: "RFCJ2345678D9E", email: "jorge.herrerra@email.com", telefono: "551 987 321", estado: "Inactivo" },
  { id: 3, nombre: "Carla Sánchez", rfc: "RFCC3456789F0G", email: "carla.sanchez@email.com", telefono: "556 321 654", estado: "Activo" },
  { id: 4, nombre: "María López", rfc: "RFCM4567890H1I", email: "maria.lopez@email.com", telefono: "557 654 123", estado: "Activo" },
  { id: 5, nombre: "Luis Martínez", rfc: "RFCL5678901J2K", email: "luis.martinez@email.com", telefono: "553 111 222", estado: "Activo" },
  { id: 6, nombre: "Sofía Torres", rfc: "RFCS6789012L3M", email: "sofia.torres@email.com", telefono: "558 444 555", estado: "Activo" },
  { id: 7, nombre: "Héctor Delgado", rfc: "RFCH7890123N4O", email: "hector.delgado@email.com", telefono: "559 888 777", estado: "Inactivo" },
  { id: 8, nombre: "Patricia Vega", rfc: "RFCP8901234P5Q", email: "patricia.vega@email.com", telefono: "552 666 333", estado: "Activo" },
  { id: 9, nombre: "Diego Ramírez", rfc: "RFCD9012345Q6R", email: "diego.ramirez@email.com", telefono: "554 222 888", estado: "Activo" },
  { id: 10, nombre: "Verónica Ríos", rfc: "RFCV0123456R7S", email: "veronica.rios@email.com", telefono: "551 333 999", estado: "Inactivo" },
  { id: 11, nombre: "Ricardo Paredes", rfc: "RFCR1234567S8T", email: "ricardo.paredes@email.com", telefono: "556 777 000", estado: "Activo" },
  { id: 12, nombre: "Natalia Cruz", rfc: "RFCN2345678T9U", email: "natalia.cruz@email.com", telefono: "557 555 444", estado: "Activo" },
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

  useEffect(() => {
    const activos = USUARIOS_MOCK.filter((usuario) => usuario.estado === "Activo").length;
    const inactivos = USUARIOS_MOCK.filter((usuario) => usuario.estado === "Inactivo").length;
    setStats({ total: USUARIOS_MOCK.length, activos, inactivos });
  }, []);

  useEffect(() => {
    const keyword = search.trim().toLowerCase();
    const filtered = USUARIOS_MOCK.filter((usuario) => {
      const matchesStatus = statusFilter ? usuario.estado.toLowerCase() === statusFilter.toLowerCase() : true;
      const matchesSearch = keyword
        ? [usuario.nombre, usuario.rfc, usuario.email, usuario.telefono]
            .some((value) => value.toLowerCase().includes(keyword))
        : true;
      return matchesStatus && matchesSearch;
    });

    setTotalRegistros(filtered.length);
    const start = (paginaActiva - 1) * LIMIT;
    setRows(filtered.slice(start, start + LIMIT));
  }, [statusFilter, search, paginaActiva]);

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
        accionBoton={() => console.log("Agregar cliente")}
      />

      <Tabla encabezados={encabezadosClientes}>
        {rows.length === 0 ? (
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
                  onVer={() => console.log("Ver cliente", usuario.id)}
                  onEditar={() => console.log("Editar cliente", usuario.id)}
                  onEliminar={() => console.log("Eliminar cliente", usuario.id)}
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
    </div>
  );
}
