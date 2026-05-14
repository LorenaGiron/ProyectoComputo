import { useState, useEffect } from "react";
import { api } from "../services/api";
import { uploadImageToCloudinary } from "../services/cloudinaryClient"; 

import Tarjetas from "../components/Tarjetas";
import Etiquetas from "../components/Etiquetas";
import ToolBar from "../components/ToolBar";
import AccionesTabla from "../components/AccionesTabla";
import Paginacion from "../components/Paginacion";
import Tabla from "../components/Tabla";
import Modal from "../components/Modal"; 
import ModalProductos from "../components/ModalProductos";
import FormProducto from "../components/FormProductos";


export default function Productos() {
  const [filtro, setFiltro] = useState("");
  const [busqueda, setBusqueda] = useState("");
  
  // Estados para la Base de Datos
  const [productosDB, setProductosDB] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Estados para Modales
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

  const fetchProductos = async () => {
    try {
      setCargando(true);
      const result = await api.get('/products');
      const datosReales = result.items || result.data?.items || (Array.isArray(result) ? result : []);
      setProductosDB(datosReales);
    } catch (error) {
      console.error("Error al cargar los productos:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const datosFiltrados = productosDB
    .filter((row) => {
      const estadoString = row.activo !== false ? "Activo" : "Inactivo";
      return filtro === "" || estadoString === filtro;
    })
    .filter((row) => (
      busqueda === "" || 
      row.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
      (row.sku && row.sku.toLowerCase().includes(busqueda.toLowerCase()))
    ));

  const totalProd = productosDB.length;
  const activosProd = productosDB.filter(p => p.activo !== false).length;
  const inactivosProd = productosDB.filter(p => p.activo === false).length;

  // Cálculo de los porcentajes para las tarjetas superiores
  const activosPorc = totalProd > 0 ? Math.round((activosProd / totalProd) * 100) : 0;
  const inactivosPorc = totalProd > 0 ? Math.round((inactivosProd / totalProd) * 100) : 0;

  // Cálculo de porcentajes para la barra de categorías
  const getStatsCategoria = (nomCat) => {
    const cant = productosDB.filter(p => p.categoria === nomCat).length;
    const porc = totalProd > 0 ? Math.round((cant / totalProd) * 100) : 0;
    return { cant, porc };
  };

  const catPlayeras = getStatsCategoria("Playeras");
  const catPantalones = getStatsCategoria("Pantalones");
  const catSudaderas = getStatsCategoria("Sudaderas");
  const catOtrosPorc = Math.max(0, 100 - (catPlayeras.porc + catPantalones.porc + catSudaderas.porc));
  const catOtrosCant = Math.max(0, totalProd - (catPlayeras.cant + catPantalones.cant + catSudaderas.cant));

  const tooltipBaseClasses = "absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-oscuro text-blanco text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl z-50 pointer-events-none";

  const calcularStockTotal = (inventario) => {
    if (!Array.isArray(inventario)) return 0;
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
    const productoMapeado = {
      ...producto,
      estado: producto.activo !== false ? "Activo" : "Inactivo"
    };
    setProductoAEditar(productoMapeado);
    setIsModalVerAbierto(false); 
    setIsModalFormAbierto(true);
  };

  const handleGuardarProducto = async (datosFormulario) => {
    if (guardando) return;
    try {
      setGuardando(true);
      let imageUrl = datosFormulario.imagen;

      if (datosFormulario.imagen instanceof File) {
        imageUrl = await uploadImageToCloudinary(datosFormulario.imagen);
      }

      const stockCalculado = calcularStockTotal(datosFormulario.inventario);

      const payload = {
        sku: datosFormulario.sku || `SKU-${Date.now().toString().slice(-6)}`, 
        nombre: datosFormulario.nombre,
        departamento: datosFormulario.departamento,
        categoria: datosFormulario.categoria,
        marca: datosFormulario.marca,
        modelo: datosFormulario.modelo,
        descripcion: datosFormulario.descripcion,
        precioCompra: Number(datosFormulario.pCompra),
        precioVenta: Number(datosFormulario.pVenta),
        stock: stockCalculado, 
        activo: datosFormulario.estado === "Activo",
        inventario: datosFormulario.inventario,
        imagen: imageUrl 
      };

      if (productoAEditar && productoAEditar.id) {
        await api.patch(`/products/${productoAEditar.id}`, payload);
      } else {
        await api.post('/products', payload);
      }

      setIsModalFormAbierto(false);
      await fetchProductos();
      alert("¡Producto guardado exitosamente!");
    } catch (error) {
      console.error("Error:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarProducto = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      try {
        await api.delete(`/products/${id}`);
        await fetchProductos(); 
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6 text-blanco uppercase tracking-wide text-center sm:text-left">
        Catálogo de Productos
      </h1>

      <div className="flex flex-col xl:flex-row gap-6 mb-8 w-full">
        <div className="flex flex-col sm:flex-row gap-6 w-full xl:w-7/12">
          <Tarjetas label="Total productos" value={totalProd} sub="Registrados" icon="bi bi-box-seam" />
          
          <Tarjetas 
            label="Productos Activos" 
            value={activosProd} 
            sub={`${activosPorc}% del catálogo`} 
            accent="#28B463" 
            icon="bi bi-check-circle" 
          />
          <Tarjetas 
            label="Productos Inactivos" 
            value={inactivosProd} 
            sub={`${inactivosPorc}% del catálogo`} 
            accent="#C0392B" 
            icon="bi bi-x-circle" 
          />
        </div>

        <div className="bg-bg-card rounded-xl p-6 border border-lila/10 shadow-lg relative w-full xl:w-5/12 text-white">
          <p className="m-0 text-sm text-lila-soft">Distribución por Categoría</p>
          <div className="flex h-7 mt-4 w-full relative overflow-visible font-medium text-white">
            <div style={{width: `${catPlayeras.porc}%`}} className="bg-[#7C6AF7] rounded-l-md hover:opacity-80 transition-opacity cursor-help relative group">
              <span className={tooltipBaseClasses}>Playeras: {catPlayeras.cant} ({catPlayeras.porc}%)</span>
            </div>
            <div style={{width: `${catPantalones.porc}%`}} className="bg-[#9D4A70] hover:opacity-80 transition-opacity cursor-help relative group">
              <span className={tooltipBaseClasses}>Pantalones: {catPantalones.cant} ({catPantalones.porc}%)</span>
            </div>
            <div style={{width: `${catSudaderas.porc}%`}} className="bg-[#4A55A2] hover:opacity-80 transition-opacity cursor-help relative group">
              <span className={tooltipBaseClasses}>Sudaderas: {catSudaderas.cant} ({catSudaderas.porc}%)</span>
            </div>
            <div style={{width: `${catOtrosPorc}%`}} className="bg-[#4AC0B6] rounded-r-md hover:opacity-80 transition-opacity cursor-help relative group">
              <span className={tooltipBaseClasses}>Otros: {catOtrosCant} ({catOtrosPorc}%)</span>
            </div>
          </div>
          <div className="flex justify-between text-xs text-text-muted mt-2 font-medium">
            <span style={{width: `${catPlayeras.porc}%`}} className="text-center">{catPlayeras.porc}%</span>
            <span style={{width: `${catPantalones.porc}%`}} className="text-center">{catPantalones.porc}%</span>
            <span style={{width: `${catSudaderas.porc}%`}} className="text-center">{catSudaderas.porc}%</span>
            <span style={{width: `${catOtrosPorc}%`}} className="text-center">{catOtrosPorc}%</span>
          </div>
        </div>
      </div>

      <ToolBar 
        filtro={filtro} setFiltro={setFiltro} opcionesFiltro={opcionesFiltroProductos}
        busqueda={busqueda} setBusqueda={setBusqueda}
        placeholderBuscar="Buscar por SKU, nombre..." textoBoton="+ Producto"
        accionBoton={handleNuevoProducto}
      />

      {cargando ? (
        <div className="p-20 text-center text-lila-soft italic">Cargando catálogo...</div>
      ) : (
        <Tabla encabezados={encabezadosProductos}>
          {datosFiltrados.map((row, i) => {
            const stockTotal = calcularStockTotal(row.inventario);
            const estadoTexto = row.activo !== false ? "Activo" : "Inactivo";
            
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
                <td className="p-4 text-center">${row.precioVenta || row.pVenta}</td>
                <td className={`p-4 text-center text-sm font-bold ${getColorStock(stockTotal)}`}>
                  {stockTotal}
                </td>
                <td className="p-4 text-center">
                  <Etiquetas contenido={estadoTexto} />
                </td>
                <td className="p-4 align-middle text-center">
                  <AccionesTabla 
                    onVer={() => handleVerDetalles(row)}
                    onEditar={() => handleEditarProducto(row)}
                    onEliminar={() => handleEliminarProducto(row.id)}
                  />
                </td>
              </tr>
            );
          })}
        </Tabla>
      )}
 
      <Paginacion totalRegistros={totalProd} onExportar={() => console.log("Exportando...")} />

      {/* MODALES */}
      <Modal isOpen={isModalVerAbierto} onClose={() => setIsModalVerAbierto(false)} ancho="max-w-4xl">
        {productoSeleccionado && (
          <ModalProductos 
            data={productoSeleccionado} 
            onEdit={() => handleEditarProducto(productoSeleccionado)}
            onDelete={() => handleEliminarProducto(productoSeleccionado.id)}
          />
        )}
      </Modal>

      <Modal isOpen={isModalFormAbierto} onClose={() => !guardando && setIsModalFormAbierto(false)} ancho="max-w-3xl">
        <div className="relative">
          {guardando && (
            <div className="absolute inset-0 bg-oscuro/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-2xl">
              <i className="bi bi-arrow-repeat animate-spin text-4xl text-lila mb-2"></i>
              <p className="text-blanco font-bold">Guardando producto...</p>
            </div>
          )}
          <FormProducto 
            data={productoAEditar} 
            onGuardar={handleGuardarProducto}
            onCancelar={() => setIsModalFormAbierto(false)}
          />
        </div>
      </Modal>
    </div>
  );
}