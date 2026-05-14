import { useEffect } from "react";

/**
 * Props:
 *  - tipo:            'exito' | 'confirmar' | 'eliminar'
 *  - titulo:          string
 *  - mensaje:         string (opcional)
 *  - textoConfirmar:  string
 *  - textoCancelar:   string (default 'Cancelar')
 *  - onConfirmar:     () => void
 *  - onCancelar:      () => void
 */
export default function ModalConfirmacion({
  tipo = "confirmar",
  titulo,
  mensaje,
  textoConfirmar,
  textoCancelar = "Cancelar",
  onConfirmar,
  onCancelar,
}) {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onCancelar(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onCancelar]);

  const config = {
    exito: {
      iconClass:   "bi bi-check-lg",
      borderColor: "border-verde/40",
      iconBorder:  "border-verde",
      iconColor:   "text-verde",
      titleColor:  "text-verde",
    },
    confirmar: {
      iconClass:   "bi bi-exclamation",
      borderColor: "border-lila/30",
      iconBorder:  "border-lila",
      iconColor:   "text-lila",
      titleColor:  "text-lila",
    },
    eliminar: {
      iconClass:   "bi bi-trash",
      borderColor: "border-error-text/40",
      iconBorder:  "border-error-text",
      iconColor:   "text-error-text",
      titleColor:  "text-error-text",
    },
  }[tipo];

  const esExito = tipo === "exito";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
      onClick={onCancelar}
    >
      <div
        className={`relative w-full max-w-sm bg-oscuro/60 backdrop-blur-md border ${config.borderColor} shadow-2xl p-8 sm:p-10`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={onCancelar}
          className="absolute right-6 top-6 text-lila opacity-60 hover:opacity-100 transition-opacity text-xl"
        >
          <i className="bi bi-x-lg" />
        </button>

        {/* Ícono */}
        <div className="mb-8">
          <div className={`w-14 h-14 rounded-full border ${config.iconBorder} flex items-center justify-center`}>
            <i className={`${config.iconClass} text-2xl ${config.iconColor}`} />
          </div>
        </div>

        {/* Título */}
        <h3 className={`font-baskervville text-2xl tracking-widest border-b border-lila/30 pb-4 mb-6 leading-snug uppercase ${config.titleColor}`}>
          {titulo}
        </h3>

        {/* Mensaje */}
        {mensaje && (
          <p className="font-baskervville text-sm text-lila opacity-80 leading-relaxed mb-6">
            {mensaje}
          </p>
        )}

        {/* Botones */}
        {!esExito && (
          <div className="flex gap-3 mt-8">
            <button
              onClick={onCancelar}
              className="flex-1 h-11 bg-transparent border border-lila/40 text-lila font-baskervville text-sm tracking-widest uppercase hover:bg-lila/10 transition-colors"
            >
              {textoCancelar}
            </button>
            <button
              onClick={onConfirmar}
              className={`flex-1 h-11 bg-transparent font-baskervville text-sm tracking-widest uppercase transition-colors
                ${tipo === "eliminar"
                  ? "border border-error-text/60 text-error-text hover:bg-error-text/10"
                  : "border border-lila text-lila hover:bg-lila hover:text-oscuro"
                }`}
            >
              {textoConfirmar}
            </button>
          </div>
        )}

        {/* Firma AURA */}
        <div className="mt-10 font-cinzel tracking-widest text-xl opacity-90 text-lila">
          A U R A
        </div>
      </div>
    </div>
  );
}
