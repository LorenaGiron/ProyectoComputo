export default function Modal({ isOpen, onClose, children, ancho = "max-w-md" }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className={`bg-bg-card border border-lila/20 rounded-2xl shadow-2xl w-full ${ancho} flex flex-col relative overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón X */}
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 text-lila-soft hover:text-blanco transition-colors z-10 cursor-pointer"
        >
          <i className="bi bi-x-lg text-xl"></i>
        </button>

        {/* Contenido */}
        <div className="max-h-[85vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}