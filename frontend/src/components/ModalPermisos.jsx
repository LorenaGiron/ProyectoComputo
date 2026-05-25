import { useState, useEffect } from "react";
import Modal from "./Modal";
import Etiquetas from "./Etiquetas";

export default function ModalPermisos({ isOpen, onClose, rol, permisos, onActualizar, guardando }) {
  const [permisosSeleccionados, setPermisosSeleccionados] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [moduloFiltro, setModuloFiltro] = useState("");

  useEffect(() => {
    if (rol?.permissions) {
      setPermisosSeleccionados([...rol.permissions]);
    } else {
      setPermisosSeleccionados([]);
    }
  }, [rol, isOpen]);

  // Obtener módulos únicos
  const modulos = [...new Set(permisos.map(p => p.modulo))].sort();

  // Filtrar permisos
  const permisosFiltrados = permisos.filter(p => {
    const coincideBusqueda = busqueda === "" || 
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.code.toLowerCase().includes(busqueda.toLowerCase());
    
    const coincideModulo = moduloFiltro === "" || p.modulo === moduloFiltro;
    
    return coincideBusqueda && coincideModulo;
  });

  const handleTogglePermiso = (code) => {
    if (permisosSeleccionados.includes(code)) {
      setPermisosSeleccionados(permisosSeleccionados.filter(p => p !== code));
    } else {
      setPermisosSeleccionados([...permisosSeleccionados, code]);
    }
  };

  const handleSeleccionarTodos = () => {
    if (permisosSeleccionados.length === permisosFiltrados.length) {
      // Deseleccionar todos
      setPermisosSeleccionados(
        permisosSeleccionados.filter(p => !permisosFiltrados.find(pf => pf.code === p))
      );
    } else {
      // Seleccionar todos
      const nuevosPermisos = [...permisosSeleccionados];
      permisosFiltrados.forEach(p => {
        if (!nuevosPermisos.includes(p.code)) {
          nuevosPermisos.push(p.code);
        }
      });
      setPermisosSeleccionados(nuevosPermisos);
    }
  };

  const handleGuardar = () => {
    onActualizar(permisosSeleccionados);
  };

  const permisosSeleccionadosCount = permisosSeleccionados.length;
  const todosSeleccionados = permisosSeleccionados.length === permisos.length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} ancho="max-w-2xl">
      <div className="p-6">
        <h2 className="text-xl font-bold text-blanco mb-2">
          Gestionar Permisos: {rol?.nombre}
        </h2>
        <p className="text-lila-soft text-sm mb-4">
          {permisosSeleccionadosCount} de {permisos.length} permisos seleccionados
        </p>

        {/* Buscador y filtro */}
        <div className="mb-4 space-y-3">
          <input
            type="text"
            placeholder="Buscar permisos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full px-3 py-2 bg-oscuro border border-lila/30 rounded-lg text-blanco placeholder-gris focus:outline-none focus:border-lila"
          />

          <select
            value={moduloFiltro}
            onChange={(e) => setModuloFiltro(e.target.value)}
            className="w-full px-3 py-2 bg-oscuro border border-lila/30 rounded-lg text-blanco focus:outline-none focus:border-lila"
          >
            <option value="">Todos los módulos</option>
            {modulos.map(mod => (
              <option key={mod} value={mod}>{mod}</option>
            ))}
          </select>
        </div>

        {/* Lista de permisos */}
        <div className="max-h-80 overflow-y-auto bg-oscuro/50 rounded-lg p-4 border border-lila/20 mb-4">
          <div className="mb-3 pb-3 border-b border-lila/20">
            <label className="flex items-center gap-2 cursor-pointer hover:bg-lila/10 p-2 rounded transition-colors">
              <input
                type="checkbox"
                checked={permisosSeleccionados.length > 0 && permisosSeleccionados.length === permisosFiltrados.length}
                onChange={handleSeleccionarTodos}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-sm font-medium text-lila-soft">
                {permisosSeleccionados.length === permisosFiltrados.length ? "Deseleccionar todos" : "Seleccionar todos"}
              </span>
            </label>
          </div>

          <div className="space-y-2">
            {permisosFiltrados.map(permiso => (
              <label
                key={permiso.code}
                className="flex items-start gap-3 p-2 rounded hover:bg-lila/10 transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={permisosSeleccionados.includes(permiso.code)}
                  onChange={() => handleTogglePermiso(permiso.code)}
                  className="w-4 h-4 mt-0.5 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blanco">{permiso.nombre}</span>
                    <Etiquetas contenido={permiso.modulo} />
                  </div>
                  <p className="text-xs text-lila-soft mt-0.5">{permiso.code}</p>
                  {permiso.descripcion && (
                    <p className="text-xs text-gris mt-1">{permiso.descripcion}</p>
                  )}
                </div>
              </label>
            ))}
          </div>

          {permisosFiltrados.length === 0 && (
            <div className="text-center py-8 text-lila-soft">
              <i className="bi bi-search text-2xl mb-2 block"></i>
              <p>No se encontraron permisos</p>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2">
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="flex-1 px-4 py-2 bg-lila text-blanco rounded-lg hover:bg-lila/80 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {guardando ? "Actualizando..." : "Guardar Permisos"}
          </button>
          <button
            onClick={onClose}
            disabled={guardando}
            className="flex-1 px-4 py-2 bg-oscuro border border-lila/30 text-blanco rounded-lg hover:bg-oscuro/80 disabled:opacity-50 font-medium transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
}
