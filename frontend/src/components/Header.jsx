import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import { fetchNotifications } from "../services/notifications.service";

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
  const [notifs, setNotifs] = useState([]);
  const [totalNotifs, setTotalNotifs] = useState(0);
  const [mostrarNotifs, setMostrarNotifs] = useState(false);
  
  const buscadorRef = useRef(null);
  const notifsRef = useRef(null);

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

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await fetchNotifications()
        setNotifs(data.items   ?? [])
        setTotalNotifs(data.total ?? 0)
      } catch { /* silencioso */ }
    }
    cargar()
    //const intervalo = setInterval(cargar, 90_000) // refresca 
    //return () => clearInterval(intervalo)
  }, [])

  useEffect(() => {
    const handleClickFuera = (e) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target)) {
        setMostrarNotifs(false)
      }
    }
    document.addEventListener("mousedown", handleClickFuera)
    return () => document.removeEventListener("mousedown", handleClickFuera)
  }, [])

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
    <header className="flex flex-col md:flex-row justify-between items-center gap-4 w-full px-4 sm:px-6 lg:px-8 py-4 z-50 transition-colors duration-300 bg-blanco border-b border-lila dark:bg-oscuro dark:border-lila-soft/10">
      
      {/* Buscador */}
      <div ref={buscadorRef} className="relative w-full flex-1 md:max-w-lg lg:max-w-xl xl:max-w-2xl z-50">
        <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-sm text-morado dark:text-lila-soft"></i>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setMostrarModal(true)}
          placeholder="Buscar en todo el sitio" 
          className="w-full rounded-full pl-10 pr-4 py-2.5 text-sm outline-none transition-all shadow-sm bg-lila/30 border border-lila text-oscuro placeholder:text-morado focus:ring-2 focus:ring-lila-mid/40 dark:bg-bg-card dark:text-lila dark:border-lila/20 dark:focus:ring-1 dark:focus:ring-lila dark:hover:border-lila dark:placeholder-lila/30"
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
                        className="px-3 py-2.5 rounded-lg cursor-pointer transition-all flex justify-between items-center group gap-4 hover:bg-lila/30 dark:hover:bg-lila/10"
                      >
                        {/* Izquierda: Icono + Textos */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 rounded-lg flex items-center justify-center bg-bg/30 border border-oscuro/5 dark:bg-oscuro/40 dark:border-lila/5">
                            <i className={`bi ${config.icon} text-base`}></i>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium truncate text-oscuro group-hover:text-morado dark:text-blanco dark:group-hover:text-lila">
                              {config.titulo}
                            </span>
                            <span className="text-xs truncate text-gris dark:text-text-muted">
                              {config.sub}
                            </span>
                          </div>
                        </div>

                        {/* Derecha: Indicador de página */}
                        <div className="shrink-0">
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md transition-colors bg-blanco border border-lila-mid text-lila-mid group-hover:border-morado group-hover:text-lila-morado group-hover:bg-lila/50 dark:bg-oscuro dark:border-lila/10 dark:text-lila-soft dark:group-hover:border-lila dark:group-hover:text-blanco">
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
        
        {/* Notificaciones */}
        <div ref={notifsRef} className="relative">
          <div 
            onClick={() => setMostrarNotifs((v) => !v)}
            className="relative cursor-pointer group" 
            title="Notificaciones"
          >
            <div className="relative w-6 h-6 flex items-center justify-center">
              {/* Ícono Contorno */}
              <i className="bi bi-bell text-xl transition-all duration-300 opacity-100 group-hover:opacity-0 group-hover:scale-110 text-lila-mid hover:text-morado dark:text-lila dark:hover:text-lila-soft"></i>
              
              {/* Ícono Relleno */}
              <i className="bi bi-bell-fill text-xl absolute inset-0 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:scale-110 text-morado dark:text-lila"></i>
              
              {/* Punto/Contador de notificación dinámico */}
              {totalNotifs > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-4.5 h-4.5 px-1 rounded-full bg-rojo text-blanco text-[10px] font-bold flex items-center justify-center leading-none shadow-sm z-10 group-hover:scale-110 transition-transform">
                  {totalNotifs > 99 ? "99+" : totalNotifs}
                </span>
              )}
            </div>
          </div>

          {/* Dropdown de Notificaciones (Bordes ajustados al tema lila) */}
          {mostrarNotifs && (
            <div className="absolute right-0 top-full mt-3 w-80 bg-blanco border border-lila/30 rounded-xl shadow-xl z-50 overflow-hidden dark:bg-bg-card dark:border-lila/20 dark:shadow-2xl">
              
              {/* Header del dropdown */}
              <div className="px-4 py-3 border-b border-lila/20 flex items-center justify-between dark:border-lila/10">
                <p className="text-sm font-bold text-oscuro m-0 dark:text-blanco">Notificaciones</p>
                {totalNotifs > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-lila/30 text-morado font-semibold dark:bg-lila/20 dark:text-lila">
                    {totalNotifs}
                  </span>
                )}
              </div>

              {/* Lista */}
              <div className="max-h-80 overflow-y-auto custom-scrollbar">
                {notifs.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-gris opacity-60 dark:text-lila-soft">
                    <i className="bi bi-check-circle text-2xl block mb-2" />
                    Todo en orden
                  </div>
                ) : (
                  notifs.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => { navigate(n.ruta); setMostrarNotifs(false); }}
                      className="px-4 py-3 border-b border-lila/10 hover:bg-lila/10 cursor-pointer transition-colors flex items-start gap-3 dark:border-lila/5 dark:hover:bg-lila/10"
                    >
                      <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 
                        ${n.nivel === 'critico'    ? 'bg-rojo/10 text-rojo dark:bg-red-500/20 dark:text-red-400'    :
                          n.nivel === 'advertencia' ? 'bg-amarillo/10 text-amarillo dark:bg-yellow-500/20 dark:text-yellow-400' :
                                                      'bg-lila/30 text-morado dark:bg-lila/20 dark:text-lila-mid'}`}>
                        <i className={`bi ${n.icon} text-sm`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-oscuro m-0 truncate dark:text-blanco">{n.titulo}</p>
                        <p className="text-xs text-gris m-0 mt-0.5 truncate dark:text-lila-soft">{n.mensaje}</p>
                      </div>
                      <i className="bi bi-arrow-right text-xs text-lila-mid shrink-0 mt-1 dark:text-lila-soft" />
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifs.length > 0 && (
                <div className="px-4 py-2 border-t border-lila/20 text-center dark:border-lila/10">
                  <p className="text-xs text-gris m-0 dark:text-lila-soft">
                    Haz clic en cada aviso para ir a resolverlo
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Perfil del Usuario */}
        <div className="flex items-center gap-3 px-4 py-1.5 rounded-full transition-all duration-300 cursor-pointer shadow-sm group bg-lila/30 border border-lila hover:bg-lila hover:border-morado dark:bg-bg-card dark:border-lila-soft/20 dark:hover:bg-lila/10 dark:hover:border-lila-mid">
          <i className="bi bi-person-circle text-2xl text-morado group-hover:text-blanco transition-colors dark:text-lila-mid dark:group-hover:text-lila"></i>
          <div className="text-left leading-tight hidden sm:block transition-colors">
            <p className="m-0 font-semibold text-sm text-morado group-hover:text-blanco dark:text-blanco">{usuario?.nombre || "Usuario"}</p>
            <p className="m-0 text-xs opacity-80 uppercase tracking-wider text-lila-mid group-hover:text-lila/80 dark:text-lila-soft">{usuario?.role || "Invitado"}</p>
          </div>
          <i className="bi bi-chevron-down text-xs ml-1 text-lila-mid group-hover:text-blanco transition-colors dark:text-lila-soft"></i>
        </div>

        {/* Botón cambio de Tema */}
        <button 
          onClick={toggleTheme}
          className="relative group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 cursor-pointer shadow-sm active:scale-95 bg-blanco text-lila-mid border border-lila hover:bg-morado hover:text-blanco hover:border-morado dark:bg-bg-card dark:text-lila dark:border-lila/20 dark:hover:bg-lila dark:hover:text-oscuro"
          title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          {isDark ? (
            <i className="bi bi-sun-fill text-lg transition-transform group-hover:rotate-90"></i>
          ) : (
            <i className="bi bi-moon-stars-fill text-lg transition-transform group-hover:-rotate-12"></i>
          )}
        </button>
      </div>
    </header>
  );
}