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
import ModalConfirmacion from "../components/ModalConfirmacion";
import BarraCategorias from "../components/BarraCategorias";

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

  const [modalConf, setModalConf] = useState({
    isOpen: false,
    tipo: "confirmar",
    titulo: "",
    mensaje: "",
    textoConfirmar: "",
    onConfirmar: () => {}
  });

  const opcionesFiltroProductos = [
    { value: "", label: "Todos" },
    { value: "Activo", label: "Activos" },
    { value: "Inactivo", label: "Inactivos" }
  ];

  const encabezadosProductos = [
    "Sku", "Nombre", "Departamento", "Categoría", "Precio", "Stock", "Estado", "Acciones"
  ];

  const fetchProductos = async (silencioso = false) => {
    try {
      if (!silencioso) setCargando(true); 
      
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
      pCompra: producto.precioCompra, 
      pVenta: producto.precioVenta,
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
      await fetchProductos(true);
      
      setModalConf({
        isOpen: true,
        tipo: "exito",
        titulo: "Operación Exitosa",
        mensaje: "El producto se ha guardado correctamente.",
      });

    } catch (error) {
      console.error("Error:", error);
      
      setModalConf({
        isOpen: true,
        tipo: "confirmar",
        titulo: "Error al guardar",
        mensaje: `No se pudo guardar: ${error.message}`,
        textoConfirmar: "Entendido",
        onConfirmar: () => setModalConf({ isOpen: false })
      });

    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarProducto = (id) => {
    setIsModalVerAbierto(false);

    setModalConf({
      isOpen: true,
      tipo: "eliminar",
      titulo: "Eliminar Producto",
      mensaje: "¿Estás seguro de que deseas eliminar este producto de forma permanente? Esta acción no se puede deshacer.",
      textoConfirmar: "Eliminar",
      onConfirmar: async () => {
        try {
          await api.delete(`/products/${id}`);
          await fetchProductos(true); 
          setModalConf({ isOpen: false }); 
        } catch (error) {
          console.error("Error al eliminar:", error);
          setModalConf({
            isOpen: true,
            tipo: "confirmar",
            titulo: "Error",
            mensaje: "No se pudo eliminar el producto.",
            textoConfirmar: "Entendido",
            onConfirmar: () => setModalConf({ isOpen: false })
          });
        }
      }
    });
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

        <BarraCategorias productosDB={productosDB} />
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
 
      <Paginacion
        totalRegistros={totalProd}
        exportTitulo="Productos"
        exportColumnas={[
          { header: "SKU",          key: "sku",          width: 15 },
          { header: "Nombre",       key: "nombre",       width: 28 },
          { header: "Departamento", key: "departamento", width: 16 },
          { header: "Categoría",    key: "categoria",    width: 16 },
          { header: "Precio",       key: "precio",       width: 14 },
          { header: "Stock",        key: "stock",        width: 10 },
          { header: "Estado",       key: "estado",       width: 12 },
        ]}
        exportFilas={datosFiltrados.map((p) => ({
          sku:          p.sku,
          nombre:       p.nombre,
          departamento: p.departamento,
          categoria:    p.categoria,
          precio:       `$${Number(p.precioVenta || p.pVenta || 0).toLocaleString("es-MX")}`,
          stock:        calcularStockTotal(p.inventario),
          estado:       p.activo !== false ? "Activo" : "Inactivo",
        }))}
      />

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

      {modalConf.isOpen && (
        <ModalConfirmacion
          tipo={modalConf.tipo}
          titulo={modalConf.titulo}
          mensaje={modalConf.mensaje}
          textoConfirmar={modalConf.textoConfirmar}
          onConfirmar={modalConf.onConfirmar}
          onCancelar={() => setModalConf({ ...modalConf, isOpen: false })}
        />
      )}

    </div>
  );
}