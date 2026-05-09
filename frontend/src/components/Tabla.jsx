export default function Tabla({ encabezados, children }) {
  return (
    <div className="bg-bg-card rounded-xl border border-lila/20 shadow-lg overflow-x-auto w-full">
      <table className="w-full border-collapse min-w-max">
        
        <thead>
          <tr className="bg-black/20">
            {encabezados.map((titulo, index) => (
              <th 
                key={index} 
                className="p-4 text-center text-sm font-bold text-lila-soft uppercase tracking-wider"
              >
                {titulo}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {children}
        </tbody>
        
      </table>
    </div>
  );
}