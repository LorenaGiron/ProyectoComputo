export default function Paginacion({
  paginaActual  = 1,
  totalRegistros = 0,
  rangoSiguiente = "1 – 5",
  limit          = 7,
  onExportar,
  onCambiarPagina,
}) {
  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / limit));

  // Genera los números de página visibles con "..." cuando hay muchas
  const getPaginas = () => {
    if (totalPaginas <= 5) {
      return Array.from({ length: totalPaginas }, (_, i) => String(i + 1));
    }
    const paginas = [];
    if (paginaActual <= 3) {
      paginas.push("1", "2", "3", "4", "...", String(totalPaginas));
    } else if (paginaActual >= totalPaginas - 2) {
      paginas.push("1", "...", String(totalPaginas - 3), String(totalPaginas - 2), String(totalPaginas - 1), String(totalPaginas));
    } else {
      paginas.push("1", "...", String(paginaActual - 1), String(paginaActual), String(paginaActual + 1), "...", String(totalPaginas));
    }
    return paginas;
  };

  const paginas = getPaginas();
  const esPrimera = paginaActual === 1;
  const esUltima  = paginaActual === totalPaginas;

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

      {/* Botones de navegación */}
      <div className="flex gap-2">

        {/* Anterior */}
        <button
          onClick={() => !esPrimera && onCambiarPagina("‹")}
          disabled={esPrimera}
          className="w-9 h-9 rounded-lg font-bold transition-all flex items-center justify-center border border-lila/20 text-lila-soft disabled:opacity-30 disabled:cursor-not-allowed hover:bg-lila hover:text-oscuro active:scale-90"
        >
          ‹
        </button>

        {/* Números */}
        {paginas.map((p, i) =>
          p === "..." ? (
            <span key={i} className="w-9 h-9 flex items-center justify-center text-lila-soft opacity-50 text-sm">
              ...
            </span>
          ) : (
            <button
              key={i}
              onClick={() => onCambiarPagina(p)}
              className={`w-9 h-9 rounded-lg font-bold transition-all hover:scale-110 active:scale-90 flex items-center justify-center ${
                p === String(paginaActual)
                  ? "bg-lila text-oscuro border-none"
                  : "bg-transparent text-lila-soft border border-lila/20 hover:bg-lila hover:text-oscuro"
              }`}
            >
              {p}
            </button>
          )
        )}

        {/* Siguiente */}
        <button
          onClick={() => !esUltima && onCambiarPagina("›")}
          disabled={esUltima}
          className="w-9 h-9 rounded-lg font-bold transition-all flex items-center justify-center border border-lila/20 text-lila-soft disabled:opacity-30 disabled:cursor-not-allowed hover:bg-lila hover:text-oscuro active:scale-90"
        >
          ›
        </button>

      </div>
    </div>
  );
}