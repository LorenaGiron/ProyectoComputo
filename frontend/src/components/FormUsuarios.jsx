import { useState, useEffect } from "react";
import { canPerformAction } from "../utils/permissionMapper";
import Input from "./Input";
import Boton from "./Boton";

export default function FormUsuarios({ data, onGuardar, onCancelar, usuarioLogeado, esNuevo = false, rolesDisponibles: rolesDispProp = [] }) {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    usuario: "",
    password: "",
    roleId: "VENDEDOR",
    activo: true
  });

  const [errores, setErrores] = useState({});

  // Determinar roles disponibles según permisos o prop recibida
  const getRolesDisponibles = () => {
    // Si recibimos roles como prop desde el padre (Usuarios.jsx)
    if (rolesDispProp && rolesDispProp.length > 0) {
      // Extraer identificadores de roles, excluyendo CLIENTE
      return rolesDispProp
        .filter(rol => {
          // Filtrar según permisos del usuario actual
          const esAdmin = usuarioLogeado?.roleId === "role_admin" || usuarioLogeado?.roleId === "ADMIN";
          
          const rolId = rol.id || rol.nombre;
          if (rolId === "CLIENTE") return false;
          if (!esAdmin && rolId === "GERENTE") return false;
          return true;
        })
        .map(rol => ({
          id: rol.id || rol.nombre,
          nombre: rol.nombre || rol.id
        }));
    }

    // Fallback: roles hardcodeados según permisos
    const rolesBase = ["BODEGUERO", "VENDEDOR"];
    
    const esAdmin = canPerformAction(usuarioLogeado?.permissions, 'roles', 'create')
      || usuarioLogeado?.roleId === "role_admin";
    
    const esGerente = canPerformAction(usuarioLogeado?.permissions, 'users', 'create')
      || usuarioLogeado?.roleId === "GERENTE";
    
    if (esAdmin) {
      return [
        { id: "GERENTE", nombre: "GERENTE" },
        { id: "BODEGUERO", nombre: "BODEGUERO" },
        { id: "VENDEDOR", nombre: "VENDEDOR" }
      ];
    }
    if (esGerente) {
      return rolesBase.map(r => ({ id: r, nombre: r }));
    }
    return [];
  };

  useEffect(() => {
    if (data) {
      setFormData({
        nombre: data.nombre || "",
        apellido: data.apellido || "",
        email: data.email || "",
        usuario: data.usuario || "",
        password: "",
        roleId: data.roleId || data.role || "VENDEDOR",
        activo: data.activo !== false
      });
    } else {
      setFormData({
        nombre: "",
        apellido: "",
        email: "",
        usuario: "",
        password: "",
        roleId: "VENDEDOR",
        activo: true
      });
    }
    setErrores({});
  }, [data]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const validar = () => {
    const nuevosErrores = {};

    if (!formData.nombre.trim()) nuevosErrores.nombre = "El nombre es requerido";
    if (!formData.apellido.trim()) nuevosErrores.apellido = "El apellido es requerido";
    if (!formData.email.trim()) nuevosErrores.email = "El email es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) nuevosErrores.email = "Email inválido";
    
    if (!formData.usuario.trim()) nuevosErrores.usuario = "El usuario es requerido";
    if (esNuevo && !formData.password.trim()) nuevosErrores.password = "La contraseña es requerida";
    if (formData.password && formData.password.length < 6) nuevosErrores.password = "Mínimo 6 caracteres";

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validar()) {
      onGuardar(formData);
    }
  };

  const rolesOpciones = getRolesDisponibles();
  const puedeEditar = usuarioLogeado?.roleId === "role_admin" || usuarioLogeado?.roleId === "GERENTE";

  if (!puedeEditar && !esNuevo) {
    return (
      <div className="p-6 text-center text-lila-soft">
        <p>No tienes permisos para editar usuarios</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 text-blanco font-poppins">
      <div className="mb-6 border-b border-lila/20 pb-4">
        <h2 className="text-2xl font-bold text-blanco">
          {esNuevo ? "Crear Usuario" : "Editar Usuario"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Datos Personales */}
        <div className="mb-6">
          <p className="text-xs font-bold text-lila-soft mb-4 uppercase tracking-wider">
            Datos Personales
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-lila mb-2">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-oscuro border rounded-lg text-blanco outline-none transition-all ${
                  errores.nombre ? "border-error-text" : "border-lila/20 focus:border-lila"
                }`}
                placeholder="María"
              />
              {errores.nombre && <span className="text-error-text text-xs mt-1">{errores.nombre}</span>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-lila mb-2">Apellido</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-oscuro border rounded-lg text-blanco outline-none transition-all ${
                  errores.apellido ? "border-error-text" : "border-lila/20 focus:border-lila"
                }`}
                placeholder="López"
              />
              {errores.apellido && <span className="text-error-text text-xs mt-1">{errores.apellido}</span>}
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className="mb-6">
          <p className="text-xs font-bold text-lila-soft mb-4 uppercase tracking-wider">
            Contacto
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-lila mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-oscuro border rounded-lg text-blanco outline-none transition-all ${
                  errores.email ? "border-error-text" : "border-lila/20 focus:border-lila"
                }`}
                placeholder="maria@email.com"
              />
              {errores.email && <span className="text-error-text text-xs mt-1">{errores.email}</span>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-lila mb-2">Usuario</label>
              <input
                type="text"
                name="usuario"
                value={formData.usuario}
                onChange={handleChange}
                disabled={!esNuevo}
                className={`w-full px-3 py-2 bg-oscuro border rounded-lg text-blanco outline-none transition-all ${
                  errores.usuario ? "border-error-text" : "border-lila/20 focus:border-lila"
                } ${!esNuevo ? "opacity-50 cursor-not-allowed" : ""}`}
                placeholder="m.lopez"
              />
              {errores.usuario && <span className="text-error-text text-xs mt-1">{errores.usuario}</span>}
            </div>
          </div>
        </div>

        {/* Contraseña */}
        <div className="mb-6">
          <p className="text-xs font-bold text-lila-soft mb-4 uppercase tracking-wider">
            {esNuevo ? "Contraseña" : "Cambiar Contraseña (opcional)"}
          </p>

          <div>
            <label className="block text-sm font-semibold text-lila mb-2">
              {esNuevo ? "Contraseña" : "Nueva Contraseña"}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-oscuro border rounded-lg text-blanco outline-none transition-all ${
                errores.password ? "border-error-text" : "border-lila/20 focus:border-lila"
              }`}
              placeholder="••••••••"
            />
            {errores.password && <span className="text-error-text text-xs mt-1">{errores.password}</span>}
          </div>
        </div>

        {/* Rol y Estado */}
        <div className="mb-6">
          <p className="text-xs font-bold text-lila-soft mb-4 uppercase tracking-wider">
            Rol y Permisos
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-lila mb-2">Rol</label>
              <select
                name="roleId"
                value={formData.roleId}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-oscuro border border-lila/20 rounded-lg text-blanco outline-none focus:border-lila transition-all"
              >
                {rolesOpciones.map(rol => {
                  const rolId = typeof rol === 'object' ? rol.id : rol;
                  const rolNombre = typeof rol === 'object' ? rol.nombre : rol;
                  return (
                    <option key={rolId} value={rolId}>{rolNombre}</option>
                  );
                })}
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm font-semibold text-lila">
                  {formData.activo ? "Activo" : "Inactivo"}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 justify-end pt-6 border-t border-lila/20">
          <button
            type="button"
            onClick={onCancelar}
            className="px-4 py-2 rounded-lg border border-lila/30 text-lila hover:bg-lila hover:text-oscuro transition-all font-semibold"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-lila text-oscuro hover:bg-lila/80 transition-all font-semibold"
          >
            {esNuevo ? "Crear" : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
