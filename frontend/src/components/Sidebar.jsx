import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  {
    label: "Dashboard",
    ruta: "/dashboard",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    label: "Productos",
    ruta: "/productos",
    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  },
  {
    label: "Recepciones",
    ruta: "/recepciones",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  },
  {
    label: "Clientes",
    ruta: "/clientes",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  },
  {
    label: "Proveedores",
    ruta: "/proveedores",
    icon: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z",
  },
  {
    label: "Usuarios",
    ruta: "/usuarios",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  },
  {
    label: "Auditoría",
    ruta: "/auditoria",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside
      className="flex flex-col min-h-screen w-[237px] shrink-0 pb-10 shadow-2xl"
      style={{ background: "#221E3A" }}
    >
      {/* Logo */}
      <div className="flex items-center h-[70px] ml-8 mt-3 mb-12">
        <span
          className="text-[#E7D6FF] text-6xl tracking-tight"
          style={{ fontFamily: "'Cinzel Decorative', serif" }}
        >
          AURA
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col flex-1">
        {navItems.map(({ label, ruta, icon }) => {
          const isActive = location.pathname === ruta;
          return (
            <div key={label} className="relative">
              {isActive && (
                <div
                  className="absolute top-0 right-0 h-[60px] rounded-tl-lg rounded-bl-lg"
                  style={{
                    left: "29px",
                    background: "#2C2A4A",
                    pointerEvents: "none",
                  }}
                />
              )}
              <button
                onClick={() => navigate(ruta)}
                className={`relative flex items-center gap-3 w-full h-[60px] pl-10 pr-6 border-none bg-transparent cursor-pointer text-left text-[#E7D6FF] text-lg font-bold transition-opacity duration-150 hover:opacity-90 ${
                  isActive ? "opacity-100" : "opacity-55"
                }`}
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#E7D6FF"
                  strokeWidth={isActive ? 2.2 : 1.8}
                  className="shrink-0"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                </svg>
                {label}
              </button>
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-6 mt-2">
        <button
          onClick={() => navigate("/login")}
          className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-xl font-bold text-[17px] cursor-pointer transition-opacity duration-150 hover:opacity-100 opacity-85"
          style={{
            fontFamily: "'Poppins', sans-serif",
            background: "#E7D6FF",
            color: "#221E3A",
            border: "2px solid #E7D6FF",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#221E3A"
            strokeWidth="2.2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}
