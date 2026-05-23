import { useState, useRef, useEffect } from 'react'
import { exportarPDF, exportarExcel } from '../services/exportService'

export default function Paginacion({
  paginaActual   = 1,
  totalRegistros = 0,
  rangoSiguiente = "1 – 5",
  limit          = 7,
  onCambiarPagina,
  exportTitulo   = "Reporte",
  exportColumnas = [],
  exportFilas    = [],
}) {
  const [mostrarMenu, setMostrarMenu] = useState(false)
  const [exportando,  setExportando]  = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMostrarMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleExportar = async (formato) => {
    setMostrarMenu(false)
    setExportando(true)
    try {
      if (formato === 'pdf') exportarPDF(exportTitulo, exportColumnas, exportFilas)
      else                   await exportarExcel(exportTitulo, exportColumnas, exportFilas)
    } finally {
      setExportando(false)
    }
  }

  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / limit))

  const getPaginas = () => {
    if (totalPaginas <= 5) return Array.from({ length: totalPaginas }, (_, i) => String(i + 1))
    const paginas = []
    if (paginaActual <= 3) {
      paginas.push("1", "2", "3", "4", "...", String(totalPaginas))
    } else if (paginaActual >= totalPaginas - 2) {
      paginas.push("1", "...", String(totalPaginas - 3), String(totalPaginas - 2), String(totalPaginas - 1), String(totalPaginas))
    } else {
      paginas.push("1", "...", String(paginaActual - 1), String(paginaActual), String(paginaActual + 1), "...", String(totalPaginas))
    }
    return paginas
  }

  const paginas   = getPaginas()
  const esPrimera = paginaActual === 1
  const esUltima  = paginaActual === totalPaginas

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">

      {/* ── Botón Exportar con dropdown ── */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMostrarMenu((v) => !v)}
          disabled={exportando}
          className="bg-blanco rounded-lg px-5 py-2 font-bold cursor-pointer transition-all active:scale-95 w-full sm:w-auto flex items-center gap-2 border
            text-oscuro border-oscuro/20 hover:bg-oscuro hover:text-blanco hover:border-oscuro
            dark:bg-transparent dark:text-lila-soft dark:border-lila/20 dark:hover:bg-lila dark:hover:text-oscuro"
        >
          {exportando ? (
            <>
              <i className="bi bi-arrow-repeat animate-spin text-sm" />
              Exportando...
            </>
          ) : (
            <>
              <i className="bi bi-download text-sm" />
              Exportar
              <i className={`bi bi-chevron-${mostrarMenu ? 'up' : 'down'} text-xs`} />
            </>
          )}
        </button>

        {mostrarMenu && (
          <div className="absolute left-0 bottom-full mb-2 rounded-xl overflow-hidden shadow-2xl z-50 min-w-[160px]
            bg-blanco border border-oscuro/15
            dark:bg-[#2C2A48] dark:border-[#56538E]">
            <button
              onClick={() => handleExportar('pdf')}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors
                text-oscuro hover:bg-oscuro/5
                dark:text-[#E7D6FF] dark:hover:bg-white/5"
            >
              <i className="bi bi-file-earmark-pdf text-base text-rojo" />
              Exportar PDF
            </button>
            <div className="h-px bg-oscuro/10 dark:bg-[rgba(86,83,142,0.4)]" />
            <button
              onClick={() => handleExportar('excel')}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors
                text-oscuro hover:bg-oscuro/5
                dark:text-[#E7D6FF] dark:hover:bg-white/5"
            >
              <i className="bi bi-file-earmark-excel text-base text-[#8DB051]" />
              Exportar Excel
            </button>
          </div>
        )}
      </div>

      {/* ── Contador ── */}
      <span className="text-sm font-medium
        text-oscuro/50
        dark:text-text-muted">
        {rangoSiguiente} de {totalRegistros.toLocaleString()}
      </span>

      {/* ── Botones de navegación ── */}
      <div className="flex gap-2">

        {/* Anterior */}
        <button
          onClick={() => !esPrimera && onCambiarPagina("‹")}
          disabled={esPrimera}
          className="w-9 h-9 rounded-lg font-bold transition-all flex items-center justify-center border
            disabled:opacity-30 disabled:cursor-not-allowed active:scale-90
            bg-blanco text-oscuro border-oscuro/20 hover:bg-oscuro hover:text-blanco hover:border-oscuro
            dark:bg-transparent dark:text-lila-soft dark:border-lila/20 dark:hover:bg-lila dark:hover:text-oscuro"
        >
          ‹
        </button>

        {/* Páginas */}
        {paginas.map((p, i) =>
          p === "..." ? (
            <span key={i} className="w-9 h-9 flex items-center justify-center text-sm
              text-oscuro/40
              dark:text-lila-soft dark:opacity-50">
              ...
            </span>
          ) : (
            <button
              key={i}
              onClick={() => onCambiarPagina(p)}
              className={`w-9 h-9 rounded-lg font-bold transition-all hover:scale-110 active:scale-90 flex items-center justify-center border
                ${p === String(paginaActual)
                  ? "bg-lila text-oscuro border-lila"
                  : "bg-blanco text-oscuro border-oscuro/20 hover:bg-oscuro hover:text-blanco hover:border-oscuro dark:bg-transparent dark:text-lila-soft dark:border-lila/20 dark:hover:bg-lila dark:hover:text-oscuro"
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
          className="w-9 h-9 rounded-lg font-bold transition-all flex items-center justify-center border
            disabled:opacity-30 disabled:cursor-not-allowed active:scale-90
            bg-blanco text-oscuro border-oscuro/20 hover:bg-oscuro hover:text-blanco hover:border-oscuro
            dark:bg-transparent dark:text-lila-soft dark:border-lila/20 dark:hover:bg-lila dark:hover:text-oscuro"
        >
          ›
        </button>

      </div>

    </div>
  )
}