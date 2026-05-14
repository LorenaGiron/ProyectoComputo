import Etiquetas from "./Etiquetas";
import Boton from "./Boton";

export default function ModalProductos({ data, onEdit, onDelete }) {
  // Cálculo del stock total
  const stockTotal = data.inventario.reduce((acc, item) => acc + item.stock, 0);

  return (
    <div className="p-4 md:p-6 text-blanco font-poppins h-full">
      
      <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-stretch">
        
        {/* Nombre y etiquetas (Pantalla pequeña)*/}
        <div className="order-1 md:hidden mb-2 text-center">
          <h2 className="text-2xl font-bold leading-tight mb-3 text-blanco">{data.nombre}</h2>
          <div className="flex flex-wrap justify-center gap-2">
            <Etiquetas contenido={data.estado} />
            {data.departamento && <Etiquetas contenido={data.departamento} />}
          </div>
        </div>

        {/* Imagen y Descripción */}
        <div className="w-full md:w-5/12 flex flex-col gap-4 order-2 md:order-0">
          
          {/* Imagen */}
          <div className="w-full aspect-square rounded-2xl bg-white p-4 flex items-center justify-center border border-lila/20 shadow-lg shrink-0">
            <img 
              src={data.imagen || "https://via.placeholder.com/400"} 
              alt={data.nombre} 
              className="w-full h-full object-contain hover:scale-105 transition-transform duration-300" 
            />
          </div>

          {/* Descripción*/}
          {data.descripcion && (
            <div className="bg-oscuro/20 rounded-xl p-4 border border-lila/5 flex-1">
              <p className="text-sm text-lila-soft leading-relaxed text-justify italic">
                "{data.descripcion}"
              </p>
            </div>
          )}
        </div>

        {/* Información */}
        <div className="w-full md:w-7/12 flex flex-col order-3 md:order-0">
          
          {/* Nombre y Etiquetas*/}
          <div className="hidden md:block mb-6">
            <h2 className="text-3xl font-bold leading-tight mb-3 text-blanco">{data.nombre}</h2>
            <div className="flex flex-wrap gap-2">
              <Etiquetas contenido={data.estado} />
              {data.departamento && <Etiquetas contenido={data.departamento} />}
            </div>
          </div>

          {/* Precios y Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-oscuro/20 rounded-xl p-4 border border-lila/5 mb-6">
            <div className="text-center pb-2 sm:pb-0 border-b sm:border-b-0 sm:border-r border-lila/10">
              <p className="text-xs text-lila-soft mb-1 uppercase tracking-wider">STOCK TOTAL</p>
              <p className="font-bold text-xl">{stockTotal}</p>
            </div>
            <div className="text-center py-2 sm:py-0 border-b sm:border-b-0 sm:border-r border-lila/10">
              <p className="text-xs text-lila-soft mb-1 uppercase tracking-wider">PRECIO COMPRA</p>
              <p className="font-bold text-xl text-azul">${data.pCompra || '0'}</p>
            </div>
            <div className="text-center pt-2 sm:pt-0">
              <p className="text-xs text-lila-soft mb-1 uppercase tracking-wider">PRECIO VENTA</p>
              <p className="font-bold text-xl text-verde">${data.pVenta || '0'}</p>
            </div>
          </div>

          {/* Existencias por Talla*/}
          <div className="mb-8">
            <p className="text-xs font-bold text-lila-soft mb-4 uppercase tracking-wider flex items-center gap-2">
              <i className="bi bi-box-seam"></i> Existencias por Talla
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
              {data.inventario.map((item, index) => (
                <div 
                  key={index}
                  className={`flex flex-col items-center justify-center h-14 rounded-xl border transition-all
                    ${item.stock > 0 
                      ? 'border-lila/30 bg-lila/5 shadow-sm' 
                      : 'border-white/5 bg-white/5 opacity-40'}`}
                >
                  <span className="text-sm font-bold text-blanco uppercase">{item.talla}</span>
                  <span className={`text-xs font-medium ${item.stock <= 5 && item.stock > 0 ? 'text-amarillo' : 'text-lila-mid'}`}>
                    {item.stock} pz
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Ficha Técnica */}
          <div className="space-y-1 mt-auto bg-oscuro/20 p-4 rounded-xl border border-lila/5">
            {[
              { label: "SKU", value: data.sku, mono: true },
              { label: "Categoría", value: data.categoria },
              { label: "Marca", value: data.marca },
              { label: "Modelo", value: data.modelo }
            ].map((item, idx, arr) => (
              <div 
                key={item.label} 
                className={`flex justify-between py-2 ${idx !== arr.length - 1 ? 'border-b border-lila/5' : ''}`}
              >
                <span className="text-lila-mid text-xs font-bold uppercase tracking-wider">{item.label}</span>
                <span className={`text-sm ${item.mono ? 'font-mono bg-lila/10 px-2 py-0.5 rounded text-lila-soft' : 'text-blanco font-medium'}`}>
                  {item.value || 'N/A'}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Footer con Botones */}
      <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3 pt-6 border-t border-lila/20 mt-6">
        <div className="flex justify-start order-2 sm:order-1">
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-3 order-1 sm:order-2">
          <Boton variante="claro" onClick={onEdit} className="w-full sm:w-auto">
            <i className="bi bi-pencil-square"></i> 
            <span>Editar</span>
          </Boton>
          <Boton variante="claro" onClick={onDelete} className="w-full sm:w-auto">
            <i className="bi bi-trash"></i> 
            <span>Eliminar</span>
          </Boton>
        </div>
      </div>

    </div>
  );
}