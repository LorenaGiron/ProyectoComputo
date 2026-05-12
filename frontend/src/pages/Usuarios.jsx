import { useState } from "react";
import Tarjetas from "../components/Tarjetas";
import Etiquetas from "../components/Etiquetas";
import ToolBar from "../components/ToolBar";
import AccionesTabla from "../components/AccionesTabla";
import { ArrowUp, ArrowDown } from "lucide-react";

/* ─── Página principal ─── */
const LIMIT = 10;

const MOCK_USUARIOS = [
  { id: 1, username: "usuario1", nombre: "Fernando Mendez", email: "fer@email.com", rol: "Admin", estado: "Activo" },
  { id: 2, username: "usuario2", nombre: "Maria Garcia", email: "maria@email.com", rol: "Bodeguero", estado: "Inactivo" },
  { id: 3, username: "usuario3", nombre: "Juan Pérez", email: "juan@email.com", rol: "Vendedor", estado: "Activo" },
  { id: 4, username: "usuario4", nombre: "Ana López", email: "ana@email.com", rol: "Admin", estado: "Inactivo" },
  { id: 5, username: "usuario5", nombre: "Carlos Díaz", email: "carlos@email.com", rol: "Bodeguero", estado: "Activo" },
  { id: 6, username: "usuario6", nombre: "Isabel Ruiz", email: "isabel@email.com", rol: "Vendedor", estado: "Activo" },
];

export default function Usuarios() {
  const [filtro, setFiltro] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const opcionesFiltroUsuarios = [
    { value: "", label: "Todos" },
    { value: "Activo", label: "Activos" },
    { value: "Inactivo", label: "Inactivos" }
  ];

  const encabezadosUsuarios = [
    { label: "Usuario", key: "username", sortable: true },
    { label: "Nombre", key: "nombre", sortable: true },
    { label: "Email", key: "email", sortable: true },
    { label: "Rol", key: "rol", sortable: true },
    { label: "Estado", key: "estado", sortable: true },
    { label: "Acciones", key: null, sortable: false }
  ];

  const datosFiltrados = MOCK_USUARIOS
    .filter((row) => filtro === "" || row.estado === filtro)
    .filter((row) => 
      busqueda === "" || 
      row.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
      row.username.toLowerCase().includes(busqueda.toLowerCase()) ||
      row.email.toLowerCase().includes(busqueda.toLowerCase())
    );

  // Función para manejar el ordenamiento
  const handleSort = (field) => {
    let newDirection = "asc";
    if (sortField === field && sortDirection === "asc") {
      newDirection = "desc";
    }
    setSortField(field);
    setSortDirection(newDirection);
  };

  // Función para ordenar los datos
  const getSortedRows = () => {
    if (!sortField) return datosFiltrados;

    const sorted = [...datosFiltrados].sort((a, b) => {
      let valueA = a[sortField] || "";
      let valueB = b[sortField] || "";

      if (typeof valueA === "string") valueA = valueA.toLowerCase();
      if (typeof valueB === "string") valueB = valueB.toLowerCase();

      if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
      if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  const sortedRows = getSortedRows();

  const activos = MOCK_USUARIOS.filter((u) => u.estado === "Activo").length;
  const inactivos = MOCK_USUARIOS.filter((u) => u.estado === "Inactivo").length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6 text-blanco uppercase tracking-wide text-center sm:text-left">
        Gestión de Usuarios
      </h1>

      {/* Tarjetas de estadísticas */}
      <div className="flex flex-col sm:flex-row gap-6 w-full mb-8">
        <Tarjetas 
          label="Total de usuarios" 
          value={MOCK_USUARIOS.length} 
          sub="Todos los usuarios" 
          icon="bi bi-people"
        />
        <Tarjetas 
          label="Usuarios Activos" 
          value={activos} 
          sub={`${MOCK_USUARIOS.length ? Math.round(activos / MOCK_USUARIOS.length * 100) : 0}% del total`} 
          accent="#A3E378" 
          icon="bi bi-check-circle" 
        />
        <Tarjetas 
          label="Usuarios Inactivos" 
          value={inactivos} 
          sub={`${MOCK_USUARIOS.length ? Math.round(inactivos / MOCK_USUARIOS.length * 100) : 0}% del total`} 
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
        textoBoton="+ Usuario"
        accionBoton={() => console.log("Agregar usuario")}
      />

      {/* Tabla */}
      <div className="bg-bg-card rounded-xl border border-lila/10 shadow-lg overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-lila/10 bg-oscuro/50">
              {encabezadosUsuarios.map((header, idx) => (
                <th key={idx} 
                  onClick={() => header.sortable && handleSort(header.key)}
                  className={`p-4 text-left text-xs uppercase font-bold tracking-wider text-lila ${header.sortable ? "cursor-pointer hover:text-lila-mid transition-colors" : ""}`}>
                  <div className="flex items-center gap-2">
                    {header.label}
                    {header.sortable && sortField === header.key && (
                      sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-sm opacity-50 text-lila">
                  No hay resultados
                </td>
              </tr>
            ) : (
              sortedRows.map((row, i) => (
                <tr key={i} className="border-b border-lila/5 hover:bg-oscuro/40 transition-colors text-white">
                  
                  <td className="p-4 text-center text-sm whitespace-nowrap font-medium">{row.username}</td>
                  <td className="p-4 text-center text-sm whitespace-nowrap">{row.nombre}</td>
                  <td className="p-4 text-center text-sm whitespace-nowrap">{row.email}</td>
                  
                  <td className="p-4 text-center whitespace-nowrap">
                    <Etiquetas contenido={row.rol} />
                  </td>
                  
                  <td className="p-4 text-center whitespace-nowrap">
                    <Etiquetas contenido={row.estado} />
                  </td>
                  
                  <td className="p-4 align-middle whitespace-nowrap">
                    <AccionesTabla 
                      onVer={() => console.log("Ver usuario", row.username)}
                      onEditar={() => console.log("Editar usuario", row.username)}
                      onEliminar={() => console.log("Eliminar usuario", row.username)}
                    />
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
