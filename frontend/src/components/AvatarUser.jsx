/**
 * Componente que genera un avatar con iniciales del usuario
 * y un color consistente basado en el ID
 */
export default function AvatarUser({ nombre = "", apellido = "", userId = "" }) {
  // Generar iniciales
  const getInitials = () => {
    const n = (nombre || "").charAt(0).toUpperCase();
    const a = (apellido || "").charAt(0).toUpperCase();
    return `${n}${a}`.slice(0, 2) || "?";
  };

  // Generar color consistente basado en userId
  const getColorBg = () => {
    if (!userId) return "bg-lila";
    
    // Array de colores disponibles
    const colores = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-cyan-500",
      "bg-lime-500",
      "bg-orange-500",
    ];

    // Usar el hash del userId para seleccionar un color consistente
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    
    const colorIndex = Math.abs(hash) % colores.length;
    return colores[colorIndex];
  };

  return (
    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${getColorBg()} text-white font-semibold text-sm`}>
      {getInitials()}
    </div>
  );
}
