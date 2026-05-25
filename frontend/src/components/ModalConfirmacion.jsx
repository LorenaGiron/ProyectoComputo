import { useEffect } from "react";

/**
 * Props:
 * - isOpen: boolean
 * - tipo: 'exito' | 'confirmar' | 'eliminar'
 * - titulo: string
 * - mensaje: string (opcional)
 * - textoConfirmar: string
 * - textoCancelar: string (default 'Cancelar')
 * - onConfirmar: () => void
 * - onCancelar: () => void
 * - cargando: boolean
 */
export default function ModalConfirmacion({
  isOpen = false,
  tipo = "confirmar",
  titulo,
  mensaje,
  textoConfirmar,
  textoCancelar = "Cancelar",
  onConfirmar,
  onCancelar,
  cargando = false,
}) {
  useEffect(() => {
    if (!isOpen) return;

    const h = (e) => {
      if (e.key === "Escape") onCancelar?.();
    };

    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [isOpen, onCancelar]);

  if (!isOpen) return null;

  const config = {
    exito: {
      iconClass: "bi bi-check-lg",
      borderColor: "border-verde/40",
      iconBorder: "border-verde",
      iconColor: "text-verde",
      titleColor: "text-verde",
    },
    confirmar: {
      iconClass: "bi bi-exclamation",
      borderColor: "border-lila/30",
      iconBorder: "border-lila",
      iconColor: "text-lila",
      titleColor: "text-lila",
    },
    eliminar: {
      iconClass: "bi bi-trash",
      borderColor: "border-error-text/40",
      iconBorder: "border-error-text",
      iconColor: "text-error-text",
      titleColor: "text-error-text",
    },
  }[tipo] || {
    iconClass: "bi bi-exclamation",
    borderColor: "border-lila/30",
    iconBorder: "border-lila",
    iconColor: "text-lila",
    titleColor: "text-lila",
  };

  const esExito = tipo === "exito";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onCancelar}
    >
      <div
        className={`w-full max-w-md bg-bg-card border ${config.borderColor} rounded-2xl shadow-2xl p-6 relative`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancelar}
          className="absolute top-4 right-4 text-lila-soft hover:text-blanco transition-colors"
          aria-label="Cerrar modal"
          disabled={cargando}
        >
          <i className="bi bi-x-lg text-lg"></i>
        </button>

        <div
          className={`w-14 h-14 rounded-full border flex items-center justify-center mb-4 ${config.iconBorder} ${config.iconColor}`}
        >
          <i className={`${config.iconClass} text-2xl`}></i>
        </div>

        <h2 className={`text-xl font-bold mb-3 ${config.titleColor}`}>
          {titulo}
        </h2>

        {mensaje && (
          <p className="text-lila-soft text-sm mb-6">
            {mensaje}
          </p>
        )}

        {!esExito && (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancelar}
              disabled={cargando}
              className="flex-1 px-4 py-2 bg-oscuro border border-lila/30 text-blanco rounded-lg hover:bg-oscuro/80 disabled:opacity-50 transition-colors"
            >
              {textoCancelar}
            </button>

            <button
              type="button"
              onClick={onConfirmar}
              disabled={cargando}
              className="flex-1 px-4 py-2 bg-rojo text-blanco rounded-lg hover:bg-rojo/80 disabled:opacity-50 transition-colors"
            >
              {cargando ? "Procesando..." : textoConfirmar}
            </button>
          </div>
        )}

        {esExito && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onCancelar}
              className="px-4 py-2 bg-lila text-blanco rounded-lg hover:bg-lila/80 transition-colors"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}