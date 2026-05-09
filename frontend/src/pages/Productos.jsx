import { useState } from "react";
import Tarjetas from "../components/Tarjetas";
import Etiquetas from "../components/Etiquetas";
import ToolBar from "../components/ToolBar";
import AccionesTabla from "../components/AccionesTabla";
import Paginacion from "../components/Paginacion";
import Tabla from "../components/Tabla";

const mockData = [
  { sku: "SKU-001", nombre: "Playera Oversize", categoria: "Playeras", marca: "Urban Style", modelo: "Street-2024", pVenta: 200, stock: 50, estado: "Activo" },
  { sku: "SKU-002", nombre: "Pantalón Cargo", categoria: "Pantalones", marca: "Urban Style", modelo: "Cargo-X", pVenta: 450, stock: 3, estado: "Activo" },
  { sku: "SKU-003", nombre: "Sudadera Hoodie", categoria: "Sudaderas", marca: "Urban Style", modelo: "Hood-W", pVenta: 600, stock: 0, estado: "Inactivo" },
  { sku: "SKU-004", nombre: "Gorra Clásica", categoria: "Accesorios", marca: "Urban Style", modelo: "Cap-01", pVenta: 150, stock: 15, estado: "Activo" },
  { sku: "SKU-005", nombre: "Tenis Urban", categoria: "Calzado", marca: "Urban Style", modelo: "Sneak-1", pVenta: 800, stock: 25, estado: "Activo" },
];

export default function Productos() {
  const [filtro, setFiltro] = useState("");
  const [busqueda, setBusqueda] = useState("");
  
  const opcionesFiltroProductos = [
    { value: "", label: "Todos" },
    { value: "Activo", label: "Activos" },
    { value: "Inactivo", label: "Inactivos" }
  ];

  const encabezadosProductos = [
    "Sku", "Nombre", "Categoría", "Marca", "Modelo", "Precio", "Stock", "Estado", "Acciones"
  ];

  const datosFiltrados = mockData
    .filter((row) => filtro === "" || row.estado === filtro)
    .filter((row) => busqueda === "" || row.nombre.toLowerCase().includes(busqueda.toLowerCase()) || row.sku.toLowerCase().includes(busqueda.toLowerCase()));

  const tooltipBaseClasses = "absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-oscuro text-blanco text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl z-50 pointer-events-none";

  const getColorStock = (stock) => {
    if (stock <= 10) return "text-rojo";       
    if (stock <= 30) return "text-amarillo";  
    return "text-verde";                      
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6 text-blanco uppercase tracking-wide text-center sm:text-left">
        Catálogo de Productos
      </h1>

      {/* Tarjetas y Gráfica */}
      <div className="flex flex-col xl:flex-row gap-6 mb-8 w-full">
        <div className="flex flex-col sm:flex-row gap-6 w-full xl:w-7/12">
          <Tarjetas 
            label="Total productos" 
            value="5,000" 
            sub="+124 este mes" 
            icon="bi bi-box-seam"
          />
          <Tarjetas 
            label="Productos Activos" 
            value="4,850" 
            sub="97% del catálogo" 
            accent="#28B463" 
            icon="bi bi-check-circle" 
          />
          <Tarjetas 
            label="Productos Inactivos" 
            value="150" 
            sub="3% del catálogo" 
            accent="#C0392B" 
            icon="bi bi-x-circle" 
          />
        </div>

        <div className="bg-bg-card rounded-xl p-6 border border-lila/10 shadow-lg relative w-full xl:w-5/12 text-white">
          <p className="m-0 text-sm text-lila-soft">Categoría</p>
          <div className="flex h-7 mt-4 w-full relative overflow-visible font-medium text-white">
            <div style={{width: "35%"}} className="bg-[#7C6AF7] rounded-l-md hover:opacity-80 transition-opacity cursor-help relative group">
              <span className={tooltipBaseClasses}>Playeras: 1,250 (35%)</span>
            </div>
            <div style={{width: "42%"}} className="bg-[#9D4A70] hover:opacity-80 transition-opacity cursor-help relative group">
              <span className={tooltipBaseClasses}>Pantalones: 1,500 (42%)</span>
            </div>
            <div style={{width: "20%"}} className="bg-[#4A55A2] hover:opacity-80 transition-opacity cursor-help relative group">
              <span className={tooltipBaseClasses}>Sudaderas: 714 (20%)</span>
            </div>
            <div style={{width: "3%"}} className="bg-[#4AC0B6] rounded-r-md hover:opacity-80 transition-opacity cursor-help relative group">
              <span className={tooltipBaseClasses}>Otros: 107 (3%)</span>
            </div>
          </div>
          <div className="flex justify-between text-xs text-text-muted mt-2 font-medium">
            <span style={{width: "35%"}} className="text-center">35%</span>
            <span style={{width: "42%"}} className="text-center">42%</span>
            <span style={{width: "20%"}} className="text-center">20%</span>
            <span style={{width: "3%"}} className="text-center">3%</span>
          </div>
        </div>
      </div>

      {/* Buscador y Filtros */} 
      <ToolBar 
        filtro={filtro}
        setFiltro={setFiltro}
        opcionesFiltro={opcionesFiltroProductos}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        placeholderBuscar="Buscar por SKU, nombre, categoría..."
        textoBoton="+ Producto"
        accionBoton={() => console.log("Clic en agregar producto")}
      />

      {/* Tabla */}
      <Tabla encabezados={encabezadosProductos}>
        {datosFiltrados.map((row, i) => (
          <tr key={i} className="border-b border-lila/5 hover:bg-oscuro/40 transition-colors text-white">
            
            <td className="p-4 text-center text-sm whitespace-nowrap">{row.sku}</td>
            <td className="p-4 text-center text-sm font-medium text-blanco whitespace-nowrap">{row.nombre}</td>
            
            <td className="p-4 text-center whitespace-nowrap">
              <span className="inline-block w-28 text-center uppercase py-1 rounded-full text-xs font-medium tracking-wide bg-lila-soft/20 text-lila-soft border border-lila-soft/30 shadow-sm">
                {row.categoria}
              </span>
            </td>
            
            <td className="p-4 text-center text-sm whitespace-nowrap">{row.marca}</td>
            <td className="p-4 text-center text-sm whitespace-nowrap">{row.modelo}</td>
            
            <td className="p-4 text-center whitespace-nowrap">${row.pVenta}</td>
            
            <td className={`p-4 text-center text-sm font-bold whitespace-nowrap ${getColorStock(row.stock)}`}>
              {row.stock}
            </td>
            
            <td className="p-4 text-center whitespace-nowrap">
              <Etiquetas contenido={row.estado} />
            </td>
            
            <td className="p-4 align-middle whitespace-nowrap">
              <AccionesTabla 
                onVer={() => console.log("Ver producto", row.sku)}
                onEditar={() => console.log("Editar producto", row.sku)}
                onEliminar={() => console.log("Eliminar producto", row.sku)}
              />
            </td>

          </tr>
        ))}
      </Tabla>
 
      {/* Footer */}
      <Paginacion totalRegistros={5000} onExportar={() => console.log("Exportando...")} />
    </div>
  );
}