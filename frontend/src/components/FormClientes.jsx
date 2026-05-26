import { useState, useEffect } from "react";
import Modal from "./Modal";
import Input from "./Input";
import Boton from "./Boton";

export default function FormClientes({ cliente, esNuevo, onClose, onGuardar }) {
  const [form, setForm] = useState({
    nombre: "",
    rfc: "",
    email: "",
    telefono: "",
    direccion: "",
    notas: "",
    activo: true, 
  });

  useEffect(() => {
    if (cliente && !esNuevo) {
      setForm({
        nombre: cliente.nombre || "",
        rfc: cliente.rfc || "",
        email: cliente.email || "",
        telefono: cliente.telefono || "",
        direccion: cliente.direccion || "",
        notas: cliente.notas || "",
        activo: cliente.activo !== false, 
      });
    }
  }, [cliente, esNuevo]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ 
      ...prev, 
      [name]: type === "checkbox" ? checked : value 
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar(esNuevo ? form : { ...cliente, ...form });
  };

  return (
    <Modal isOpen={true} onClose={onClose} ancho="max-w-2xl">
      <div className="px-4 sm:px-6 pb-4 font-poppins">
        
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2 uppercase tracking-widest transition-colors text-morado dark:text-blanco">
            {esNuevo ? "Nuevo Cliente" : "Editar Cliente"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            <div className="sm:col-span-2">
              <Input
                label="Nombre Completo o Empresa"
                tipo="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ej. Ana Morales / Empresa S.A."
                requerido
              />
            </div>
            
            <div className="sm:col-span-2">
            <Input
                label="Estado"
                tipo="select"
                name="activo"
                value={form.activo ? "Activo" : "Inactivo"}
                onChange={(e) => setForm(prev => ({ 
                ...prev, 
                activo: e.target.value === "Activo" 
                }))}
                opciones={["Activo", "Inactivo"]}
            />
            </div>
            
            <Input
              label="RFC"
              tipo="text"
              name="rfc"
              value={form.rfc}
              onChange={handleChange}
              placeholder="RFC con homoclave"
            />
            
            <Input
              label="Teléfono"
              tipo="text"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              placeholder="Ej. 555 123 4567"
            />
            
            <div className="sm:col-span-2">
              <Input
                label="Correo Electrónico"
                tipo="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div className="sm:col-span-2">
              <Input
                label="Dirección"
                tipo="text"
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                placeholder="Calle, Número, Colonia, C.P., Ciudad"
              />
            </div>

            <div className="sm:col-span-2">
              <Input
                label="Notas"
                tipo="textarea"
                name="notas"
                value={form.notas}
                onChange={handleChange}
                placeholder="Observaciones adicionales sobre este cliente..."
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end border-t border-morado/10 dark:border-lila/10 pt-6 mt-2">
            <Boton variante="secundario" onClick={onClose} tipo="button">
              Cancelar
            </Boton>
            <Boton variante="claro" tipo="submit">
              {esNuevo ? "Crear cliente" : "Guardar cambios"}
            </Boton>
          </div>
        </form>
      </div>
    </Modal>
  );
}