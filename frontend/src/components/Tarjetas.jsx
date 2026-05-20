export default function Tarjetas({ label, value, sub, accent = "#7C6AF7", icon, onClick, isActive }) {
  return (
    <div
      onClick={onClick}
      className={`flex-1 rounded-xl p-6 shadow-lg hover:-translate-y-1 transition-all duration-300 w-full border
        ${onClick ? "cursor-pointer" : ""} 
        ${isActive ? "bg-oscuro border-lila/50 shadow-lila/10" : "bg-bg-card border-lila/10"}
      `}
      style={{ borderLeft: `4px solid ${accent}` }}
    >
      {/* Etiqueta e Ícono  */}
      <div className="flex justify-between items-center mb-2">
        <p className="m-0 text-sm text-lila-soft font-medium uppercase tracking-wider">
          {label}
        </p>
        
        {icon && (
          typeof icon === "string" ? (
            <i className={`${icon} text-xl text-lila-mid`}></i>
          ) : (
            icon
          )
        )}
      </div>
      
      {/* Valor principal */}
      <p className="my-2 text-3xl lg:text-4xl font-bold text-blanco tracking-tight">
        {value}
      </p>
      
      {/* Subtexto */}
      <p className="m-0 text-xs text-text-muted font-medium">
        {sub}
      </p>
    </div>
  );
}