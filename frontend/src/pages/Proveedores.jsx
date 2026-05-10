import { useEffect, useState } from "react";
import {
  Edit2, Users, CheckCircle, XCircle, Trash2
} from "lucide-react";
// Íconos

// Componentes reutilizables
import Etiquetas from "../components/Etiquetas";
import Tarjetas from "../components/Tarjetas";
import Tabla from "../components/Tabla";
import ToolBar from "../components/Toolbar";
import Paginacion from "../components/Paginacion";


// ===============================
// CONSTANTES
// ===============================

// Cantidad máxima de registros por página
const LIMIT = 10;


// ===============================
// DATOS MOCK
// ===============================
// Simulan los proveedores obtenidos desde una API o BD

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


// ===============================
// COMPONENTE PRINCIPAL
// ===============================
function StatCard({ label, value, sub, color, icon }) {
  return (
    <div
      className="rounded-2xl p-5 transition-transform hover:-translate-y-1 hover:shadow-xl"
      style={{
        backgroundColor: "#221E3A",
        border: "1px solid #A68DC8",
        borderLeft: `6px solid ${color}`,
      }}
    >
      <div className="flex justify-between items-start mb-2">
        
        {/* Texto */}
        <span
          className="text-sm font-semibold"
          style={{ color: "#C9B8E8" }}
        >
          {label}
        </span>

        {/* CUADRO TRANSLÚCIDO DEL ICONO */}
        <span
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            backgroundColor: `${color}33`,
            color,
          }}
        >
          {icon}
        </span>
      </div>

      {/* Número */}
      <p
        className="font-extrabold leading-tight mb-1"
        style={{
          fontSize: "2.6rem",
          color,
        }}
      >
        {value}
      </p>

      {/* Texto pequeño */}
      <p
        className="text-xs font-semibold"
        style={{ color: "#5A5870" }}
      >
        {sub}
      </p>
    </div>
  );
}
export default function Proveedores() {

  // ===============================
  // ESTADOS
  // ===============================

  // Filas visibles en la tabla
  const [rows, setRows] = useState([]);

  // Estadísticas superiores
  const [stats, setStats] = useState({
    total: 0,
    activos: 0,
    inactivos: 0,
  });

  // Filtro de estado
  const [statusFilter, setStatusFilter] = useState("");

  // Texto de búsqueda
  const [search, setSearch] = useState("");

  // Página actual
  const [paginaActiva, setPaginaActiva] = useState(1);

  // Total de registros filtrados
  const [totalRegistros, setTotalRegistros] = useState(0);


  // ===============================
  // CALCULAR ESTADÍSTICAS
  // ===============================
  // Se ejecuta una sola vez al cargar

  useEffect(() => {

    // Contar proveedores activos
    const activos = USUARIOS_MOCK.filter(
      (usuario) => usuario.estado === "Activo"
    ).length;

    // Contar proveedores inactivos
    const inactivos = USUARIOS_MOCK.filter(
      (usuario) => usuario.estado === "Inactivo"
    ).length;

    // Guardar estadísticas
    setStats({
      total: USUARIOS_MOCK.length,
      activos,
      inactivos,
    });

  }, []);


  // ===============================
  // FILTRAR + BUSCAR + PAGINAR
  // ===============================

  useEffect(() => {

    // Convertir búsqueda a minúsculas
    const keyword = search.trim().toLowerCase();

    // Filtrar registros
    const filtered = USUARIOS_MOCK.filter((usuario) => {

      // Validar estado
      const matchesStatus = statusFilter
        ? usuario.estado.toLowerCase() === statusFilter.toLowerCase()
        : true;

      // Validar búsqueda
      const matchesSearch = keyword
        ? [
            usuario.nombre,
            usuario.rfc,
            usuario.email,
            usuario.telefono,
          ].some((value) =>
            value.toLowerCase().includes(keyword)
          )
        : true;

      return matchesStatus && matchesSearch;
    });

    // Guardar total filtrado
    setTotalRegistros(filtered.length);

    // Calcular inicio de página
    const start = (paginaActiva - 1) * LIMIT;

    // Obtener registros visibles
    setRows(filtered.slice(start, start + LIMIT));

  }, [statusFilter, search, paginaActiva]);


  // ===============================
  // REINICIAR PAGINACIÓN
  // ===============================
  // Cuando cambia búsqueda o filtro

  useEffect(() => {
    setPaginaActiva(1);
  }, [statusFilter, search]);


  // ===============================
  // VARIABLES AUXILIARES
  // ===============================

  // Calcular total de páginas
  const totalPaginas = Math.max(
    1,
    Math.ceil(totalRegistros / LIMIT)
  );

  // Saber si está activo "Todos"
  const isTotalActive = statusFilter === "";


  // ===============================
  // CAMBIO DE PÁGINAS
  // ===============================

  const cambiarPagina = (valor) => {

    // Página anterior
    if (valor === "‹") {
      setPaginaActiva((prev) => Math.max(1, prev - 1));
      return;
    }

    // Página siguiente
    if (valor === "›") {
      setPaginaActiva((prev) =>
        Math.min(totalPaginas, prev + 1)
      );
      return;
    }

    // Página específica
    setPaginaActiva(Number(valor));
  };


  // ===============================
  // RENDER
  // ===============================

  return (

    <div
      className="min-h-screen px-8 py-8"
      
    >

      <div className="mx-auto max-w-[1480px]">

        

          {/* =============================== */}
          {/* TÍTULO */}
          {/* =============================== */}

          <div className="mb-8">

            <h1 className="text-3xl font-extrabold text-white">
              PROVEEDORES
            </h1>

          </div>


          {/* =============================== */}
          {/* TARJETAS */}
          {/* =============================== */}

          <div className="grid gap-4 md:grid-cols-3">

        {/* STAT CARDS */}
     

        <StatCard
            label="TOTAL PROVEEDORES"
            value={stats.total}
            sub="proveedores registrados"
            color="#A68DC8"
            icon={<Users size={17} />}
        />

        <StatCard
            label="ACTIVOS"
            value={stats.activos}
            sub={`${stats.total ? Math.round(stats.activos / stats.total * 100) : 0}% del total`}
            color="#8DB051"
            icon={<CheckCircle size={17} />}
        />

        <StatCard
            label="INACTIVOS"
            value={stats.inactivos}
            sub={`${stats.total ? Math.round(stats.inactivos / stats.total * 100) : 0}% del total`}
            color="#cf3838"
            icon={<XCircle size={17} />}
        />

        

</div>


          {/* =============================== */}
          {/* TOOLBAR */}
          {/* =============================== */}

          <div className="mt-8">

            <ToolBar
              filtro={statusFilter}
              setFiltro={setStatusFilter}

              opcionesFiltro={[
                {
                  label: "Todos",
                  value: "",
                },
                {
                  label: "Activos",
                  value: "Activo",
                },
                {
                  label: "Inactivos",
                  value: "Inactivo",
                },
              ]}

              busqueda={search}
              setBusqueda={setSearch}

              placeholderBuscar="Buscar proveedor..."

              textoBoton="+ Proveedor"

              accionBoton={() => {
                console.log("Agregar proveedor");
              }}
            />

          </div>


          {/* =============================== */}
          {/* TABLA */}
          {/* =============================== */}

          <div className="mt-6">

            <Tabla
              encabezados={[
                "Nombre",
                "RFC",
                "Giro",
                "Teléfono",
                "Estado",
                "Acciones",
              ]}
            >

              {/* =============================== */}
              {/* SIN RESULTADOS */}
              {/* =============================== */}

              {rows.length === 0 ? (

                <tr>

                  <td
                    colSpan={6}
                    className="py-10 text-center text-sm text-[#E7D6FF]/50"
                  >
                    No hay resultados
                  </td>

                </tr>

              ) : (

                // ===============================
                // RECORRER PROVEEDORES
                // ===============================

                rows.map((usuario) => (

                  <tr
                    key={usuario.id}
                    className="border-b border-lila/10 hover:bg-white/5 transition"
                  >

                    {/* Nombre */}
                    <td className="p-4 text-center text-white font-semibold">
                      {usuario.nombre}
                    </td>

                    {/* RFC */}
                    <td className="p-4 text-center text-[#C9B8E8]">
                      {usuario.rfc}
                    </td>

                    {/* Giro */}
                    <td className="p-4 text-center text-[#C9B8E8]">
                      {usuario.giro}
                    </td>

                    {/* Teléfono */}
                    <td className="p-4 text-center text-[#C9B8E8]">
                      {usuario.telefono}
                    </td>

                    {/* Estado */}
                    <td className="p-4 text-center">
                      <Etiquetas contenido={usuario.estado} />
                    </td>

                    {/* Acciones */}
                    <td className="p-4">

                      <div className="flex justify-center gap-3">

                        {/* EDITAR */}
                        <button
                          className="w-9 h-9 rounded-lg border border-lila/20 text-lila-soft hover:bg-lila hover:text-black transition flex items-center justify-center"
                        >
                          <Edit2 size={16} />
                        </button>

                        {/* ELIMINAR */}
                        <button
                          className="w-9 h-9 rounded-lg border border-red-400/20 text-red-400 hover:bg-red-400 hover:text-black transition flex items-center justify-center"
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>

                    </td>

                  </tr>
                ))
              )}

            </Tabla>

          </div>


          {/* =============================== */}
          {/* PAGINACIÓN */}
          {/* =============================== */}

          <Paginacion

            paginaActual={paginaActiva}

            totalRegistros={totalRegistros}

            rangoSiguiente={
              totalRegistros === 0
                ? "0"
                : `${(paginaActiva - 1) * LIMIT + 1} – ${Math.min(
                    paginaActiva * LIMIT,
                    totalRegistros
                  )}`
            }

            onCambiarPagina={cambiarPagina}

            onExportar={() => {
              console.log("Exportar");
            }}
          />

        
      </div>
    </div>
  );
}