export default function Modal({ isOpen, onClose, children, ancho = "max-w-md" }) {
  if (!isOpen) return null;

  return (
    <div 
      className={`
        fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm transition-colors duration-300
        bg-oscuro/40
        dark:bg-black/60
      `}
      onClick={onClose}
    >
      <div 
        className={`
          rounded-2xl shadow-2xl w-full ${ancho} max-h-[90vh] flex flex-col overflow-hidden transition-colors duration-300
          bg-lila-pastel border border-morado/20
          dark:bg-bg-card dark:border-lila/20
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end pt-4 pr-4 shrink-0">
          <button 
            onClick={onClose} 
            className={`
              w-8 h-8 flex items-center justify-center rounded-full transition-all cursor-pointer
              text-morado/60 hover:text-morado hover:bg-morado/10
              dark:text-lila-soft dark:hover:text-blanco dark:hover:bg-lila/10
            `}
          >
            <i className="bi bi-x-lg text-lg"></i>
          </button>
        </div>

        <div className={`
          flex-1 overflow-y-auto overscroll-contain px-2 pb-2 
          [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-morado/20 hover:[&::-webkit-scrollbar-thumb]:bg-morado/50
          dark:[&::-webkit-scrollbar-thumb]:bg-lila/30 dark:hover:[&::-webkit-scrollbar-thumb]:bg-lila
        `}>
          {children}
        </div>
      </div>
    </div>
  );
}