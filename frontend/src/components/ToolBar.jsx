import { useState, useEffect, useRef } from "react";

export default function ToolBar({
  filtro,
  setFiltro,
  opcionesFiltro, 
  busqueda,
  setBusqueda,
  placeholderBuscar = "Buscar...",
  textoBoton = "+ Nuevo",
  accionBoton
}) {
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtroActual = opcionesFiltro.find(opt => opt.value === filtro)?.label || "Filtrar por";

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-5 w-full">
      <div className="flex flex-col sm:flex-row gap-4 w-full lg:flex-1">
        
         {/* Filtro */}
        <div className="relative w-full sm:w-40" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="bg-bg-card text-lila border border-lila/20 rounded-lg px-4 py-2.5 text-sm cursor-pointer outline-none hover:border-lila transition-colors shadow-sm flex items-center justify-between w-full h-full"
          >
            <span className="font-medium">{filtroActual}</span>
            <i className={`bi bi-chevron-down text-xs transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}></i>
          </button>

          {isDropdownOpen && (
            <ul className="absolute top-full left-0 mt-2 w-full bg-bg-card border border-lila/20 rounded-lg shadow-xl z-50 overflow-hidden py-1">
              {opcionesFiltro.map((opcion, i) => (
                <li
                  key={i}
                  onClick={() => { setFiltro(opcion.value); setIsDropdownOpen(false); }}
                  className="px-4 py-2.5 text-sm text-lila hover:bg-lila hover:text-oscuro cursor-pointer transition-colors"
                >
                  {opcion.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Buscador */}
        <input
          type="text"
          placeholder={placeholderBuscar}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="bg-bg-card text-lila border border-lila/20 rounded-lg px-4 py-2.5 text-sm w-full sm:w-80 lg:w-96 outline-none hover:border-lila focus:ring-1 focus:ring-lila transition-all shadow-sm placeholder-lila/30"
        />
      </div>

      {/* Botón */}
      {textoBoton && accionBoton && (
        <button 
          onClick={accionBoton}
          className="bg-lila text-oscuro border-none rounded-lg px-6 py-2.5 font-bold text-sm cursor-pointer hover:bg-lila-soft hover:scale-102 transition-all active:scale-95 w-full lg:w-auto"
        >
          {textoBoton}
        </button>
      )}
    </div>
  );
}