import { useEffect, useState } from "react";
import Etiquetas from "../components/Etiquetas";
import Tarjetas from "../components/Tarjetas";
import Tabla from "../components/Tabla";
import ToolBar from "../components/ToolBar";
import AccionesTabla from "../components/AccionesTabla";
import Paginacion from "../components/Paginacion";

const LIMIT = 10;

const USUARIOS_MOCK = [
  {
    id: 1,
    nombre: "Textiles del Norte S.A. de C.V.",
    rfc: "TNO240315AB1",
    giro: "Fabricación Textil",
    email: "ventas@textilesnorte.com",
    telefono: "55 4123 7890",
    estado: "Activo",
  },
  {
    id: 2,
    nombre: "Distribuidora NovaPack",
    rfc: "DNP190827CD2",
    giro: "Empaques y Embalajes",
    email: "contacto@novapack.com",
    telefono: "55 1987 6543",
    estado: "Activo",
  },
  {
    id: 3,
    nombre: "Suministros Industriales MX",
    rfc: "SIM210412EF3",
    giro: "Material Industrial",
    email: "proveedores@simx.com",
    telefono: "56 3321 8877",
    estado: "Inactivo",
  },
  {
    id: 4,
    nombre: "Global Print Solutions",
    rfc: "GPS180901GH4",
    giro: "Impresión y Serigrafía",
    email: "ventas@globalprint.com",
    telefono: "55 7654 1122",
    estado: "Activo",
  },
  {
    id: 5,
    nombre: "Comercializadora Velkan",
    rfc: "CVE220614IJ5",
    giro: "Distribución Mayorista",
    email: "info@velkan.com",
    telefono: "55 4433 2211",
    estado: "Activo",
  },
];

const opcionesFiltroProv = [
  { value: "", label: "Todos" },
  { value: "Activo", label: "Activos" },
  { value: "Inactivo", label: "Inactivos" }
];

const encabezadosProveedores = ["Nombre", "RFC", "Giro", "Teléfono", "Estado", "Acciones"];

export default function Proveedores() {
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
        ? [usuario.nombre, usuario.rfc, usuario.giro, usuario.email, usuario.telefono]
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
        Proveedores
      </h1>

      <div className="flex flex-col sm:flex-row gap-6 w-full mb-8">
        <Tarjetas
          label="Total de proveedores"
          value={stats.total}
          sub="Todos los proveedores"
          icon="bi bi-building"
        />
        <Tarjetas
          label="Proveedores activos"
          value={stats.activos}
          sub={stats.total ? `${Math.round((stats.activos / stats.total) * 100)}% del total` : "0%"}
          accent="#22C55E"
          icon="bi bi-check-circle"
        />
        <Tarjetas
          label="Proveedores inactivos"
          value={stats.inactivos}
          sub={stats.total ? `${Math.round((stats.inactivos / stats.total) * 100)}% del total` : "0%"}
          accent="#EF4444"
          icon="bi bi-x-circle"
        />
      </div>

      <ToolBar
        filtro={statusFilter}
        setFiltro={setStatusFilter}
        opcionesFiltro={opcionesFiltroProv}
        busqueda={search}
        setBusqueda={setSearch}
        placeholderBuscar="Buscar por nombre, RFC, giro o teléfono..."
        textoBoton="+ Proveedor"
        accionBoton={() => console.log("Agregar proveedor")}
      />

      <Tabla encabezados={encabezadosProveedores}>
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
              <td className="p-4 text-center text-sm whitespace-nowrap">{usuario.giro}</td>
              <td className="p-4 text-center text-sm whitespace-nowrap">{usuario.telefono}</td>
              <td className="p-4 text-center whitespace-nowrap">
                <Etiquetas contenido={usuario.estado} />
              </td>
              <td className="p-4 align-middle whitespace-nowrap">
                <AccionesTabla
                  onVer={() => console.log("Ver proveedor", usuario.id)}
                  onEditar={() => console.log("Editar proveedor", usuario.id)}
                  onEliminar={() => console.log("Eliminar proveedor", usuario.id)}
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
        onExportar={() => console.log("Exportando proveedores...")}
        onCambiarPagina={handleCambiarPagina}
      />
    </div>
  );
}
