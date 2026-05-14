import { useState } from "react";
import Tarjetas from "../components/Tarjetas";
import Etiquetas from "../components/Etiquetas";
import ToolBar from "../components/ToolBar";
import AccionesTabla from "../components/AccionesTabla";
import Paginacion from "../components/Paginacion";
import Tabla from "../components/Tabla";
import Modal from "../components/Modal"; 
import ModalProductos from "../components/ModalProductos";
import FormProducto from "../components/FormProductos";

const mockData = [
  { 
    sku: "SKU-001", 
    nombre: "Playera Oversize", 
    departamento: "Caballero", 
    categoria: "Playeras", 
    marca: "Urban Style", 
    modelo: "Street-2024",
    descripcion: "Playera de corte relajado confeccionada en algodón premium de 250g. Ideal para un look urbano y cómodo.",
    pVenta: 200, 
    pCompra: 100, 
    estado: "Activo",
    inventario: [
      { talla: "XS", stock: 5 }, { talla: "S", stock: 15 }, { talla: "M", stock: 20 }, 
      { talla: "L", stock: 10 }, { talla: "XL", stock: 0 }
    ]
  },
  { 
    sku: "SKU-002", 
    nombre: "Pantalón Cargo", 
    departamento: "Caballero", 
    categoria: "Pantalones", 
    marca: "Urban Style", 
    modelo: "Cargo-X", 
    descripcion: "Pantalón técnico con múltiples bolsillos funcionales y ajuste en tobillos. Resistente y versátil.",
    pVenta: 450, 
    pCompra: 200, 
    estado: "Activo",
    inventario: [
      { talla: "28", stock: 0 }, { talla: "30", stock: 1 }, { talla: "32", stock: 2 }
    ]
  },
  { 
    sku: "SKU-003", 
    nombre: "Sudadera Hoodie", 
    departamento: "Unisex", 
    categoria: "Sudaderas", 
    marca: "Urban Style", 
    modelo: "Hood-W", 
    descripcion: "Sudadera con capucha y forro térmico. Diseño minimalista con bolsillo frontal tipo canguro.",
    pVenta: 600, 
    pCompra: 300, 
    estado: "Inactivo",
    inventario: [
      { talla: "S", stock: 0 }, { talla: "M", stock: 0 }, { talla: "L", stock: 0 }
    ]
  },
  { 
    sku: "SKU-004", 
    nombre: "Gorra Clásica", 
    departamento: "Unisex", 
    categoria: "Accesorios", 
    marca: "Urban Style", 
    modelo: "Cap-01", 
    descripcion: "Gorra de 6 paneles con visera curva y ajuste de hebilla metálica. Bordado frontal de alta calidad.",
    pVenta: 150, 
    pCompra: 70, 
    estado: "Activo",
    inventario: [{ talla: "Unitalla", stock: 15 }]
  },
  { 
    sku: "SKU-005", 
    nombre: "Tenis Urban", 
    departamento: "Dama", 
    categoria: "Calzado", 
    marca: "Urban Style", 
    modelo: "Sneak-1", 
    descripcion: "Calzado deportivo con suela de alta tracción y detalles en gamuza sintética. Estilo y confort diario.",
    pVenta: 800, 
    pCompra: 400, 
    estado: "Activo",
    inventario: [
      { talla: "22", stock: 4 }, { talla: "24", stock: 8 }, { talla: "26", stock: 2 }
    ]
  },
];

export default function Productos() {
  const [filtro, setFiltro] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [isModalVerAbierto, setIsModalVerAbierto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [isModalFormAbierto, setIsModalFormAbierto] = useState(false);
  const [productoAEditar, setProductoAEditar] = useState(null);
  
  const opcionesFiltroProductos = [
    { value: "", label: "Todos" },
    { value: "Activo", label: "Activos" },
    { value: "Inactivo", label: "Inactivos" }
  ];

  const encabezadosProductos = [
    "Sku", "Nombre", "Departamento", "Categoría", "Precio", "Stock", "Estado", "Acciones"
  ];

  const datosFiltrados = mockData
    .filter((row) => filtro === "" || row.estado === filtro)
    .filter((row) => (
      busqueda === "" || 
      row.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
      row.sku.toLowerCase().includes(busqueda.toLowerCase())
    ));

  const tooltipBaseClasses = "absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-oscuro text-blanco text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl z-50 pointer-events-none";

  const calcularStockTotal = (inventario) => {
    return inventario.reduce((acc, item) => acc + item.stock, 0);
  };

  const getColorStock = (stock) => {
    if (stock <= 10) return "text-rojo";       
    if (stock <= 30) return "text-amarillo";  
    return "text-verde";                      
  };

  const handleVerDetalles = (producto) => {
    setProductoSeleccionado(producto);
    setIsModalVerAbierto(true);
  };

  const handleNuevoProducto = () => {
    setProductoAEditar(null);
    setIsModalFormAbierto(true);
  };

  const handleEditarProducto = (producto) => {
    setProductoAEditar(producto);
    setIsModalVerAbierto(false); 
    setIsModalFormAbierto(true);
  };

  const handleGuardarProducto = (datos) => {
    console.log("Datos enviados al servidor:", datos);
    setIsModalFormAbierto(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6 text-blanco uppercase tracking-wide text-center sm:text-left">
        Catálogo de Productos
      </h1>

      <div className="flex flex-col xl:flex-row gap-6 mb-8 w-full">
        <div className="flex flex-col sm:flex-row gap-6 w-full xl:w-7/12">
          <Tarjetas label="Total productos" value="5,000" sub="+124 este mes" icon="bi bi-box-seam" />
          <Tarjetas label="Productos Activos" value="4,850" sub="97% del catálogo" accent="#28B463" icon="bi bi-check-circle" />
          <Tarjetas label="Productos Inactivos" value="150" sub="3% del catálogo" accent="#C0392B" icon="bi bi-x-circle" />
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

      <ToolBar 
        filtro={filtro} setFiltro={setFiltro} opcionesFiltro={opcionesFiltroProductos}
        busqueda={busqueda} setBusqueda={setBusqueda}
        placeholderBuscar="Buscar por SKU, nombre..." textoBoton="+ Producto"
        accionBoton={handleNuevoProducto}
      />

      <Tabla encabezados={encabezadosProductos}>
        {datosFiltrados.map((row, i) => {
          const stockTotal = calcularStockTotal(row.inventario);
          
          return (
            <tr key={i} className="border-b border-lila/5 hover:bg-oscuro/40 transition-colors text-white">
              <td className="p-4 text-center text-sm font-mono">{row.sku}</td>
              <td className="p-4 text-center text-sm font-medium text-blanco">{row.nombre}</td>
              <td className="p-4 text-center text-xs font-bold text-lila-soft uppercase tracking-wider">
                {row.departamento}
              </td>
              <td className="p-4 text-center">
                <Etiquetas contenido={row.categoria} />
              </td>
              <td className="p-4 text-center">${row.pVenta}</td>
              <td className={`p-4 text-center text-sm font-bold ${getColorStock(stockTotal)}`}>
                {stockTotal}
              </td>
              <td className="p-4 text-center">
                <Etiquetas contenido={row.estado} />
              </td>
              <td className="p-4 align-middle">
                <AccionesTabla 
                  onVer={() => handleVerDetalles(row)}
                  onEditar={() => handleEditarProducto(row)}
                  onEliminar={() => console.log("Eliminar", row.sku)}
                />
              </td>
            </tr>
          );
        })}
      </Tabla>
 
      <Paginacion totalRegistros={5000} onExportar={() => console.log("Exportando...")} />

      <Modal 
        isOpen={isModalVerAbierto} 
        onClose={() => setIsModalVerAbierto(false)} 
        ancho="max-w-4xl" 
      >
        {productoSeleccionado && (
          <ModalProductos 
            data={productoSeleccionado} 
            onEdit={() => handleEditarProducto(productoSeleccionado)}
            onDelete={() => console.log("Eliminar", productoSeleccionado.sku)}
          />
        )}
      </Modal>

      <Modal 
        isOpen={isModalFormAbierto} 
        onClose={() => setIsModalFormAbierto(false)} 
        ancho="max-w-3xl"
      >
        <FormProducto 
          data={productoAEditar} 
          onGuardar={handleGuardarProducto}
          onCancelar={() => setIsModalFormAbierto(false)}
        />
      </Modal>

    </div>
  );
}