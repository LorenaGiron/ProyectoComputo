import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";

export default function Header() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  
  const buscadorRef = useRef(null);

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
      case "productos":
        return { titulo: item.nombre, sub: `SKU: ${item.sku || 'N/A'} | ${item.marca || ''}`, ruta: "/productos", tag: "Productos", icon: "bi-box-seam text-azul" };
      case "clientes":
        return { titulo: item.nombre, sub: item.email || item.rfc || '', ruta: "/clientes", tag: "Clientes", icon: "bi-people text-rosa" };
      case "proveedores":
        return { titulo: item.nombre, sub: item.contacto || item.giro || '', ruta: "/proveedores", tag: "Proveedores", icon: "bi-truck text-naranja" };
      case "usuarios":
        return { titulo: `${item.nombre} ${item.apellido || ''}`, sub: `@${item.usuario} | ${item.email || ''}`, ruta: "/usuarios", tag: "Usuarios", icon: "bi-person-badge text-verde" };
      case "recepciones":
        return { titulo: `Recepción de: ${item.proveedor}`, sub: item.comentarios || 'Sin comentarios', ruta: "/recepciones", tag: "Recepciones", icon: "bi-file-earmark-arrow-down text-lila-mid" };
      case "auditoria":
        return { titulo: `Acción: ${item.action}`, sub: `${item.usuario || 'Sistema'} — ${item.details || ''}`, ruta: "/auditoria", tag: "Auditoría", icon: "bi-shield-check text-error-text" };
      case "inventario":
        return { titulo: `Movimiento: ${item.tipo}`, sub: `${item.productNombre || ''} (${item.motivo || ''})`, ruta: "/dashboard", tag: "Inventario", icon: "bi-arrow-left-right text-yellow-500" };
      case "permisos":
        return { titulo: item.nombre, sub: `Módulo: ${item.modulo || ''}`, ruta: "/usuarios", tag: "Permisos", icon: "bi-key text-cyan-400" };
      case "roles":
        return { titulo: `Rol: ${item.nombre}`, sub: 'Configuración de seguridad', ruta: "/usuarios", tag: "Roles", icon: "bi-shield-lock text-purple-400" };
      default:
        return { titulo: "Registro", sub: "", ruta: "/dashboard", tag: "Sistema", icon: "bi-gear" };
    }
  };

  const listaResultadosPlana = [];
  if (resultados) {
    Object.keys(resultados).forEach((categoria) => {
      if (Array.isArray(resultados[categoria])) {
        resultados[categoria].forEach((item) => {
          listaResultadosPlana.push({
            ...item,
            _categoriaBackend: categoria
          });
        });
      }
    });
  }

  return (
    <header className="flex flex-col md:flex-row justify-between items-center gap-4 w-full px-4 sm:px-6 lg:px-8 py-4 border-b border-lila-soft/10 bg-oscuro z-50 shadow-sm">
      
      {/* Buscador */}
      <div ref={buscadorRef} className="relative w-full flex-1 md:max-w-lg lg:max-w-xl xl:max-w-2xl z-50">
        <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-lila-soft text-sm"></i>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setMostrarModal(true)}
          placeholder="Buscar en todo el sitio" 
          className="w-full bg-bg-card text-lila border border-lila/20 rounded-full pl-10 pr-4 py-2.5 text-sm outline-none hover:border-lila focus:ring-1 focus:ring-lila transition-all placeholder-lila/30 shadow-sm"
        />

        {/* Resultados */}
        {mostrarModal && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-bg-card border border-lila/20 rounded-xl shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[45vh]">
            
            <div className="overflow-y-auto p-2 flex-1 custom-scrollbar">
              {buscando ? (
                <div className="p-8 text-center text-lila-soft flex flex-col items-center justify-center gap-2">
                  <i className="bi bi-arrow-repeat animate-spin text-2xl text-lila"></i>
                  <span className="text-sm">Buscando coincidencias...</span>
                </div>
              ) : listaResultadosPlana.length > 0 ? (
                <div className="space-y-1">
                  <p className="px-3 py-1 text-[11px] font-bold tracking-wider text-lila-soft/60 uppercase">Coincidencias encontradas</p>
                  
                  {listaResultadosPlana.map((item, index) => {
                    const config = obtenerConfiguracionRenglon(item._categoriaBackend, item);
                    
                    return (
                      <div 
                        key={`${item._categoriaBackend}-${item.id}-${index}`}
                        onClick={() => {
                          setMostrarModal(false);
                          navigate(config.ruta);
                        }}
                        className="px-3 py-2.5 hover:bg-lila/10 rounded-lg cursor-pointer transition-all flex justify-between items-center group gap-4"
                      >
                        {/* Izquierda: Icono + Textos */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="bg-oscuro/40 p-2 rounded-lg border border-lila/5 flex items-center justify-center">
                            <i className={`bi ${config.icon} text-base`}></i>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm text-blanco group-hover:text-lila font-medium truncate">
                              {config.titulo}
                            </span>
                            <span className="text-xs text-text-muted truncate">
                              {config.sub}
                            </span>
                          </div>
                        </div>

                        {/* Derecha: Indicador de página */}
                        <div className="shrink-0">
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 bg-oscuro border border-lila/10 rounded-md text-lila-soft group-hover:border-lila group-hover:text-blanco transition-colors shadow-sm">
                            <i className="bi bi-box-arrow-in-right mr-1 opacity-70"></i>
                            {config.tag}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center text-sm text-lila-soft italic">
                  No se encontraron coincidencias para "{query}".
                </div>
              )}
            </div>
            
          </div>
        )}
      </div>

      {/* Acciones del Usuario (Derecha) */}
      <div className="flex items-center gap-4 sm:gap-5 w-full md:w-auto justify-end">
        <div className="relative cursor-pointer hover:scale-110 transition-transform" title="Notificaciones">
          <i className="bi bi-bell text-xl text-lila"></i>
        </div>

        <div className="flex items-center gap-3 bg-bg-card px-4 py-1.5 rounded-full border border-lila-soft/20 hover:border-lila-mid transition-colors cursor-pointer shadow-sm">
          <i className="bi bi-person-circle text-2xl text-lila-mid"></i>
          <div className="text-left leading-tight hidden sm:block">
            <p className="m-0 font-semibold text-sm text-blanco">{usuario?.nombre || "Usuario"}</p>
            <p className="m-0 text-xs opacity-80 uppercase tracking-wider text-lila-soft">{usuario?.role || "Invitado"}</p>
          </div>
          <i className="bi bi-chevron-down text-xs text-lila-soft ml-1"></i>
        </div>

        <button className="relative group flex items-center justify-center bg-bg-card text-lila border border-lila/20 w-10 h-10 rounded-full hover:bg-lila hover:text-oscuro transition-colors cursor-pointer shadow-sm active:scale-95">
          <i className="bi bi-sun-fill text-lg"></i>
        </button>
      </div>
    </header>
  );
}