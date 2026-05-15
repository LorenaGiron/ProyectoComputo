import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, ClipboardList, Users, Truck, UserCog, ShieldCheck, LogOut, ChevronLeft, ChevronRight } from "lucide-react";

const navItems = [
  {
    section: "GENERAL",
    items: [
      { label: "Dashboard",   ruta: "/dashboard",   icon: LayoutDashboard },
      { label: "Productos",   ruta: "/productos",   icon: Package         },
    ],
  },
  {
    section: "GESTIÓN",
    items: [
      { label: "Recepciones", ruta: "/recepciones", icon: ClipboardList   },
      { label: "Clientes",    ruta: "/clientes",    icon: Users           },
      { label: "Proveedores", ruta: "/proveedores", icon: Truck           },
      { label: "Usuarios",    ruta: "/usuarios",    icon: UserCog         },
    ],
  },
  {
    section: "CONTROL",
    items: [
      { label: "Auditoría",   ruta: "/auditoria",   icon: ShieldCheck     },
    ],
  },
];

export default function Sidebar() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true"
  );

  return (
    <aside
      className="relative flex flex-col h-screen shrink-0 overflow-hidden border-r border-white/5 transition-all duration-300"
      style={{ background: "#221E3A", width: collapsed ? "72px" : "260px" }}
    >
      {/* Glow decorativo */}
      <div className="absolute top-[-120px] left-[-100px] w-[250px] h-[250px] bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />

      {/* Botón toggle */}
      <button
        onClick={() => setCollapsed((c) => {
          localStorage.setItem("sidebar-collapsed", String(!c));
          return !c;
        })}
        className="absolute top-4 right-3 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
        style={{ backgroundColor: "rgba(166,141,200,0.15)", color: "#E7D6FF" }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(166,141,200,0.3)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(166,141,200,0.15)")}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Header */}
      <div className={`shrink-0 text-center overflow-hidden transition-all duration-300 ${collapsed ? "px-2 pt-8 pb-4" : "px-8 pt-8 pb-10"}`}>
        {collapsed ? (
          <div className="flex justify-center mt-8">
            <div className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
          </div>
        ) : (
          <>
            <h1
              className="text-[#E7D6FF] text-6xl tracking-tight leading-none drop-shadow-[0_0_12px_rgba(231,214,255,0.15)]"
              style={{ fontFamily: "'Cinzel Decorative', serif" }}
            >
              AURA
            </h1>

            <div className="relative mt-7 flex items-center justify-center">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-[#A78BFA]/50 to-transparent" />
              <div className="absolute w-2.5 h-2.5 rounded-full bg-[#C4B5FD] shadow-[0_0_15px_4px_rgba(196,181,253,0.6)]" />
            </div>

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
          </>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 overflow-y-auto">
        {navItems.map((group) => (
          <div key={group.section} className="mb-6">
            {collapsed
              ? <div className="mb-2 h-px bg-white/5" />
              : (
                <h2
                  className="px-4 mb-4 text-[12px] tracking-[4px] text-[#B9A7F5]/60 font-medium"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {group.section}
                </h2>
              )
            }

            <div className="flex flex-col gap-2">
              {group.items.map(({ label, ruta, icon: Icon }) => {
                const isActive = location.pathname === ruta;

                return (
                  <button
                    key={label}
                    onClick={() => navigate(ruta)}
                    title={collapsed ? label : undefined}
                    className={`group relative flex items-center w-full h-[50px] rounded-2xl transition-all duration-300 overflow-hidden ${
                      collapsed ? "justify-center px-0" : "gap-4 px-5"
                    } ${
                      isActive
                        ? "bg-[#31275E] shadow-[0_0_20px_rgba(139,92,246,0.18)]"
                        : "hover:bg-white/[0.04]"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[5px] h-[70%] rounded-r-full bg-[#BFA7FF] shadow-[0_0_15px_rgba(191,167,255,0.9)]" />
                    )}

                    <div className="transition-all duration-300 group-hover:scale-110">
                      <Icon
                        size={22}
                        strokeWidth={isActive ? 2.4 : 2}
                        color={isActive ? "#FFFFFF" : "#E7D6FF"}
                      />
                    </div>

                    {!collapsed && (
                      <span
                        className={`text-[17px] transition-all duration-300 group-hover:translate-x-1 ${
                          isActive ? "text-white font-semibold" : "text-[#E7D6FF]/80 font-medium"
                        }`}
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                      >
                        {label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 p-3 border-t border-white/5 bg-black/10 backdrop-blur-sm">
        <button
          onClick={() => navigate("/login")}
          title={collapsed ? "Logout" : undefined}
          className={`group flex items-center justify-center w-full py-3 rounded-2xl bg-[#E7D6FF] text-[#221E3A] font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(231,214,255,0.25)] ${
            collapsed ? "" : "gap-3 text-lg"
          }`}
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          <LogOut
            size={21}
            strokeWidth={2.5}
            className="transition-transform duration-300 group-hover:-translate-x-1"
          />
          {!collapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
}
