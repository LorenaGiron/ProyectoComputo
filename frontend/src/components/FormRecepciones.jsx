import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Package } from "lucide-react";
import ModalConfirmacion from "./ModalConfirmacion";
import Modal from "./Modal";
import Input from "./Input";
import Boton from "./Boton";

function formatMoney(n) {
  return `$${Number(n).toLocaleString("es-MX")}`;
}

export default function FormRecepciones({ row, esNuevo, onClose, onGuardar }) {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [confirmarDescartar, setConfirmarDescartar] = useState(false);

  const estadoInicial = {
    supplierId: row?.supplierId || "",
    supplierNombre: row?.supplierNombre || "",
    folio: row?.folio || "",
    fecha: row?.fecha || new Date().toLocaleDateString("es-MX"),
    comentarios: row?.comentarios || "",
    status: row?.status || "DRAFT",
    items: row?.items ? row.items.map((i) => ({ ...i })) : [],
  };

  const [form, setForm] = useState(estadoInicial);
  
  const [estadoOriginal] = useState(JSON.stringify(estadoInicial));

  const productosDelProveedor = form.supplierId 
    ? products.filter(p => p.supplierId === form.supplierId)
    : [];

  const handleIntentarCerrar = () => {
    const estadoActual = JSON.stringify(form);
    if (estadoActual !== estadoOriginal) {
      setConfirmarDescartar(true);
    } else {
      onClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => { 
      if (e.key === "Escape" && !confirmarDescartar) {
        handleIntentarCerrar();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [confirmarDescartar, form, estadoOriginal, onClose]); 

  useEffect(() => {
    api.get("/suppliers?limit=100").then((res) => setSuppliers(res.items || res)).catch(console.error);
    api.get("/products?limit=100&activo=true").then((res) => setProducts(res.items || res)).catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSupplierChange = (e) => {
    const nombreSeleccionado = e.target.value;
    const sup = suppliers.find((s) => s.nombre === nombreSeleccionado);
    setForm((p) => ({ 
      ...p, 
      supplierNombre: nombreSeleccionado,
      supplierId: sup ? sup.id : "",
      items: [] 
    }));
  };

  const handleProductChange = (idx, e) => {
    const nombreSeleccionado = e.target.value;
    const prod = productosDelProveedor.find((p) => p.nombre === nombreSeleccionado);
    
    setForm((prev) => {
      const items = prev.items.map((item, i) => {
        if (i !== idx) return item;
        const costoUnitario = prod ? prod.precioCompra : 0;
        const cantidad = item.cantidad || 1;
        return { 
          ...item, 
          productId: prod ? prod.id : "", 
          sku: prod?.sku || "", 
          productNombre: nombreSeleccionado, 
          imagen: prod?.imagen || "", 
          costoUnitario, 
          subtotal: cantidad * costoUnitario 
        };
      });
      return { ...prev, items };
    });
  };

  const handleItemChange = (idx, e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const items = prev.items.map((item, i) => {
        if (i !== idx) return item;
        const updated = { ...item, [name]: Number(value) };
        updated.subtotal = updated.cantidad * updated.costoUnitario;
        return updated;
      });
      return { ...prev, items };
    });
  };

  const agregarItem = () => {
    if (!form.supplierId) {
      setError("Primero debes seleccionar un proveedor para agregar items.");
      return;
    }
    setError("");
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { productId: "", sku: "", productNombre: "", imagen: "", cantidad: 1, costoUnitario: 0, subtotal: 0 }],
    }));
  };

  const eliminarItem = (idx) => {
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  const totalCalculado = form.items.reduce((acc, i) => acc + i.subtotal, 0);

  const handleGuardar = async () => {
    setError("");
    if (!form.supplierId) return setError("Selecciona un proveedor.");
    if (!form.folio) return setError("El folio es requerido.");
    if (form.items.length === 0) return setError("Debes agregar al menos un item a la recepción.");
    if (form.items.some((i) => !i.productId)) return setError("Todos los items deben tener un producto seleccionado.");

    const body = {
      supplierId: form.supplierId, supplierNombre: form.supplierNombre,
      fecha: form.fecha, folio: form.folio, comentarios: form.comentarios || "",
      items: form.items.map((item) => ({
        productId: item.productId, sku: item.sku, productNombre: item.productNombre,
        cantidad: item.cantidad, costoUnitario: item.costoUnitario, subtotal: item.subtotal,
      })),
      status: form.status,
    };

    setGuardando(true);
    try {
      if (esNuevo) await api.post("/recepciones", body);
      else await api.patch(`/recepciones/${row.id}`, body);
      onGuardar(); 
      onClose(); 
    } catch (e) {
      setError(e.message || "Ocurrió un error al guardar.");
    } finally {
      setGuardando(false);
    }
  };

  const footerAcciones = (
    <div className="flex justify-end gap-3 w-full">
      <Boton 
        variante="secundario" 
        onClick={handleIntentarCerrar} 
        disabled={guardando} 
        tipo="button"
      >
        Cancelar
      </Boton>
      
      <Boton 
        variante="claro" 
        onClick={handleGuardar} 
        disabled={guardando} 
        tipo="button"
      >
        <i className="bi bi-save"></i> {guardando ? "Guardando..." : esNuevo ? "Crear recepción" : "Guardar cambios"}
      </Boton>
    </div>
  );

  return (
    <>
      <Modal 
        isOpen={true} 
        onClose={handleIntentarCerrar}
        titulo={
          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 rounded-full text-xs font-bold transition-colors bg-morado text-blanco dark:bg-lila/20 dark:text-lila">
              {esNuevo ? "NUEVO" : form.folio}
            </span>
            <span className="text-xl font-extrabold m-0">
              {esNuevo ? "Nueva Recepción" : "Editar Recepción"}
            </span>
          </div>
        } 
        ancho="max-w-3xl"
        footer={footerAcciones}
      >
        <div className="font-poppins pt-4">

          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl text-sm font-semibold border bg-rojo/10 text-rojo border-rojo/20">
              <i className="bi bi-exclamation-triangle-fill mr-2"></i>{error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Input 
              label="Proveedor" name="supplierNombre" tipo="select" 
              opciones={suppliers.map(s => s.nombre)} 
              value={form.supplierNombre} onChange={handleSupplierChange} 
            />
            
            <Input 
              label="Folio" name="folio" value={form.folio} 
              deshabilitado={!esNuevo} onChange={handleChange} 
            />
            
            <Input 
              label="Fecha" 
              name="fecha" 
              value={form.fecha} 
              deshabilitado={true}
            />
            
            <Input 
              label="Estado" name="status" tipo="select" 
              opciones={["DRAFT", "CONFIRMADO"]} 
              value={form.status} onChange={handleChange} 
            />
            
            <div className="md:col-span-2">
              <Input 
                label="Comentarios" name="comentarios" tipo="textarea" 
                value={form.comentarios} onChange={handleChange} 
              />
            </div>
            
            <div className="md:col-span-2">
              <div className={`
                w-full rounded-xl px-4 py-3 text-center border transition-colors shadow-sm
                bg-blanco border-morado/20
                dark:bg-oscuro/40 dark:border-lila/20 dark:shadow-none
              `}>
                <p className="text-[11px] font-bold uppercase tracking-wider text-morado dark:text-lila-mid mb-1">
                  Total calculado
                </p>
                <p className="text-2xl font-extrabold text-verde">
                  {formatMoney(totalCalculado)}
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4 border-b border-morado/10 dark:border-lila/10 pb-2">
              <p className="text-sm font-bold uppercase tracking-wider text-morado dark:text-lila">
                Items de Recepción
              </p>
              <button 
                onClick={agregarItem} type="button"
                className={`
                  px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1
                  bg-morado/10 text-morado hover:bg-morado/20
                  dark:bg-lila/20 dark:text-lila dark:hover:bg-lila/30
                `}
              >
                <i className="bi bi-plus-lg"></i> Agregar item
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              {form.items.map((item, i) => (
                <div 
                  key={i} 
                  className={`
                    rounded-xl px-4 py-4 border transition-colors shadow-sm
                    bg-blanco border-morado/20
                    dark:bg-oscuro/40 dark:border-lila/20 dark:shadow-none
                  `}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden border transition-colors
                        bg-lila/10 border-morado/20 text-morado
                        dark:bg-lila/5 dark:border-lila/20 dark:text-lila-mid
                      `}>
                        {item.imagen
                          ? <img src={item.imagen} alt={item.productNombre} className="w-full h-full object-cover" />
                          : <Package size={18} />}
                      </div>
                      <span className="text-sm font-bold transition-colors text-morado dark:text-lila">
                        Item {i + 1}
                      </span>
                    </div>
                    {form.items.length > 1 && (
                      <button 
                        onClick={() => eliminarItem(i)}
                        className="text-sm transition-opacity opacity-70 hover:opacity-100 cursor-pointer text-rojo"
                        title="Eliminar Item"
                      >
                        <i className="bi bi-trash" /> Eliminar
                      </button>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <Input 
                      label="Producto" name="productNombre" tipo="select"
                      opciones={productosDelProveedor.map(p => p.nombre)}
                      value={item.productNombre}
                      onChange={(e) => handleProductChange(i, e)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input 
                      label="Cantidad" name="cantidad" tipo="number" 
                      value={item.cantidad} onChange={(e) => handleItemChange(i, e)} 
                    />
                    <Input 
                      label="Costo unit." name="costoUnitario" tipo="number" 
                      value={item.costoUnitario} onChange={(e) => handleItemChange(i, e)} 
                    />
                    <Input 
                      label="Subtotal" name="subtotal" 
                      value={formatMoney(item.subtotal)} deshabilitado={true} 
                    />
                  </div>
                </div>
              ))}
              
              {form.items.length === 0 && (
                <div className="text-center py-8 text-gris dark:text-lila-soft italic text-sm border-2 border-dashed border-morado/20 dark:border-lila/20 rounded-xl">
                  {form.supplierId 
                    ? 'No hay items en esta recepción. Haz clic en "Agregar item" para empezar.'
                    : 'Selecciona un proveedor para poder agregar items.'}
                </div>
              )}
            </div>
          </div>

        </div>
      </Modal>

      {confirmarDescartar && (
        <ModalConfirmacion
          isOpen={true}
          tipo="confirmar"
          titulo="¿Descartar cambios?"
          mensaje="Los cambios no guardados se perderán. ¿Deseas salir de todas formas?"
          textoConfirmar="Descartar"
          textoCancelar="Seguir editando"
          onConfirmar={() => {
            setConfirmarDescartar(false);
            onClose(); 
          }}
          onCancelar={() => setConfirmarDescartar(false)} 
        />
      )}
    </>
  );
}