export default function Tarjetas({ label, value, sub, accent = "#7C6AF7", icon, onClick, isActive }) {
  return (
    <div
      onClick={onClick}
      className={`flex-1 rounded-xl p-3 md:p-6 shadow-lg hover:-translate-y-1 transition-all duration-300 w-full border
        ${onClick ? "cursor-pointer hover:bg-gris/10 dark:hover:bg-oscuro/30" : ""} 
        ${isActive
          ? "bg-lila/10 border-lila/50 shadow-xl shadow-lila/30 text-blanco dark:bg-oscuro dark:border-lila/50 dark:shadow-lila/40 dark:text-blanco"
          : "bg-blanco border-gris/20 text-oscuro dark:bg-bg-card dark:border-lila/20 dark:text-blanco"}
      `}
      style={{ borderLeft: `8px solid ${accent}` }}
    >
      <div className="flex justify-between items-center mb-1 md:mb-2">
        <p className={`m-0 text-[10px] md:text-sm font-medium uppercase tracking-wider leading-tight
          ${isActive ? "text-blanco dark:text-lila-soft" : "text-gris dark:text-lila-soft"}`}>
          {label}
        </p>

        {icon && (
          typeof icon === "string" ? (
            <i className={`${icon} text-base md:text-xl shrink-0 ml-1
              ${isActive ? "text-blanco dark:text-lila-mid" : "text-gris dark:text-lila-mid"}`} />
          ) : (
            icon
          )
        )}
      </div>

      <p className={`my-1 md:my-2 text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight
        ${isActive ? "text-blanco dark:text-blanco" : "text-oscuro dark:text-blanco"}`}>
        {value}
      </p>

      <p className={`m-0 text-[10px] md:text-xs font-medium leading-snug
        ${isActive ? "text-blanco dark:text-text-muted" : "text-gris dark:text-text-muted"}`}>
        {sub}
      </p>
    </div>
  );
}