import Etiquetas from "./Etiquetas";
import Boton from "./Boton";

export default function ModalProductos({ data, onEdit, onDelete }) {
  // Cálculo del stock total
  const stockTotal = data.inventario?.reduce((acc, item) => acc + item.stock, 0) || 0;
  const textoEstado = data.activo !== false ? "Activo" : "Inactivo";

  const abrUnidad = (() => {
    const u = data.unidad || "Pieza";
    switch(u) {
      case "Pieza": return "pz";
      case "Par": return "par";
      case "Caja": return "cj";
      case "Paquete": return "pq";
      default: return "u";
    }
  })();

  return (
    <div className={`
      px-4 pb-4 md:px-6 md:pb-6 pt-0font-poppins h-full transition-colors duration-300
      bg-transparent text-oscuro
      dark:bg-transparent dark:text-blanco
    `}>
      
      <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-stretch">
        
        {/* Nombre y etiquetas (Pantalla pequeña) */}
        <div className="order-1 md:hidden mb-2 text-center">
          <h2 className={`
            text-2xl font-bold leading-tight mb-3 transition-colors
            text-morado
            dark:text-blanco
          `}>
            {data.nombre}
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            <Etiquetas contenido={textoEstado} />
            {data.departamento && <Etiquetas contenido={data.departamento} />}
          </div>
        </div>

        {/* Imagen y Descripción */}
        <div className="w-full md:w-5/12 flex flex-col gap-4 order-2 md:order-0">
          
          {/* Tarjeta de la Imagen */}
          <div className={`
            w-full aspect-square rounded-2xl p-4 flex items-center justify-center shadow-md shrink-0 transition-colors
            bg-blanco border border-morado/20
            dark:bg-white dark:border-lila/20
          `}>
            <img 
              src={data.imagen || "https://via.placeholder.com/400"} 
              alt={data.nombre} 
              className="w-full h-full object-contain hover:scale-105 transition-transform duration-300" 
            />
          </div>

          {/* Descripción */}
          {data.descripcion && (
            <div className={`
              rounded-xl p-4 border transition-colors shadow-sm
              bg-blanco border-morado/20 text-oscuro
              dark:bg-oscuro/20 dark:border-lila/5 dark:text-blanco dark:shadow-none
            `}>
              <p className="text-sm leading-relaxed text-justify italic opacity-90">
                "{data.descripcion}"
              </p>
            </div>
          )}
        </div>

        {/* Información */}
        <div className="w-full md:w-7/12 flex flex-col order-3 md:order-0">
          
          {/* Nombre y Etiquetas (Pantalla grande) */}
          <div className="hidden md:block mb-6">
            <h2 className={`
              text-3xl font-bold leading-tight mb-3 transition-colors
              text-morado
              dark:text-blanco
            `}>
              {data.nombre}
            </h2>
            <div className="flex flex-wrap gap-2">
              <Etiquetas contenido={textoEstado} />
              {data.departamento && <Etiquetas contenido={data.departamento} />}
            </div>
          </div>

          {/* Grid de Precios y Stock */}
          <div className={`
            grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 rounded-xl p-4 border transition-colors shadow-sm
            bg-blanco border-morado/20 text-oscuro
            dark:bg-oscuro/20 dark:border-lila/5 dark:text-blanco dark:shadow-none
          `}>
            <div className="text-center pb-2 sm:pb-0 border-b sm:border-b-0 sm:border-r border-morado/10 dark:border-lila/10">
              <p className={`
                text-[10px] font-bold uppercase tracking-wider transition-colors
                text-morado
                dark:text-lila-soft
              `}>STOCK TOTAL</p>
              <p className="font-bold text-xl">{stockTotal}</p>
            </div>
            <div className="text-center pb-2 sm:pb-0 border-b sm:border-b-0 sm:border-r border-morado/10 dark:border-lila/10">
              <p className={`
                text-[10px] font-bold uppercase tracking-wider transition-colors
                text-morado
                dark:text-lila-soft
              `}>STOCK MÍNIMO</p>
              <p className={`font-bold text-xl transition-colors ${stockTotal <= (data.stockMinimo || 0) ? 'text-rojo animate-pulse' : ''}`}>
                {data.stockMinimo || 0}
              </p>
            </div>
            <div className="text-center pt-2 sm:pt-0 sm:border-r border-morado/10 dark:border-lila/10">
              <p className={`
                text-[10px] font-bold uppercase tracking-wider transition-colors
                text-morado
                dark:text-lila-soft
              `}>P. COMPRA</p>
              <p className="font-bold text-xl text-azul">${data.precioCompra || '0'}</p>
            </div>
            <div className="text-center pt-2 sm:pt-0">
              <p className={`
                text-[10px] font-bold uppercase tracking-wider transition-colors
                text-morado
                dark:text-lila-soft
              `}>P. VENTA</p>
              <p className="font-bold text-xl text-verde">${data.precioVenta || '0'}</p>
            </div>
          </div>

          {/* Existencias por Talla / Unidad */}
          <div className="mb-8">
            <p className={`
              text-xs font-bold mb-4 uppercase tracking-wider flex items-center gap-2 transition-colors
              text-morado
              dark:text-lila-soft
            `}>
              <i className="bi bi-box-seam"></i> Existencias de Inventario
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
              {data.inventario?.map((item, index) => (
                <div 
                  key={index}
                  className={`
                    flex flex-col items-center justify-center h-14 rounded-xl border transition-all
                    ${item.stock > 0 
                      ? `shadow-sm bg-blanco border-morado/30 text-oscuro
                         dark:border-lila/30 dark:bg-lila/5 dark:text-blanco` 
                      : `bg-gris/5 border-gris/10 opacity-40 text-gris
                         dark:border-white/5 dark:bg-white/5 dark:text-lila-soft`}
                  `}
                >
                  <span className="text-sm font-bold uppercase">{item.talla}</span>
                  <span className={`text-xs font-medium ${item.stock <= 5 && item.stock > 0 ? 'text-amarillo' : 'opacity-80'}`}>
                    {item.stock} {abrUnidad}
                  </span>
                </div>
              ))}
              {(!data.inventario || data.inventario.length === 0) && (
                <div className="col-span-full text-center text-sm italic py-2 opacity-60">
                  Sin registros de inventario
                </div>
              )}
            </div>
          </div>

          {/* Ficha Técnica */}
          <div className={`
            space-y-1 mt-auto rounded-xl p-4 border transition-colors shadow-sm
            bg-blanco border-morado/20 text-oscuro
            dark:bg-oscuro/20 dark:border-lila/5 dark:text-blanco dark:shadow-none
          `}>
            {[
              { label: "SKU", value: data.sku, mono: true },
              { label: "Proveedor", value: data.supplierNombre || "Sin asignar" },
              { label: "Unidad", value: data.unidad || "Pieza" },
              { label: "Categoría", value: data.categoria },
              { label: "Marca", value: data.marca },
              { label: "Modelo", value: data.modelo }
            ].map((item, idx, arr) => (
              <div 
                key={item.label} 
                className={`flex justify-between items-center py-2 ${idx !== arr.length - 1 ? 'border-b border-morado/10 dark:border-lila/5' : ''}`}
              >
                <span className={`
                  text-xs font-bold uppercase tracking-wider w-1/3 transition-colors
                  text-morado
                  dark:text-lila-mid
                `}>{item.label}</span>
                <span className={`
                  text-sm text-right w-2/3 truncate 
                  ${item.mono 
                    ? `font-mono px-2 py-0.5 rounded inline-block w-auto ml-auto 
                       bg-morado/10 text-morado 
                       dark:bg-lila/10 dark:text-lila-soft` 
                    : 'font-medium'}
                `}>
                  {item.value || 'N/A'}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Footer con Botones */}
      <div className={`
        flex flex-col sm:grid sm:grid-cols-2 gap-3 pt-6 border-t mt-6 transition-colors
        border-morado/20
        dark:border-lila/20
      `}>
        <div className="flex justify-start order-2 sm:order-1">
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-3 order-1 sm:order-2">
          <Boton 
            variante="claro" 
            onClick={onEdit} 
            className="w-full sm:w-auto"
          >
            <i className="bi bi-pencil-square"></i> 
            <span>Editar</span>
          </Boton>

          <Boton 
            variante="oscuro" 
            onClick={onDelete} 
            className={`w-full sm:w-auto`}
          >
            <i className="bi bi-trash"></i> 
            <span>Eliminar</span>
          </Boton>
        </div>
      </div>

    </div>
  );
}