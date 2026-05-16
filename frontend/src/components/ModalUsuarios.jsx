import Etiquetas from "./Etiquetas";

export default function ModalUsuarios({ data, usuarioLogeado }) {
  const estadoTexto = data.activo !== false ? "Activo" : "Inactivo";
  
  const puedeEliminar = 
    (usuarioLogeado?.roleId === "role_admin" || usuarioLogeado?.roleId === "GERENTE") &&
    data.id !== usuarioLogeado?.id; // No puede eliminarse a sí mismo

  return (
    <div className="p-4 md:p-6 text-blanco font-poppins h-full">
      
      <div className="mb-6 pb-4 border-b border-lila/20">
        <h2 className="text-3xl font-bold text-blanco mb-3">
          {data.nombre} {data.apellido}
        </h2>
        <div className="flex flex-wrap gap-2">
          <Etiquetas contenido={data.role || data.roleId || "Sin rol"} />
          <Etiquetas contenido={estadoTexto} />
        </div>
      </div>

      {/* Información General */}
      <div className="space-y-1 bg-oscuro/20 p-4 rounded-xl border border-lila/5 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Usuario", value: data.usuario, mono: true },
            { label: "Email", value: data.email },
            { label: "Rol", value: data.role || data.roleId || "Sin rol" },
            { label: "Estado", value: estadoTexto },
            { label: "Creado", value: new Date(data.createdAt).toLocaleDateString("es-MX") },
            { label: "Actualizado", value: new Date(data.updatedAt).toLocaleDateString("es-MX") }
          ].map(({ label, value, mono }) => (
            <div key={label}>
              <p className="text-xs text-lila-soft mb-1 uppercase tracking-wider font-semibold">{label}</p>
              <p className={`text-sm text-blanco ${mono ? "font-mono" : ""}`}>
                {value || "—"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Permisos */}
      {data.permissions && data.permissions.length > 0 && (
        <div className="mb-8">
          <p className="text-xs font-bold text-lila-soft mb-4 uppercase tracking-wider flex items-center gap-2">
            <i className="bi bi-shield-check"></i> Permisos ({data.permissions.length})
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {data.permissions.map((permission, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-lila/20 bg-lila/5 text-xs text-lila-soft hover:border-lila hover:bg-lila/10 transition-all"
              >
                <i className="bi bi-check-circle text-verde text-sm"></i>
                <span className="font-mono">{permission}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nota de sistema */}
      {data.id === usuarioLogeado?.id && (
        <div className="mt-8 p-4 rounded-lg bg-lila/10 border border-lila/30 text-center">
          <p className="text-sm text-lila-soft">
            <i className="bi bi-info-circle mr-2"></i>
            Este es tu usuario actual
          </p>
        </div>
      )}
    </div>
  );
}
