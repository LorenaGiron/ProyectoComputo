export default function Tarjetas({ label, value, sub, accent = "#7C6AF7", icon }) {
  return (
    <div
      className="flex-1 bg-bg-card rounded-xl p-6 border border-lila/10 shadow-lg hover:-translate-y-1 transition-transform w-full"
      style={{ borderLeft: `4px solid ${accent}` }}
    >
      {/* Etiqueta e Ícono  */}
      <div className="flex justify-between items-center mb-2">
        <p className="m-0 text-sm text-lila-soft font-medium uppercase tracking-wider">
          {label}
        </p>
        
        {icon && (
          <i className={`${icon} text-xl text-lila-mid`}></i>
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