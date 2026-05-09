export default function Paginacion({ 
  paginaActual = 1, 
  totalRegistros = 0, 
  rangoSiguiente = "1 – 5", 
  onExportar,
  onCambiarPagina 
}) {
  
  const paginas = ["‹", "1", "2", "3", "4", "›"];

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
      
      {/* Botón Exportar */}
      <button 
        onClick={onExportar}
        className="bg-transparent text-lila-soft border border-lila/20 rounded-lg px-5 py-2 font-bold cursor-pointer hover:bg-lila hover:text-oscuro transition-all active:scale-95 w-full sm:w-auto"
      >
        Exportar
      </button>

      {/* Contador de registros */}
      <span className="text-text-muted text-sm font-medium">
        {rangoSiguiente} de {totalRegistros.toLocaleString()}
      </span>

      {/* Botones de Navegación */}
      <div className="flex gap-2">
        {paginas.map((p, i) => (
          <button
            key={i}
            onClick={() => onCambiarPagina && onCambiarPagina(p)}
            className={`w-9 h-9 rounded-lg font-bold cursor-pointer transition-all hover:scale-110 active:scale-90 flex items-center justify-center ${
              p === String(paginaActual)
                ? "bg-lila text-oscuro border-none hover:bg-lila-soft"
                : "bg-transparent text-lila-soft border border-lila/20 hover:bg-lila hover:text-oscuro"
            }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}