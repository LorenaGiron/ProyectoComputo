import { useState, useEffect } from "react";
import { api } from "../services/api";
import { X, Package } from "lucide-react";
import ModalConfirmacion from "./ModalConfirmacion";
import Input from "./Input";
import Boton from "./Boton";

function formatMoney(n) {
  return `$${Number(n).toLocaleString("es-MX")}`;
}

export default function FormRecepciones({ row, esNuevo, onClose, onGuardar }) {
  const [suppliers, setSuppliers]                     = useState([]);
  const [products, setProducts]                       = useState([]);
  const [guardando, setGuardando]                     = useState(false);
  const [error, setError]                             = useState("");
  const [confirmarDescartar, setConfirmarDescartar]   = useState(false);
  const [folioSiguiente, setFolioSiguiente]           = useState("");

  const [form, setForm] = useState({
    supplierId:     row.supplierId     || "",
    supplierNombre: row.supplierNombre || "",
    folio:          row.folio          || "",
    fecha:          (row.fecha ? row.fecha.split("T")[0] : new Date().toISOString().split("T")[0]),
    comentarios:    row.comentarios    || "",
    status:         row.status         || "DRAFT",
    items:          row.items.map((i) => ({ ...i })),
  });

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") setConfirmarDescartar(true); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  useEffect(() => {
    api.get("/suppliers?limit=100").then((res) => setSuppliers(res.items)).catch(console.error);
    api.get("/products?limit=100&activo=true").then((res) => setProducts(res.items)).catch(console.error);
    if (esNuevo) {
      api.get("/recepciones/next-folio").then((res) => setFolioSiguiente(res.folio)).catch(console.error);
    }
  }, [esNuevo]);

  // Manejador general para inputs simples
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Manejador para el select de Proveedor
  const handleSupplierChange = (e) => {
    const nombreSeleccionado = e.target.value;
    const sup = suppliers.find((s) => s.nombre === nombreSeleccionado);
    setForm((p) => ({ 
      ...p, 
      supplierNombre: nombreSeleccionado,
      supplierId: sup ? sup.id : "" 
    }));
  };

  // Manejador para el select de Productos en los items
  const handleProductChange = (idx, e) => {
    const nombreSeleccionado = e.target.value;
    const prod = products.find((p) => p.nombre === nombreSeleccionado);
    
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
          talla: "",
          costoUnitario,
          subtotal: cantidad * costoUnitario
        };
      });
      return { ...prev, items };
    });
  };

  const handleTallaChange = (idx, talla) => {
    setForm((prev) => {
      const items = prev.items.map((item, i) =>
        i !== idx ? item : { ...item, talla }
      );
      return { ...prev, items };
    });
  };

  // Manejador para Cantidad y Costo de los items
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
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { productId: "", sku: "", productNombre: "", imagen: "", talla: "", cantidad: 1, costoUnitario: 0, subtotal: 0 }],
    }));
  };

  const eliminarItem = (idx) => {
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  const totalCalculado = form.items.reduce((acc, i) => acc + i.subtotal, 0);

  const handleGuardar = async () => {
    setError("");
    if (!form.supplierId) return setError("Selecciona un proveedor.");
    if (form.items.some((i) => !i.productId)) return setError("Todos los items deben tener un producto seleccionado.");

    const body = {
      supplierId: form.supplierId, supplierNombre: form.supplierNombre,
      fecha: form.fecha, folio: form.folio, comentarios: form.comentarios || "",
      items: form.items.map((item) => ({
        productId: item.productId, sku: item.sku, productNombre: item.productNombre,
        talla: item.talla || undefined,
        cantidad: item.cantidad, costoUnitario: item.costoUnitario, subtotal: item.subtotal,
      })),
      status: form.status,
    };

    setGuardando(true);
    try {
      if (esNuevo) await api.post("/recepciones", body);
      else         await api.patch(`/recepciones/${row.id}`, body);
      onGuardar();
      onClose();
    } catch (e) {
      setError(e.message || "Ocurrió un error al guardar.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <div 
        className={`
          fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-colors duration-300
          bg-oscuro/40
          dark:bg-black/60
        `}
        onClick={() => setConfirmarDescartar(true)}
      >
        <div 
          className={`
            relative w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto border transition-colors duration-300
            bg-lila-pastel border-morado/20 text-oscuro
            dark:bg-bg-card dark:border-lila/20 dark:text-blanco
          `}
          onClick={(e) => e.stopPropagation()}
        >

          {/* Header */}
          <div className="px-6 pt-6 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`
                px-4 py-1.5 rounded-full text-xs font-bold transition-colors
                bg-morado text-blanco
                dark:bg-lila/20 dark:text-lila
              `}>
                {esNuevo ? "NUEVO" : row.folio}
              </span>
              <h2 className="text-lg font-extrabold">
                {esNuevo ? "Nueva Recepción" : "Editar Recepción"}
              </h2>
            </div>
            <button 
              onClick={() => setConfirmarDescartar(true)}
              className={`
                w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer
                text-morado/60 hover:text-morado hover:bg-morado/10
                dark:text-lila-soft dark:hover:text-blanco dark:hover:bg-lila/10
              `}
            >
              <X size={16} />
            </button>
          </div>

          {/* Información General */}
          <div className="px-6 pb-4 grid grid-cols-2 gap-4">
            
            <Input 
              label="Proveedor" 
              name="supplierNombre" 
              tipo="select" 
              opciones={suppliers.map(s => s.nombre)} 
              value={form.supplierNombre} 
              onChange={handleSupplierChange} 
            />
            
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-morado dark:text-lila-soft mb-1">
                Folio
              </label>
              <div className={`
                w-full rounded-xl px-4 py-2.5 text-sm font-bold border transition-colors
                bg-lila/5 border-morado/10 text-morado/60
                dark:bg-lila/5 dark:border-lila/10 dark:text-lila/50
              `}>
                {esNuevo ? (folioSiguiente || "Cargando...") : form.folio}
              </div>
            </div>
            
            <Input
              label="Fecha"
              name="fecha"
              tipo="date"
              value={form.fecha}
              onChange={handleChange}
            />
            
            <Input 
              label="Estado" 
              name="status" 
              tipo="select" 
              opciones={["DRAFT", "CONFIRMED"]} 
              value={form.status} 
              onChange={handleChange} 
            />
            
            <div className="col-span-2">
              <Input 
                label="Comentarios" 
                name="comentarios" 
                tipo="textarea" 
                value={form.comentarios} 
                onChange={handleChange} 
              />
            </div>
            
            <div className="col-span-2">
              <div className={`
                w-full rounded-xl px-4 py-2 text-center border transition-colors shadow-sm
                bg-blanco border-morado/20
                dark:bg-oscuro/40 dark:border-lila/20 dark:shadow-none
              `}>
                <p className="text-[11px] font-bold uppercase tracking-wider text-morado dark:text-lila-mid mb-0">
                  Total calculado
                </p>
                <p className="text-lg font-extrabold text-verde">
                  {formatMoney(totalCalculado)}
                </p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="px-6 pb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-morado dark:text-lila-mid">
                Items
              </p>
              <button 
                onClick={agregarItem}
                type="button"
                className={`
                  px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1
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
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center shrink-0 overflow-hidden border transition-colors
                        bg-lila/10 border-morado/20 text-morado
                        dark:bg-lila/5 dark:border-lila/20 dark:text-lila-mid
                      `}>
                        {item.imagen
                          ? <img src={item.imagen} alt={item.productNombre} className="w-full h-full object-cover" />
                          : <Package size={15} />}
                      </div>
                      <span className="text-xs font-bold transition-colors text-morado dark:text-lila">
                        Item {i + 1}
                      </span>
                    </div>
                    {form.items.length > 1 && (
                      <button 
                        onClick={() => eliminarItem(i)}
                        className="text-xs transition-opacity hover:opacity-70 cursor-pointer text-rojo"
                        title="Eliminar Item"
                      >
                        <i className="bi bi-trash text-base" />
                      </button>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <Input
                      label="Producto"
                      name="productNombre"
                      tipo="select"
                      opciones={products.map(p => p.nombre)}
                      value={item.productNombre}
                      onChange={(e) => handleProductChange(i, e)}
                    />
                  </div>

                  {/* Selector de talla */}
                  {(() => {
                    const prod = products.find(p => p.id === item.productId);
                    const tallas = prod?.inventario?.map(t => t.talla) ?? [];
                    if (tallas.length === 0) return null;
                    return (
                      <div className="mb-3">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-morado dark:text-lila-soft mb-1">Talla</p>
                        <div className="flex flex-wrap gap-2">
                          {tallas.map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => handleTallaChange(i, t)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all
                                ${item.talla === t
                                  ? "bg-morado text-blanco border-morado dark:bg-lila dark:border-lila dark:text-oscuro"
                                  : "border-morado/20 text-morado dark:border-lila/20 dark:text-lila hover:border-morado dark:hover:border-lila"
                                }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="grid grid-cols-3 gap-3">
                    <Input 
                      label="Cantidad" 
                      name="cantidad" 
                      tipo="number" 
                      value={item.cantidad} 
                      onChange={(e) => handleItemChange(i, e)} 
                    />
                    <Input 
                      label="Costo unit." 
                      name="costoUnitario" 
                      tipo="number" 
                      value={item.costoUnitario} 
                      onChange={(e) => handleItemChange(i, e)} 
                    />
                    <Input 
                      label="Subtotal" 
                      name="subtotal" 
                      value={formatMoney(item.subtotal)} 
                      deshabilitado={true} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Errores */}
          {error && (
            <div className={`
              mx-6 mb-4 px-4 py-2 rounded-xl text-sm font-semibold border
              bg-rojo/10 text-rojo border-rojo/20
            `}>
              {error}
            </div>
          )}

          {/* Footer */}
          <div className={`
            px-6 py-4 flex justify-end gap-3 border-t transition-colors
            border-morado/20 bg-blanco/50
            dark:border-lila/20 dark:bg-transparent
          `}>
            <Boton 
              variante="secundario" 
              onClick={() => setConfirmarDescartar(true)} 
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
        </div>
      </div>

      {/* Modal confirmación descartar */}
      {confirmarDescartar && (
        <ModalConfirmacion
          isOpen={true}
          tipo="confirmar"
          titulo="¿Seguro que quieres descartar los cambios?"
          mensaje="Los cambios no guardados se perderán."
          textoConfirmar="Descartar"
          textoCancelar="Seguir editando"
          onConfirmar={onClose}
          onCancelar={() => setConfirmarDescartar(false)}
        />
      )}
    </>
  );
}