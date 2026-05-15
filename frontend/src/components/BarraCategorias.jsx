export default function BarraCategorias({ productosDB }) {

  const totalProd = productosDB.length;

  const superioresCant = productosDB.filter(p => 
    ["Playeras", "Blusas", "Camisas", "Suéteres", "Sudaderas", "Chamarras", "Abrigos", "Vestidos"].includes(p.categoria)
  ).length;

  const inferioresCant = productosDB.filter(p => 
    ["Pantalones", "Faldas", "Shorts"].includes(p.categoria)
  ).length;

  const calzadoCant = productosDB.filter(p => p.categoria === "Calzado").length;
  const accesoriosCant = totalProd - (superioresCant + inferioresCant + calzadoCant);

  const superioresPorc = totalProd > 0 ? Math.round((superioresCant / totalProd) * 100) : 0;
  const inferioresPorc = totalProd > 0 ? Math.round((inferioresCant / totalProd) * 100) : 0;
  const calzadoPorc = totalProd > 0 ? Math.round((calzadoCant / totalProd) * 100) : 0;

  const accesoriosPorc = totalProd > 0 ? Math.max(0, 100 - (superioresPorc + inferioresPorc + calzadoPorc)) : 0;

  const tooltipBaseClasses = "absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-oscuro text-blanco text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl z-50 pointer-events-none";

  const segmentos = [
    { width: superioresPorc, color: "bg-azul", label: `Superiores: ${superioresCant} (${superioresPorc}%)` },
    { width: inferioresPorc, color: "bg-rosa", label: `Inferiores: ${inferioresCant} (${inferioresPorc}%)` },
    { width: calzadoPorc, color: "bg-verde", label: `Calzado: ${calzadoCant} (${calzadoPorc}%)` },
    { width: accesoriosPorc, color: "bg-naranja", label: `Accesorios: ${accesoriosCant} (${accesoriosPorc}%)` }
  ];

  return (
    <div className="bg-bg-card rounded-xl p-6 border border-lila/10 shadow-lg relative w-full xl:w-5/12 text-white flex flex-col justify-center">
      <p className="m-0 text-sm text-lila-soft uppercase tracking-wide">Productos por Categoría</p>
      
      {/* Barra de colores */}
      <div className="flex h-7 mt-5 w-full overflow-visible font-medium text-white rounded-md">
        {segmentos.map((segment, idx) => (
          segment.width > 0 && (
            <div 
              key={idx} 
              style={{ width: `${segment.width}%` }} 
              className={`${segment.color} group relative cursor-help transition-all duration-300 hover:opacity-80 
                ${idx === 0 ? 'rounded-l-md' : ''} 
                ${idx === segmentos.length - 1 ? 'rounded-r-md' : ''}`}
            >
              <span className={tooltipBaseClasses}>{segment.label}</span>
            </div>
          )
        ))}
      </div>

      {/* Porcentajes inferiores */}
      <div className="flex justify-between text-xs text-text-muted mt-3 font-medium">
        {segmentos.map((segment, idx) => (
          segment.width > 0 && (
            <span key={idx} style={{ width: `${segment.width}%` }} className="text-center truncate px-1">
              {segment.width}%
            </span>
          )
        ))}
      </div>
    </div>
  );
}