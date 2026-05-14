import { useState, useRef, useEffect } from "react";

export default function Input({ 
  label, 
  tipo = "text", 
  name, 
  value, 
  onChange, 
  placeholder = "", 
  opciones = [], 
  requerido = false,
  deshabilitado = false, 
  className = ""
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

  const baseClasses = `w-full bg-bg-card border border-lila/20 rounded-lg px-4 py-2.5 text-blanco text-sm focus:outline-none focus:border-lila transition-all placeholder-lila-soft/50 ${deshabilitado ? 'opacity-60 cursor-not-allowed bg-oscuro' : ''}`;

  const handleNumberChange = (incremento) => {
    if (deshabilitado) return;
    const actual = parseFloat(value) || 0;
    const nuevo = actual + incremento;
    if(onChange) {
      onChange({ target: { name, value: nuevo >= 0 ? nuevo : 0 } });
    }
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-[11px] font-bold text-lila-mid uppercase tracking-wider pl-1">
          {label} {requerido && !deshabilitado && <span className="text-rojo">*</span>}
        </label>
      )}

      {tipo === "textarea" ? (
        <textarea
          name={name} value={value} onChange={onChange} placeholder={placeholder}
          required={requerido} disabled={deshabilitado} rows="3"
          className={`${baseClasses} resize-none`}
        />
      ) : tipo === "select" ? (
        
        <div className="relative w-full" ref={dropdownRef}>
          <button
            type="button"
            disabled={deshabilitado}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`bg-bg-card text-lila border border-lila/20 rounded-lg px-4 py-2.5 text-sm cursor-pointer outline-none hover:border-lila transition-colors shadow-sm flex items-center justify-between w-full h-10 ${deshabilitado ? 'opacity-60 cursor-not-allowed bg-oscuro' : ''}`}
          >
            <span className="font-medium truncate">{value || placeholder || "Seleccionar..."}</span>
            <i className={`bi bi-chevron-down text-xs transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}></i>
          </button>

          {isDropdownOpen && !deshabilitado && (
            <ul className="absolute top-full left-0 mt-2 w-full max-h-48 overflow-y-auto bg-bg-card border border-lila/20 rounded-lg shadow-xl z-50 py-1 scrollbar-hide">
              {opciones.map((opcion, i) => (
                <li
                  key={i}
                  onClick={() => {
                    onChange({ target: { name, value: opcion } });
                    setIsDropdownOpen(false);
                  }}
                  className="px-4 py-2.5 text-sm text-lila hover:bg-lila hover:text-oscuro cursor-pointer transition-colors"
                >
                  {opcion}
                </li>
              ))}
            </ul>
          )}
        </div>

      ) : tipo === "number" ? (
        
        <div className="relative flex items-center w-full">
          <input
            type="number" name={name} value={value} onChange={onChange}
            placeholder={placeholder} required={requerido} disabled={deshabilitado}
            className={`${baseClasses} pr-8 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
          />
          <div className="absolute right-2 flex flex-col gap-0.5">
            <button type="button" onClick={() => handleNumberChange(1)} disabled={deshabilitado} className="text-lila-soft hover:text-lila transition-colors leading-none">
              <i className="bi bi-caret-up-fill text-[10px]"></i>
            </button>
            <button type="button" onClick={() => handleNumberChange(-1)} disabled={deshabilitado} className="text-lila-soft hover:text-lila transition-colors leading-none">
              <i className="bi bi-caret-down-fill text-[10px]"></i>
            </button>
          </div>
        </div>

      ) : (
        <input
          type={tipo} name={name} value={value} onChange={onChange}
          placeholder={placeholder} required={requerido} disabled={deshabilitado}
          className={baseClasses}
        />
      )}
    </div>
  );
}