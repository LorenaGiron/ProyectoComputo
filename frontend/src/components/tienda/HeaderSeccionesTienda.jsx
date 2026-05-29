import { useNavigate } from "react-router-dom";


export default function HeaderSeccionesTienda() {
  const navigate = useNavigate();


  return (
    <header className="sticky top-0 z-40 bg-oscuro/95 backdrop-blur-md border-b border-lila/10">
      <div className="max-w-[1480px] mx-auto px-6 lg:px-10 py-4 flex items-center justify-between gap-6">

        {/* Logo */}
        <div className="flex items-baseline gap-2">
          <h1
            className="text-4xl text-lila tracking-tight leading-none drop-shadow-[0_0_18px_rgba(231,214,255,0.25)]"
            style={{ fontFamily: "'Cinzel Decorative', serif" }}
          >
            AURA
          </h1>
          <span className="text-[10px] tracking-[4px] text-lila-mid uppercase">Boutique</span>
        </div>

       
        <div className="flex items-center gap-3">

          {/* Botón volver a la tienda */}
         <button
            onClick={() => navigate("/tienda")}
            className="flex items-center gap-2 px-7 py-3 bg-lila text-oscuro font-bold rounded-xl hover:bg-lila-soft transition text-sm tracking-wide whitespace-nowrap"
            >
            <i className="bi bi-chevron-left" />
            <span className="hidden sm:inline">Volver a la tienda</span>
            <span className="sm:hidden">Volver</span>
            </button>

        </div>
      </div>
    </header>
  );
}