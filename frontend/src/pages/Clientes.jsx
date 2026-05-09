import { useEffect, useState } from "react";
import { Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import Etiquetas from "../components/Etiquetas";

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

function StatCard({ label, value, sub, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[28px] border p-6 text-left transition-all ${
        active ? "border-[#E7D6FF] bg-[#2E2A5B] shadow-xl" : "border-[#A68DC8]/25 bg-[#221E3A]/85 hover:border-[#E7D6FF]"
      }`}
    >
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#A68DC8]">{label}</p>
      <p className="mt-5 text-4xl font-extrabold text-white">{value}</p>
      <p className="mt-2 text-sm font-medium text-[#C9B8E8]">{sub}</p>
    </button>
  );
}

function ActionBtn({ onClick, hoverColor, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2D294D]/90 text-[#E7D6FF] transition"
      style={{ border: `1px solid rgba(166,141,200,0.25)` }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = hoverColor;
        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "#E7D6FF";
        e.currentTarget.style.backgroundColor = "rgba(45,41,77,0.56)";
      }}
    >
      {children}
    </button>
  );
}

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

  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / LIMIT));
  const isTotalActive = statusFilter === "";

  return (
    <div className="min-h-screen px-8 py-8" style={{ background: "#1A1730" }}>
      <div className="mx-auto max-w-[1480px]">
        <div className="rounded-[36px] border border-[#A68DC8]/30 bg-[#171328]/90 p-8 shadow-2xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.35em] text-[#A68DC8]">CLIENTES</p>
              <h1 className="mt-4 text-4xl font-extrabold text-white">Clientes</h1>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#E7D6FF]/25 bg-[#E7D6FF] px-5 py-3 text-sm font-bold text-[#221E3A] transition hover:opacity-90"
            >
              <Plus size={18} />
              Cliente
            </button>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <StatCard
              label="Total de clientes"
              value={stats.total}
              sub="Ver todos"
              active={isTotalActive}
              onClick={() => setStatusFilter("")}
            />
            <StatCard
              label="Activos"
              value={stats.activos}
              sub={stats.total ? `${Math.round((stats.activos / stats.total) * 100)}% del total` : "0%"}
              active={statusFilter.toLowerCase() === "activo"}
              onClick={() => setStatusFilter("Activo")}
            />
            <StatCard
              label="Inactivos"
              value={stats.inactivos}
              sub={stats.total ? `${Math.round((stats.inactivos / stats.total) * 100)}% del total` : "0%"}
              active={statusFilter.toLowerCase() === "inactivo"}
              onClick={() => setStatusFilter("Inactivo")}
            />
          </div>

          <div className="mt-8 flex flex-col gap-4 rounded-[28px] border border-[#A68DC8]/25 bg-[#221E3A]/80 p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-[#A68DC8]/25 bg-[#1E1A35] px-4 py-3 text-[#E7D6FF]">
              <Search size={18} className="text-[#C9B8E8]" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#5A5870]"
              />
            </div>
            <div className="flex items-center gap-3 justify-end">
              <button
                type="button"
                className="rounded-2xl border border-[#A68DC8]/25 bg-[#221E3A]/95 px-5 py-3 text-sm font-semibold text-[#E7D6FF] transition hover:bg-[#2A2550]"
              >
                Exportar
              </button>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto rounded-[30px] border border-[#A68DC8]/25 bg-[#1F1936] p-4">
            <table className="min-w-full border-separate border-spacing-y-3 text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-[0.25em] text-[#A68DC8]">
                  <th className="px-5 py-3">Nombre</th>
                  <th className="px-5 py-3">RFC</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Teléfono</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-sm opacity-50 text-[#E7D6FF]">
                      No hay resultados
                    </td>
                  </tr>
                ) : (
                  rows.map((usuario) => (
                    <tr
                      key={usuario.id}
                      className="rounded-[24px] border border-[#A68DC8]/10 bg-[#221E3A] transition hover:bg-[#2B2749]"
                    >
                      <td className="px-5 py-4 font-semibold text-white">{usuario.nombre}</td>
                      <td className="px-5 py-4 text-sm font-medium text-[#C9B8E8]">{usuario.rfc}</td>
                      <td className="px-5 py-4 text-sm font-medium text-[#C9B8E8]">{usuario.email}</td>
                      <td className="px-5 py-4 text-sm font-medium text-[#C9B8E8]">{usuario.telefono}</td>
                      <td className="px-5 py-4">
                        <Etiquetas contenido={usuario.estado} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <ActionBtn hoverColor="#A68DC8" onClick={() => {}}>
                            <Edit2 size={16} />
                          </ActionBtn>
                          <ActionBtn hoverColor="#e05c5c" onClick={() => {}}>
                            <Trash2 size={16} />
                          </ActionBtn>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-[#C9B8E8]">
              {totalRegistros === 0
                ? "0 registros"
                : `${(paginaActiva - 1) * LIMIT + 1} – ${Math.min(paginaActiva * LIMIT, totalRegistros)} de ${totalRegistros}`}
            </p>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#221E3A]/90 px-3 py-2">
              <button
                type="button"
                onClick={() => setPaginaActiva((current) => Math.max(1, current - 1))}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#2D294D] text-[#E7D6FF] transition hover:bg-[#413E74]"
                disabled={paginaActiva === 1}
              >
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: Math.min(totalPaginas, 4) }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setPaginaActiva(page)}
                  className={`h-10 min-w-[38px] rounded-full text-sm font-semibold transition ${
                    paginaActiva === page
                      ? "bg-[#E7D6FF] text-[#221E3A]"
                      : "bg-transparent text-[#C9B8E8] hover:bg-[#413E74]"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPaginaActiva((current) => Math.min(totalPaginas, current + 1))}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#2D294D] text-[#E7D6FF] transition hover:bg-[#413E74]"
                disabled={paginaActiva === totalPaginas}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
