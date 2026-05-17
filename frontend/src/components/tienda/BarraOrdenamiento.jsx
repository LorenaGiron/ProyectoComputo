const opcionesOrden = [
  { value: "relevancia",  label: "Relevancia"           },
  { value: "precio_asc",  label: "Precio: menor a mayor" },
  { value: "precio_desc", label: "Precio: mayor a menor" },
  { value: "nombre_asc",  label: "Nombre: A - Z"         },
  { value: "nombre_desc", label: "Nombre: Z - A"         },
];

export default function BarraOrdenamiento({ total, ordenamiento, setOrdenamiento, vista, setVista }) {
  return (
    <div className="flex justify-between items-center gap-3 mb-4 flex-wrap">

      {/* Contador de resultados */}
      <p className="text-sm text-lila-soft">
        <b className="text-blanco tabular-nums">{total}</b> productos encontrados
      </p>

      <div className="flex items-center gap-2">

        {/* Toggle grid / lista */}
        <div className="flex items-center bg-bg-card border border-lila/20 rounded-lg p-0.5">
          <button
            onClick={() => setVista("grid")}
            title="Vista cuadrícula"
            className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
              vista === "grid"
                ? "bg-lila text-oscuro"
                : "text-lila-soft hover:text-blanco"
            }`}
          >
            <i className="bi bi-grid-3x3-gap-fill" />
          </button>
          <button
            onClick={() => setVista("lista")}
            title="Vista lista"
            className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
              vista === "lista"
                ? "bg-lila text-oscuro"
                : "text-lila-soft hover:text-blanco"
            }`}
          >
            <i className="bi bi-list-ul" />
          </button>
        </div>

        {/* Selector de ordenamiento */}
        <select
          value={ordenamiento}
          onChange={(e) => setOrdenamiento(e.target.value)}
          className="bg-bg-card text-lila border border-lila/20 rounded-lg px-3 py-2 text-xs font-medium outline-none hover:border-lila cursor-pointer"
        >
          {opcionesOrden.map((op) => (
            <option key={op.value} value={op.value} className="bg-oscuro">
              {op.label}
            </option>
          ))}
        </select>

      </div>
    </div>
  );
}
