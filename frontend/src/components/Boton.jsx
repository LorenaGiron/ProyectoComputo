export default function Boton({ 
  children, 
  onClick, 
  variante = "claro", 
  className = "",
  tipo = "button" 
}) {
  
  // 2. Agregamos 'cursor-pointer' a las clases base
  const baseClasses = "px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer";

  // Los "trajes" que se puede poner el botón
  const estilos = {
    // Guardar, Aceptar, Nuevo, Exportar
    claro: "bg-lila text-oscuro-card border border-lila hover:bg-oscuro-card hover:text-lila",
    
    // Eliminar, Cancelar
    oscuro: "bg-oscuro-card text-lila border border-lila hover:bg-lila hover:text-oscuro-card",
    
    // Para acciones secundarias (Cerrar, Ver detalles)
    secundario: "bg-lila/10 text-blanco border border-lila/20 hover:bg-lila/30",
    
    // Sin fondo, solo texto 
    fantasma: "text-lila-soft hover:text-blanco hover:bg-lila/10 bg-transparent"
  };

  // 3. Actualizamos el fallback para que coincida con tus nuevos nombres
  const estiloSeleccionado = estilos[variante] || estilos.claro;

  return (
    <button 
      type={tipo}
      onClick={onClick} 
      className={`${baseClasses} ${estiloSeleccionado} ${className}`}
    >
      {children}
    </button>
  );
}