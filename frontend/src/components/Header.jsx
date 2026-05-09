export default function Header() {
  return (
    <header className="flex flex-col md:flex-row justify-between items-center gap-4 w-full px-4 sm:px-6 lg:px-8 py-4 border-b border-lila-soft/10 bg-oscuro z-50 shadow-sm">
      
      {/* 1. Buscador Global */}
      <div className="relative w-full flex-1 md:max-w-lg lg:max-w-xl xl:max-w-2xl">
        <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-lila-soft text-sm"></i>
        <input 
          type="text" 
          placeholder="Search ..." 
          className="w-full bg-bg-card text-lila border border-lila/20 rounded-full pl-10 pr-4 py-2.5 text-sm outline-none hover:border-lila focus:ring-1 focus:ring-lila transition-all placeholder-lila/30 shadow-sm"
        />
      </div>

      {/* 2. Acciones del Usuario (Derecha) */}
      <div className="flex items-center gap-4 sm:gap-5 w-full md:w-auto justify-end">
        
        <div className="relative cursor-pointer hover:scale-110 transition-transform" title="Notificaciones">
          <i className="bi bi-bell text-xl text-lila"></i>
        </div>

        <div className="flex items-center gap-3 bg-bg-card px-4 py-1.5 rounded-full border border-lila-soft/20 hover:border-lila-mid transition-colors cursor-pointer shadow-sm">
          <i className="bi bi-person-circle text-2xl text-lila-mid"></i>
          <div className="text-left leading-tight hidden sm:block">
            <p className="m-0 font-semibold text-sm text-blanco">Proyecto</p>
            <p className="m-0 text-xs opacity-80 uppercase tracking-wider text-lila-soft">Administrador</p>
          </div>
          <i className="bi bi-chevron-down text-xs text-lila-soft ml-1"></i>
        </div>

        <button className="relative group flex items-center justify-center bg-bg-card text-lila border border-lila/20 w-10 h-10 rounded-full hover:bg-lila hover:text-oscuro transition-colors cursor-pointer shadow-sm active:scale-95">
          <i className="bi bi-sun-fill text-lg"></i>
          <span className="absolute top-full mt-2 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-oscuro text-blanco text-xs font-poppins px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl z-50 pointer-events-none">
            Modo claro
          </span>
        </button>
        
      </div>
    </header>
  );
}