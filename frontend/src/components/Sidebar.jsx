import { useNavigate, useLocation } from "react-router-dom";

import { LayoutDashboard, Package, ClipboardList, Users, Truck, UserCog, ShieldCheck, LogOut } from "lucide-react";

const navItems = [
  {
    section: "GENERAL",
    items: [
      {
        label: "Dashboard",
        ruta: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Productos",
        ruta: "/productos",
        icon: Package,
      },
    ],
  },
  {
    section: "GESTIÓN",
    items: [
      {
        label: "Recepciones",
        ruta: "/recepciones",
        icon: ClipboardList,
      },
      {
        label: "Clientes",
        ruta: "/clientes",
        icon: Users,
      },
      {
        label: "Proveedores",
        ruta: "/proveedores",
        icon: Truck,
      },
      {
        label: "Usuarios",
        ruta: "/usuarios",
        icon: UserCog,
      },
    ],
  },
  {
    section: "CONTROL",
    items: [
      {
        label: "Auditoría",
        ruta: "/auditoria",
        icon: ShieldCheck,
      },
    ],
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside
      className="relative flex flex-col h-screen w-[260px] shrink-0 overflow-hidden border-r border-white/5"
      style={{ background: "#221E3A" }}
    >
      {/* Glow decorativo */}
      <div className="absolute top-[-120px] left-[-100px] w-[250px] h-[250px] bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />

      {/* Header */}
      <div className="px-8 pt-8 pb-10 shrink-0 text-center">
        {/* Logo */}
        <h1
          className="text-[#E7D6FF] text-6xl tracking-tight leading-none drop-shadow-[0_0_12px_rgba(231,214,255,0.15)]"
          style={{ fontFamily: "'Cinzel Decorative', serif" }}
        >
          AURA
        </h1>

        {/* Línea decorativa */}
        <div className="relative mt-7 flex items-center justify-center">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#A78BFA]/50 to-transparent" />

          <div className="absolute w-2.5 h-2.5 rounded-full bg-[#C4B5FD] shadow-[0_0_15px_4px_rgba(196,181,253,0.6)]" />
        </div>

        {/* Badge */}
        {/* Badge */}
        <div className="mt-7 flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-[#C4B5FD]/20 bg-white/[0.03] backdrop-blur-sm">
            
            <div className="w-2 h-2 rounded-full bg-green-400" />

            <span
              className="text-[#D8C8FF] text-sm tracking-[2px] font-medium"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              ONLINE
            </span>

          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 overflow-y-auto">
        {navItems.map((group) => (
          <div key={group.section} className="mb-8">
            {/* Section title */}
            <h2
              className="px-4 mb-4 text-[12px] tracking-[4px] text-[#B9A7F5]/60 font-medium"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              {group.section}
            </h2>

            <div className="flex flex-col gap-2">
              {group.items.map(({ label, ruta, icon: Icon }) => {
                const isActive = location.pathname === ruta;

                return (
                  <button
                    key={label}
                    onClick={() => navigate(ruta)}
                    className={`group relative flex items-center gap-4 w-full h-[58px] px-5 rounded-2xl transition-all duration-300 overflow-hidden ${
                      isActive
                        ? "bg-[#31275E] shadow-[0_0_20px_rgba(139,92,246,0.18)]"
                        : "hover:bg-white/[0.04]"
                    }`}
                  >
                    {/* Barra activa */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[5px] h-[70%] rounded-r-full bg-[#BFA7FF] shadow-[0_0_15px_rgba(191,167,255,0.9)]" />
                    )}

                    {/* Icon */}
                    <div className="transition-all duration-300 group-hover:translate-x-1">
                      <Icon
                        size={22}
                        strokeWidth={isActive ? 2.4 : 2}
                        color={isActive ? "#FFFFFF" : "#E7D6FF"}
                      />
                    </div>

                    {/* Text */}
                    <span
                      className={`text-[17px] transition-all duration-300 group-hover:translate-x-1 ${
                        isActive
                          ? "text-white font-semibold"
                          : "text-[#E7D6FF]/80 font-medium"
                      }`}
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 p-5 border-t border-white/5 bg-black/10 backdrop-blur-sm">
        <button
          onClick={() => navigate("/login")}
          className="group flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-[#E7D6FF] text-[#221E3A] font-semibold text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(231,214,255,0.25)]"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          <LogOut
            size={21}
            strokeWidth={2.5}
            className="transition-transform duration-300 group-hover:-translate-x-1"
          />

          Logout
        </button>
      </div>
    </aside>
  );
}