import { useState, useEffect } from "react";
import Modal from "./Modal";
import Input from "./Input";
import Boton from "./Boton";

export default function ModalRoles({ isOpen, onClose, rolData, onGuardar, guardando }) {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    permissions: []
  });

  const [errores, setErrores] = useState({});

  useEffect(() => {
    if (rolData) {
      setFormData({
        nombre: rolData.nombre || "",
        descripcion: rolData.descripcion || "",
        permissions: rolData.permissions || []
      });
    } else {
      setFormData({
        nombre: "",
        descripcion: "",
        permissions: []
      });
    }
    setErrores({});
  }, [rolData, isOpen]);

  const validar = () => {
    const nuevosErrores = {};
    if (!formData.nombre) nuevosErrores.nombre = "El nombre del rol es requerido";
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validar()) {
      onGuardar(formData);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} ancho="max-w-md">
      <div className="p-6">
        <h2 className="text-xl font-bold text-blanco mb-6">
          {rolData ? "Editar Rol" : "Crear Nuevo Rol"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-lila-soft mb-2">
              Nombre del Rol
            </label>
            <input
              type="text"
              placeholder="ej: ADMINISTRADOR"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 bg-oscuro border border-lila/30 rounded-lg text-blanco placeholder-gris focus:outline-none focus:border-lila transition-colors"
            />
            {errores.nombre && <p className="text-rojo text-sm mt-1">{errores.nombre}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-lila-soft mb-2">
              Descripción
            </label>
            <textarea
              placeholder="Describe el propósito de este rol..."
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full px-3 py-2 bg-oscuro border border-lila/30 rounded-lg text-blanco placeholder-gris focus:outline-none focus:border-lila transition-colors resize-none"
              rows="3"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 px-4 py-2 bg-lila text-blanco rounded-lg hover:bg-lila/80 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {guardando ? "Guardando..." : rolData ? "Actualizar" : "Crear"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={guardando}
              className="flex-1 px-4 py-2 bg-oscuro border border-lila/30 text-blanco rounded-lg hover:bg-oscuro/80 disabled:opacity-50 font-medium transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
