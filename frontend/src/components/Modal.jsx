export default function Modal({ isOpen, onClose, children, ancho = "max-w-md" }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6"
      onClick={onClose}
    >
      <div 
        className={`bg-bg-card border border-lila/20 rounded-2xl shadow-2xl w-full ${ancho} max-h-[90vh] flex flex-col overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end pt-4 pr-4 shrink-0">
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full text-lila-soft hover:text-blanco hover:bg-lila/10 transition-all cursor-pointer"
          >
            <i className="bi bi-x-lg text-lg"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-2 pb-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-lila/30 hover:[&::-webkit-scrollbar-thumb]:bg-lila [&::-webkit-scrollbar-thumb]:rounded-full">
          {children}
        </div>
      </div>
    </div>
  );
}