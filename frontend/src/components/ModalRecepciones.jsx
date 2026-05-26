import { useEffect } from "react";
import { X, Calendar, User, Package } from "lucide-react";
import Etiquetas from "./Etiquetas";
import AccionesTabla from "./AccionesTabla";

function formatMoney(n) {
  return `$${Number(n).toLocaleString("es-MX")}`;
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX");
}

export default function ModalRecepciones({ 
  row, 
  onClose, 
  onConfirmar, 
  onEditar, 
  onEliminar
}) {
  
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  const unidadesTotales = row.items.reduce((acc, i) => acc + i.cantidad, 0);
  const esDraft     = row.status === "DRAFT";
  const estadoLabel = row.status === "CONFIRMED" ? "Confirmado" : "Draft";

  return (
    <div 
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-colors duration-300
        bg-oscuro/40
        dark:bg-black/60
      `}
      onClick={onClose}
    >
      <div 
        className={`
          relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto border transition-colors duration-300
          bg-lila-pastel border-morado/20 text-oscuro
          dark:bg-bg-card dark:border-lila/20 dark:text-blanco
        `}
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            
            <div className="flex items-center gap-3">
              <span className={`
                px-4 py-1.5 rounded-full text-xs font-bold transition-colors
                bg-morado text-blanco
                dark:bg-lila/20 dark:text-lila
              `}>
                {row.folio}
              </span>
              <Etiquetas contenido={estadoLabel} />
            </div>
            
            <div className="flex items-center gap-2">
              {esDraft && (
                <button 
                  onClick={() => onConfirmar(row.id)}
                  className={`
                    px-4 py-1.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all cursor-pointer
                    bg-morado text-blanco
                    dark:bg-lila dark:text-oscuro
                  `}
                >
                  Confirmar
                </button>
              )}
              <button 
                onClick={onClose}
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer
                  text-morado/60 hover:text-morado hover:bg-morado/10
                  dark:text-lila-soft dark:hover:text-blanco dark:hover:bg-lila/10
                `}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <h2 className="text-xl font-extrabold mb-2">{row.supplierNombre}</h2>
          
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-sm transition-colors text-morado/80 dark:text-lila-soft">
              <Calendar size={13} className="text-morado dark:text-lila-mid" />
              {row.fecha}
            </span>
            <span className="flex items-center gap-1.5 text-sm transition-colors text-morado/80 dark:text-lila-soft">
              <User size={13} className="text-morado dark:text-lila-mid" />
              {row.createdBy || "—"}
            </span>
          </div>
          
          {row.comentarios && (
            <p className="mt-2 text-sm text-gris dark:text-lila-soft transition-colors italic">
              {row.comentarios}
            </p>
          )}
        </div>

        {/* Resumen */}
        <div className={`
          mx-6 mb-4 rounded-xl overflow-hidden border transition-colors shadow-sm
          bg-blanco border-morado/20
          dark:bg-oscuro/40 dark:border-lila/20 dark:shadow-none
        `}>
          <div className="grid grid-cols-3">
            {[
              { label: "Items distintos",  value: row.items.length, color: "" },
              { label: "Unidades totales", value: unidadesTotales,  color: "" },
              { label: "Total",            value: formatMoney(row.total), color: "text-verde font-extrabold" },
            ].map((stat, i) => (
              <div 
                key={i} 
                className={`
                  px-4 py-3 text-center 
                  ${i < 2 ? 'border-r border-morado/10 dark:border-lila/10' : ''}
                `}
              >
                <p className={`
                  text-[10px] font-bold uppercase tracking-wider mb-1 transition-colors
                  text-morado
                  dark:text-lila-soft/50
                `}>
                  {stat.label}
                </p>
                <p className={`text-xl md:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Lista de Items */}
        <div className="px-6 mb-4">
          <p className={`
            text-xs font-bold uppercase tracking-widest mb-3 transition-colors
            text-morado
            dark:text-lila-soft/50
          `}>
            Detalles de Items
          </p>
          <div className="flex flex-col gap-3">
            {row.items.map((item, i) => (
              <div 
                key={i} 
                className={`
                  flex flex-wrap md:flex-nowrap items-center gap-4 rounded-xl px-4 py-3 border transition-colors shadow-sm
                  bg-blanco border-morado/20
                  dark:bg-oscuro/40 dark:border-lila/20 dark:shadow-none
                `}
              >
                <div className={`
                  w-11 h-11 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border transition-colors
                  bg-lila/10 border-morado/20 text-morado
                  dark:bg-lila/5 dark:border-lila/20 dark:text-lila-mid
                `}>
                  {item.imagen
                    ? <img src={item.imagen} alt={item.productNombre} className="w-full h-full object-cover" />
                    : <Package size={20} />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{item.sku}</p>
                  <p className="text-xs text-gris dark:text-lila-soft transition-colors truncate">
                    {item.productNombre}
                  </p>
                </div>
                
                <div className="flex gap-4 sm:gap-6 w-full md:w-auto justify-between md:justify-end mt-2 md:mt-0">
                  {[
                    { label: "Cant.",     value: item.cantidad },
                    { label: "Costo un.", value: formatMoney(item.costoUnitario) },
                    { label: "Subtotal",  value: formatMoney(item.subtotal) },
                  ].map((col) => (
                    <div key={col.label} className="text-center md:text-right">
                      <p className={`
                        text-[10px] font-bold uppercase tracking-wider mb-0.5 transition-colors
                        text-morado
                        dark:text-lila-soft/50
                      `}>
                        {col.label}
                      </p>
                      <p className="text-sm font-bold opacity-90">{col.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={`
          px-6 py-4 flex items-center justify-between border-t transition-colors
          border-morado/20 bg-blanco/50
          dark:border-lila/20 dark:bg-transparent
        `}>
          <div className="flex gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider transition-colors text-morado dark:text-lila-soft/50">
                Creado
              </p>
              <p className="text-xs font-semibold text-gris dark:text-lila-mid transition-colors">
                {formatDate(row.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider transition-colors text-morado dark:text-lila-soft/50">
                Editado
              </p>
              <p className="text-xs font-semibold text-gris dark:text-lila-mid transition-colors">
                {formatDate(row.updatedAt)}
              </p>
            </div>
          </div>
          <AccionesTabla
            onEliminar={esDraft ? () => onEliminar(row.id) : undefined}
            onEditar={esDraft ? () => onEditar(row) : undefined}
          />
        </div>

      </div>
    </div>
  );
}