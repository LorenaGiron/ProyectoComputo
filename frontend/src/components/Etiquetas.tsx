export default function Etiquetas({ contenido }) {
  
  const estilos = {
    // --- ESTADOS ---
    Activo: "bg-verde/20 text-verde border-verde/30",
    Confirmado: "bg-verde/20 text-verde border-verde/30",
    
    Inactivo: "bg-rojo/20 text-rojo border-rojo/30",
    Cancelado: "bg-rojo/20 text-rojo border-rojo/30",
    
    Pendiente: "bg-amarillo/20 text-amarillo border-amarillo/30",
    Draft: "bg-amarillo/20 text-amarillo border-amarillo/30",

    // --- ROLES ---
    Admin: "bg-azul/20 text-azul border-azul/30",
    Proveedor: "bg-rosa/20 text-rosa border-rosa/30",
    Cliente: "bg-naranja/20 text-naranja border-naranja/30",
    
    Default: "bg-lila-soft/20 text-lila-soft border-lila-soft/30"
  };

  const clasesActuales = estilos[contenido] || estilos.Default;

  return (
    <span
      className={`inline-block w-28 text-center py-1 rounded-full text-xs uppercase tracking-wider border shadow-sm ${clasesActuales}`}
    >
      {contenido}
    </span>
  );
}