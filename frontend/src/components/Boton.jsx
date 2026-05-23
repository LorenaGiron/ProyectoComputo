export default function Boton({ 
  children, 
  onClick, 
  variante = "claro", 
  className = "",
  tipo = "button" 
}) {
  
  const baseClasses = "px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer";

  const estilos = {
    // Guardar, Aceptar, Nuevo, Exportar
    claro: `
      bg-lila text-oscuro-card border border-lila
      hover:bg-oscuro-card hover:text-lila
      dark:bg-lila dark:text-oscuro-card dark:border-lila
      dark:hover:bg-oscuro-card dark:hover:text-lila
    `,

    // Eliminar, Cancelar
    oscuro: `
      bg-oscuro/10 text-oscuro border border-oscuro/30
      hover:bg-oscuro hover:text-blanco
      dark:bg-oscuro-card dark:text-lila dark:border-lila
      dark:hover:bg-lila dark:hover:text-oscuro-card
    `,

    // Para acciones secundarias (Cerrar, Ver detalles)
    secundario: `
      bg-oscuro/5 text-oscuro/70 border border-oscuro/15
      hover:bg-oscuro/15 hover:text-oscuro
      dark:bg-lila/10 dark:text-blanco dark:border-lila/20
      dark:hover:bg-lila/30 dark:hover:text-blanco
    `,

    // Sin fondo, solo texto
    fantasma: `
      bg-transparent text-oscuro/60
      hover:text-oscuro hover:bg-oscuro/8
      dark:text-lila-soft
      dark:hover:text-blanco dark:hover:bg-lila/10
    `,
  };

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