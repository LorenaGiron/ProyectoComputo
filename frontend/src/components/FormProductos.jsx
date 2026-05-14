import { useState, useEffect } from "react";
import Input from "./Input";
import Boton from "./Boton";

export default function FormProductos({ data, onGuardar, onCancelar }) {
  const [formData, setFormData] = useState({
    sku: "", nombre: "", departamento: "", categoria: "", 
    marca: "", modelo: "", descripcion: "", pVenta: "", pCompra: "", estado: "Activo",
    inventario: [],
    imagen: null 
  });

  const [imagenPreview, setImagenPreview] = useState(null);

  const [tallaSeleccionada, setTallaSeleccionada] = useState("");
  const [stockInput, setStockInput] = useState("");

  useEffect(() => {
    if (data) {
      setFormData({ ...data, inventario: data.inventario || [], imagen: data.imagen || null });
      setImagenPreview(data.imagen || null); // Si ya trae imagen de la DB, la mostramos
    } else {
      setFormData({ sku: "", nombre: "", departamento: "", categoria: "", marca: "", modelo: "", descripcion: "", pVenta: "", pCompra: "", estado: "Activo", inventario: [], imagen: null });
      setImagenPreview(null); 
    }
  }, [data]);

  useEffect(() => {
    setTallaSeleccionada("");
  }, [formData.categoria]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Imagen
  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, imagen: file }));
      setImagenPreview(URL.createObjectURL(file));
    }
  };

  const obtenerTallasPorCategoria = (categoria) => {
    const superiores = ["Playeras", "Blusas", "Camisas", "Suéteres", "Sudaderas", "Chamarras", "Abrigos", "Vestidos"];
    const inferiores = ["Pantalones", "Faldas", "Shorts"];

    if (superiores.includes(categoria)) {
      return ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL"];
    }
    if (inferiores.includes(categoria)) {
      return ["24", "26", "28", "30", "32", "34", "36", "38", "40", "42", "44", "XXS", "XS", "S", "M", "L", "XL", "XXL"];
    }
    if (categoria === "Calzado") {
      return ["22", "22.5", "23", "23.5", "24", "24.5", "25", "25.5", "26", "26.5", "27", "27.5", "28", "28.5", "29", "29.5", "30", "31"];
    }
    
    return ["Unitalla"]; 
  };

  const opcionesTallasActuales = obtenerTallasPorCategoria(formData.categoria);

  const handleAgregarTalla = () => {
    if (!tallaSeleccionada || !stockInput) return; 
    
    const existe = formData.inventario.find(i => i.talla === tallaSeleccionada);
    let nuevoInventario;

    if (existe) {
      nuevoInventario = formData.inventario.map(i => 
        i.talla === tallaSeleccionada ? { ...i, stock: parseInt(stockInput) } : i
      );
    } else {
      nuevoInventario = [...formData.inventario, { talla: tallaSeleccionada, stock: parseInt(stockInput) }];
    }

    setFormData({ ...formData, inventario: nuevoInventario });
    setTallaSeleccionada(""); 
    setStockInput("");
  };

  const handleEliminarTalla = (tallaBorrar) => {
    setFormData({
      ...formData,
      inventario: formData.inventario.filter(i => i.talla !== tallaBorrar)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar(formData);
  };

  return (
    <div className="p-4 md:p-6 text-blanco font-poppins h-full">
          
      <div className="mb-6 border-b border-lila/20 pb-4 pr-14">
        <h2 className="text-2xl font-bold text-blanco">
          {data ? "Editar Producto" : "Nuevo Producto"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">

        {/* Imagen del Producto */}
        <div className="bg-oscuro/20 p-5 rounded-xl border border-lila/5">
          <h3 className="text-sm font-bold text-lila mb-4 flex items-center gap-2">
            <i className="bi bi-image"></i> Fotografía del Producto
          </h3>
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            
            {/* Contenedor de la vista previa */}
            <div className="w-32 h-32 shrink-0 bg-white rounded-xl border border-lila/20 flex items-center justify-center overflow-hidden shadow-inner">
              {imagenPreview ? (
                <img src={imagenPreview} alt="Preview" className="w-full h-full object-contain" />
              ) : (
                <i className="bi bi-camera text-4xl text-lila-soft/50"></i>
              )}
            </div>

            {/* Input para arrastrar o seleccionar archivo */}
            <div className="flex-1 w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-lila/30 rounded-xl cursor-pointer bg-lila/5 hover:bg-lila/10 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                  <i className="bi bi-cloud-arrow-up text-2xl text-lila mb-2"></i>
                  <p className="text-sm text-blanco font-medium">Haz clic para subir una imagen</p>
                  <p className="text-xs text-lila-soft mt-1">PNG, JPG o WEBP (Max. 5MB)</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/png, image/jpeg, image/webp" 
                  onChange={handleImagenChange} 
                />
              </label>
            </div>

          </div>
        </div>

        {/* Información General */}
        <div className="bg-oscuro/20 p-5 rounded-xl border border-lila/5">
          <h3 className="text-sm font-bold text-lila mb-4 flex items-center gap-2">
            <i className="bi bi-info-circle"></i> Información General
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <Input 
              label="Nombre del Producto" name="nombre" value={formData.nombre} 
              onChange={handleChange} requerido className="md:col-span-2" 
            />
            
            <Input 
              label="SKU / Código" name="sku" 
              value={data ? formData.sku : "Generado automáticamente"} 
              deshabilitado={true} 
            />
            
            <Input 
              label="Estado" name="estado" tipo="select" 
              opciones={["Activo", "Inactivo"]} 
              value={formData.estado} onChange={handleChange} 
            />
            
            <Input 
              label="Departamento" name="departamento" tipo="select" 
              opciones={["Dama", "Caballero", "Unisex"]} 
              value={formData.departamento} onChange={handleChange} requerido 
            />
            
            <Input 
              label="Categoría" name="categoria" tipo="select" 
              opciones={[
                "Playeras", "Blusas", "Camisas", "Suéteres", "Sudaderas", 
                "Chamarras", "Abrigos", "Vestidos", "Faldas", "Shorts", 
                "Pantalones", "Calzado", "Accesorios"
              ]} 
              value={formData.categoria} onChange={handleChange} requerido 
            />
            
            <Input label="Marca" name="marca" value={formData.marca} onChange={handleChange} />
            <Input label="Modelo" name="modelo" value={formData.modelo} onChange={handleChange} />
          </div>
        </div>

        {/* Descripción */}
        <div className="bg-oscuro/20 p-5 rounded-xl border border-lila/5">
          <h3 className="text-sm font-bold text-lila mb-4 flex items-center gap-2">
            <i className="bi bi-card-text"></i> Descripción
          </h3>
          <Input 
            label="Descripción del Producto" name="descripcion" tipo="textarea" 
            value={formData.descripcion} onChange={handleChange} 
          />
        </div>

        {/* Precios */}
        <div className="bg-oscuro/20 p-5 rounded-xl border border-lila/5">
          <h3 className="text-sm font-bold text-lila mb-4 flex items-center gap-2">
            <i className="bi bi-currency-dollar"></i> Precios
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Precio de Compra (Costo)" name="pCompra" tipo="number" value={formData.pCompra} onChange={handleChange} requerido />
            <Input label="Precio de Venta" name="pVenta" tipo="number" value={formData.pVenta} onChange={handleChange} requerido />
          </div>
        </div>

        {/* Inventario */}
        <div className="bg-oscuro/20 p-5 rounded-xl border border-lila/5">
          <h3 className="text-sm font-bold text-lila mb-4 flex items-center gap-2">
            <i className="bi bi-box-seam"></i> Inventario
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-3 items-end mb-6 bg-lila/5 p-4 rounded-lg border border-lila/10">
            <div className="flex-1 w-full">
              <Input 
                label="Seleccionar Talla" 
                tipo="select" 
                name="tallaSeleccionada"
                opciones={opcionesTallasActuales}
                value={tallaSeleccionada}
                onChange={(e) => setTallaSeleccionada(e.target.value)}
              />
            </div>
            <div className="flex-1 w-full">
              <Input 
                label="Cantidad (Stock)" 
                tipo="number" 
                name="stockInput"
                placeholder="Ej. 15"
                value={stockInput}
                onChange={(e) => setStockInput(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-auto">
              <Boton variante="claro" onClick={handleAgregarTalla} tipo="button" className="w-full h-10 flex justify-center">
                <i className="bi bi-plus-lg"></i> Agregar
              </Boton>
            </div>
          </div>

          {/* Tarjetas de Tallas */}
          {formData.inventario.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {formData.inventario.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-oscuro/40 border border-lila/20 rounded-lg p-2 pr-3 group">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center w-10 h-10 bg-lila/10 rounded-md border border-lila/20">
                      <span className="text-xs font-bold text-blanco uppercase">{item.talla}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-lila-soft uppercase tracking-wider">Stock</span>
                      <span className="text-sm font-bold text-blanco">{item.stock}</span>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => handleEliminarTalla(item.talla)}
                    className="text-lila-soft hover:text-rojo transition-colors opacity-70 group-hover:opacity-100"
                    title="Eliminar talla"
                  >
                    <i className="bi bi-x-circle-fill text-lg"></i>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-lila-mid italic text-center py-6 bg-oscuro/40 rounded-lg border border-lila/5">
              Aún no has agregado tallas a este producto.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-lila/20">
          <Boton variante="claro" onClick={onCancelar} tipo="button">
            <i className="bi bi-x-lg"></i> Cancelar
          </Boton>
          <Boton variante="claro" tipo="submit">
            <i className="bi bi-save"></i> Guardar
          </Boton>
        </div>

      </form>
    </div>
  );
}