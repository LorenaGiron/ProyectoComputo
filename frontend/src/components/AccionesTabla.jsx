export default function AccionesTabla({ onVer, onEditar, onEliminar }) {
  return (
    <div className="flex items-center justify-center gap-3">
      
      {/* Botón Ver */}
      {onVer && (
        <button 
          onClick={onVer} 
          className="relative group bg-transparent border-none cursor-pointer text-md opacity-70 text-lila-soft hover:opacity-100 hover:text-verde transition-all outline-none" 
        >
          <i className="bi bi-eye inline-block transition-transform group-hover:scale-125"></i>
          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-oscuro text-blanco text-xs font-poppins px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl z-50 pointer-events-none">
            Ver Detalles
          </span>
        </button>
      )}

      {/* Botón Editar */}
      {onEditar && (
        <button 
          onClick={onEditar} 
          className="relative group bg-transparent border-none cursor-pointer text-md opacity-70 text-lila-soft hover:opacity-100 hover:text-amarillo transition-all outline-none" 
        >
          <i className="bi bi-pencil inline-block transition-transform group-hover:scale-125"></i>
          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-oscuro text-blanco text-xs font-poppins px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl z-50 pointer-events-none">
            Editar
          </span>
        </button>
      )}

      {/* Botón Eliminar */}
      {onEliminar && (
        <button 
          onClick={onEliminar} 
          className="relative group bg-transparent border-none cursor-pointer text-md opacity-70 text-lila-soft hover:opacity-100 hover:text-rojo transition-all outline-none" 
        >
          <i className="bi bi-trash inline-block transition-transform group-hover:scale-125"></i>
          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-oscuro text-blanco text-xs font-poppins px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl z-50 pointer-events-none">
            Eliminar
          </span>
        </button>
      )}
      
    </div>
  );
}