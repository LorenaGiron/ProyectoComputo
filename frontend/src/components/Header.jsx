import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";

export default function Header() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem("theme");
      return savedTheme !== "light";
    }
    return true;
  });
  
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  
  const buscadorRef = useRef(null);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  useEffect(() => {
    if (query.trim().length < 2) {
      setResultados(null);
      setMostrarModal(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setBuscando(true);
      setMostrarModal(true);

      try {
        const response = await api.get(`/search?q=${encodeURIComponent(query.trim())}`);
        setResultados(response.data || response); 
      } catch (error) {
        console.error("Error en la búsqueda global:", error);
        setResultados(null);
      } finally {
        setBuscando(false);
      }

    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  useEffect(() => {
    const handleClickFuera = (event) => {
      if (buscadorRef.current && !buscadorRef.current.contains(event.target)) {
        setMostrarModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  const obtenerConfiguracionRenglon = (tipo, item) => {
    switch (tipo) {
      case "productos": return { titulo: item.nombre, sub: `SKU: ${item.sku || 'N/A'} | ${item.marca || ''}`, ruta: "/productos", tag: "Productos", icon: "bi-box-seam text-blue-500 dark:text-azul" };
      case "clientes": return { titulo: item.nombre, sub: item.email || item.rfc || '', ruta: "/clientes", tag: "Clientes", icon: "bi-people text-pink-500 dark:text-rosa" };
      case "proveedores": return { titulo: item.nombre, sub: item.contacto || item.giro || '', ruta: "/proveedores", tag: "Proveedores", icon: "bi-truck text-orange-500 dark:text-naranja" };
      case "usuarios": return { titulo: `${item.nombre} ${item.apellido || ''}`, sub: `@${item.usuario} | ${item.email || ''}`, ruta: "/usuarios", tag: "Usuarios", icon: "bi-person-badge text-green-500 dark:text-verde" };
      case "recepciones": return { titulo: `Recepción de: ${item.proveedor}`, sub: item.comentarios || 'Sin comentarios', ruta: "/recepciones", tag: "Recepciones", icon: "bi-file-earmark-arrow-down text-purple-500 dark:text-lila-mid" };
      case "auditoria": return { titulo: `Acción: ${item.action}`, sub: `${item.usuario || 'Sistema'} — ${item.details || ''}`, ruta: "/auditoria", tag: "Auditoría", icon: "bi-shield-check text-red-500 dark:text-error-text" };
      case "inventario": return { titulo: `Movimiento: ${item.tipo}`, sub: `${item.productNombre || ''} (${item.motivo || ''})`, ruta: "/dashboard", tag: "Inventario", icon: "bi-arrow-left-right text-yellow-600 dark:text-yellow-500" };
      case "permisos": return { titulo: item.nombre, sub: `Módulo: ${item.modulo || ''}`, ruta: "/usuarios", tag: "Permisos", icon: "bi-key text-cyan-600 dark:text-cyan-400" };
      case "roles": return { titulo: `Rol: ${item.nombre}`, sub: 'Configuración de seguridad', ruta: "/usuarios", tag: "Roles", icon: "bi-shield-lock text-purple-600 dark:text-purple-400" };
      default: return { titulo: "Registro", sub: "", ruta: "/dashboard", tag: "Sistema", icon: "bi-gear text-gris" };
    }
  };

  const listaResultadosPlana = [];
  if (resultados) {
    Object.keys(resultados).forEach((categoria) => {
      if (Array.isArray(resultados[categoria])) {
        resultados[categoria].forEach((item) => {
          listaResultadosPlana.push({ ...item, _categoriaBackend: categoria });
        });
      }
    });
  }

  return (
    <header className="flex flex-col md:flex-row justify-between items-center gap-4 w-full px-4 sm:px-6 lg:px-8 py-4 z-50 transition-colors duration-300 bg-lila border-b border-oscuro/10 dark:bg-oscuro dark:border-lila-soft/10">
      
      {/* Buscador */}
      <div ref={buscadorRef} className="relative w-full flex-1 md:max-w-lg lg:max-w-xl xl:max-w-2xl z-50">
        <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-sm text-oscuro/50 dark:text-lila-soft"></i>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setMostrarModal(true)}
          placeholder="Buscar en todo el sitio" 
          className="w-full rounded-full pl-10 pr-4 py-2.5 text-sm outline-none transition-all shadow-sm bg-blanco border border-blanco/50 text-oscuro placeholder:text-oscuro/50 focus:ring-2 focus:ring-oscuro/20 dark:bg-bg-card dark:text-lila dark:border-lila/20 dark:focus:ring-1 dark:focus:ring-lila dark:hover:border-lila dark:placeholder-lila/30"
        />

        {mostrarModal && (
          <div className="absolute top-full left-0 right-0 mt-2 rounded-xl shadow-xl overflow-hidden animate-fade-in flex flex-col max-h-[45vh] bg-blanco border border-oscuro/10 dark:bg-bg-card dark:border-lila/20 dark:shadow-2xl">
            
            <div className="overflow-y-auto p-2 flex-1 custom-scrollbar">
              {buscando ? (
                <div className="p-8 text-center flex flex-col items-center justify-center gap-2 text-gris dark:text-lila-soft">
                  <i className="bi bi-arrow-repeat animate-spin text-2xl text-lila-mid"></i>
                  <span className="text-sm">Buscando coincidencias...</span>
                </div>
              ) : listaResultadosPlana.length > 0 ? (
                <div className="space-y-1">
                  <p className="px-3 py-1 text-[11px] font-bold tracking-wider uppercase text-gris dark:text-lila-soft/60">Coincidencias encontradas</p>
                  
                  {listaResultadosPlana.map((item, index) => {
                    const config = obtenerConfiguracionRenglon(item._categoriaBackend, item);
                    
                    return (
                      <div 
                        key={`${item._categoriaBackend}-${item.id}-${index}`}
                        onClick={() => {
                          setMostrarModal(false);
                          navigate(config.ruta);
                        }}
                        className="px-3 py-2.5 rounded-lg cursor-pointer transition-all flex justify-between items-center group gap-4 hover:bg-bg dark:hover:bg-lila/10"
                      >
                        {/* Izquierda: Icono + Textos */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 rounded-lg flex items-center justify-center bg-bg border border-oscuro/5 dark:bg-oscuro/40 dark:border-lila/5">
                            <i className={`bi ${config.icon} text-base`}></i>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium truncate text-oscuro group-hover:text-lila-mid dark:text-blanco dark:group-hover:text-lila">
                              {config.titulo}
                            </span>
                            <span className="text-xs truncate text-gris dark:text-text-muted">
                              {config.sub}
                            </span>
                          </div>
                        </div>

                        {/* Derecha: Indicador de página */}
                        <div className="shrink-0">
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md transition-colors bg-blanco border border-gris/20 text-gris group-hover:border-lila-mid/50 group-hover:text-lila-mid group-hover:bg-bg dark:bg-oscuro dark:border-lila/10 dark:text-lila-soft dark:group-hover:border-lila dark:group-hover:text-blanco">
                            <i className="bi bi-box-arrow-in-right mr-1 opacity-70"></i>
                            {config.tag}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center text-sm italic text-gris dark:text-lila-soft">
                  No se encontraron coincidencias para "{query}".
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Acciones del Usuario (Derecha) */}
      <div className="flex items-center gap-4 sm:gap-5 w-full md:w-auto justify-end">
        
        {/* Notificaciones  */}
        <div className="relative cursor-pointer group" title="Notificaciones">
          <div className="relative w-6 h-6 flex items-center justify-center">
            {/* Ícono Contorno  */}
            <i className="bi bi-bell text-xl transition-all duration-300 opacity-100 group-hover:opacity-0 group-hover:scale-110 text-oscuro dark:text-lila"></i>
            
            {/* Ícono Relleno */}
            <i className="bi bi-bell-fill text-xl absolute inset-0 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:scale-110 text-oscuro dark:text-lila"></i>
          </div>
        </div>

        {/* Usuario  */}
        <div className="flex items-center gap-3 px-4 py-1.5 rounded-full transition-colors cursor-pointer shadow-sm bg-blanco border border-oscuro/10 hover:border-oscuro/30 dark:bg-bg-card dark:border-lila-soft/20 dark:hover:border-lila-mid">
          <i className="bi bi-person-circle text-2xl text-oscuro dark:text-lila-mid"></i>
          <div className="text-left leading-tight hidden sm:block">
            <p className="m-0 font-semibold text-sm text-oscuro dark:text-blanco">{usuario?.nombre || "Usuario"}</p>
            <p className="m-0 text-xs opacity-80 uppercase tracking-wider text-oscuro/70 dark:text-lila-soft">{usuario?.role || "Invitado"}</p>
          </div>
          <i className="bi bi-chevron-down text-xs ml-1 text-oscuro/50 dark:text-lila-soft"></i>
        </div>

        {/* Botón cambio de Tema */}
        <button 
          onClick={toggleTheme}
          className="relative group flex items-center justify-center w-10 h-10 rounded-full transition-colors cursor-pointer shadow-sm active:scale-95 bg-blanco text-oscuro border border-oscuro/10 hover:bg-oscuro hover:text-lila dark:bg-bg-card dark:text-lila dark:border-lila/20 dark:hover:bg-lila dark:hover:text-oscuro"
          title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          {isDark ? (
            <i className="bi bi-sun-fill text-lg"></i>
          ) : (
            <i className="bi bi-moon-stars-fill text-lg"></i>
          )}
        </button>
      </div>
    </header>
  );
}