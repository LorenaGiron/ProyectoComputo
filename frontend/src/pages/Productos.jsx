import { useState, useEffect, useRef } from "react";

const mockData = [
  { sku: "SKU-001", nombre: "Playera Oversize", categoria: "Playeras", marca: "Urban Style", modelo: "Street-2024", pVenta: 200, stock: 50, estado: "Activo" },
  { sku: "SKU-002", nombre: "Pantalón Cargo", categoria: "Pantalones", marca: "Urban Style", modelo: "Cargo-X", pVenta: 450, stock: 3, estado: "Activo" },
  { sku: "SKU-003", nombre: "Sudadera Hoodie", categoria: "Sudaderas", marca: "Urban Style", modelo: "Hood-W", pVenta: 600, stock: 0, estado: "Inactivo" },
  { sku: "SKU-004", nombre: "Gorra Clásica", categoria: "Accesorios", marca: "Urban Style", modelo: "Cap-01", pVenta: 150, stock: 15, estado: "Activo" },
  { sku: "SKU-005", nombre: "Tenis Urban", categoria: "Calzado", marca: "Urban Style", modelo: "Sneak-1", pVenta: 800, stock: 25, estado: "Activo" },
];

const estadoStyle = {
  Activo: { background: "#88E06A", color: "#111" },
  Inactivo: { background: "#C0392B", color: "#fff" },
};

const categoriaStyle = {
  background: "#7C6AF7",
  color: "#fff",
  padding: "4px 14px",
  borderRadius: "20px",
  fontSize: "13px",
  fontWeight: 600,
};

const getStockColor = (stock) => {
  if (stock === 0) return "#C0392B"; 
  if (stock <= 5) return "#F0C040"; 
  return "#7C6AF7"; 
};

export default function Productos() {
  const [filtro, setFiltro] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const tooltipBaseClasses = "absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-oscuro text-blanco text-xs font-poppins px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl z-50 pointer-events-none";

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen text-lila bg-oscuro font-poppins transition-all overflow-x-hidden w-full">
      
      {/* --- HEADER SUPERIOR --- */}
      <div className="flex justify-end items-center gap-4 sm:gap-6 mb-4 pb-4 border-b border-lila-soft/10">
        <div className="relative cursor-pointer hover:scale-110 transition-transform" title="Notificaciones">
          <i className="bi bi-bell text-xl text-lila"></i>
        </div>

        <div className="flex items-center gap-3 bg-bg-card px-4 py-1.5 rounded-full border border-lila-soft/20 hover:border-lila-mid transition-colors cursor-pointer shadow-sm">
          <i className="bi bi-person-circle text-2xl text-lila-mid"></i>
          <div className="text-left leading-tight hidden sm:block">
            <p className="m-0 font-semibold text-sm text-blanco">Proyecto</p>
            <p className="m-0 text-[10px] opacity-80 uppercase tracking-wider text-lila-soft">Administrador</p>
          </div>
          <i className="bi bi-chevron-down text-xs text-lila-soft ml-1"></i>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-6 text-blanco uppercase tracking-wide text-center sm:text-left">
        Catálogo de Productos
      </h1>

      <div className="flex flex-col xl:flex-row gap-6 mb-8 w-full">
        <div className="flex flex-col sm:flex-row gap-6 flex-1">
          {[
            { label: "Total productos", value: "5,000", sub: "+124 este mes", accent: "#7C6AF7" },
            { label: "Productos Activos", value: "4,850", sub: "97% del catálogo", accent: "#7C6AF7" },
            { label: "Productos Inactivos", value: "150", sub: "3% del catálogo", accent: "#7C6AF7" },
          ].map((card) => (
            <div
              key={card.label}
              className="flex-1 bg-bg-card rounded-xl p-6 border border-lila/10 shadow-lg hover:-translate-y-1 transition-transform w-full"
              style={{ borderLeft: `4px solid ${card.accent}` }}
            >
              <p className="m-0 text-sm text-lila-soft">{card.label}</p>
              <p className="my-2 text-3xl lg:text-4xl font-bold text-blanco">{card.value}</p>
              <p className="m-0 text-xs text-text-muted font-medium">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Gráfica de Categorías */}
        <div className="flex-[1.2] bg-bg-card rounded-xl p-6 border border-lila/10 shadow-lg relative w-full">
          <p className="m-0 text-sm text-lila-soft">Categoría</p>
          
          <div className="flex h-7 mt-4 w-full relative overflow-visible font-medium">
            <div style={{width: "35%"}} className="bg-[#7C6AF7] rounded-l-md hover:opacity-80 transition-opacity cursor-help relative group">
              <span className={tooltipBaseClasses}>Playeras: 1,250 (35%)</span>
            </div>
            <div style={{width: "42%"}} className="bg-[#9D4A70] hover:opacity-80 transition-opacity cursor-help relative group">
              <span className={tooltipBaseClasses}>Pantalones: 1,500 (42%)</span>
            </div>
            <div style={{width: "20%"}} className="bg-[#4A55A2] hover:opacity-80 transition-opacity cursor-help relative group">
              <span className={tooltipBaseClasses}>Sudaderas: 714 (20%)</span>
            </div>
            <div style={{width: "3%"}} className="bg-[#4AC0B6] rounded-r-md hover:opacity-80 transition-opacity cursor-help relative group">
              <span className={tooltipBaseClasses}>Otros: 107 (3%)</span>
            </div>
          </div>
          
          <div className="flex justify-between text-[10px] sm:text-xs text-text-muted mt-2 font-medium">
            <span style={{width: "35%"}} className="text-center">35%</span>
            <span style={{width: "42%"}} className="text-center">42%</span>
            <span style={{width: "20%"}} className="text-center">20%</span>
            <span style={{width: "3%"}} className="text-center">3%</span>
          </div>
        </div>
      </div>

      {/* Buscador + Filtro + Botón */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-5 w-full">
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:flex-1">
          
          {/* Menú desplegable */}
          <div className="relative w-full sm:w-40" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-bg-card text-lila border border-lila/20 rounded-lg px-4 py-2.5 text-sm cursor-pointer outline-none hover:border-lila transition-colors shadow-sm flex items-center justify-between w-full h-full"
            >
              <span className="font-medium">
                {filtro === "" ? "Filtrar por" : filtro === "Activo" ? "Activos" : "Inactivos"}
              </span>
              <i className={`bi bi-chevron-down text-[10px] transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}></i>
            </button>

            {isDropdownOpen && (
              <ul className="absolute top-full left-0 mt-2 w-full bg-bg-card border border-lila/20 rounded-lg shadow-xl z-50 overflow-hidden py-1">
                <li onClick={() => { setFiltro(""); setIsDropdownOpen(false); }} className="px-4 py-2.5 text-sm text-lila hover:bg-lila hover:text-oscuro cursor-pointer transition-colors">Todos</li>
                <li onClick={() => { setFiltro("Activo"); setIsDropdownOpen(false); }} className="px-4 py-2.5 text-sm text-lila hover:bg-lila hover:text-oscuro cursor-pointer transition-colors">Activos</li>
                <li onClick={() => { setFiltro("Inactivo"); setIsDropdownOpen(false); }} className="px-4 py-2.5 text-sm text-lila hover:bg-lila hover:text-oscuro cursor-pointer transition-colors">Inactivos</li>
              </ul>
            )}
          </div>

          {/* Buscador */}
          <input
            type="text"
            placeholder="Buscar por SKU, marca, modelo o nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="bg-bg-card text-lila border border-lila/20 rounded-lg px-4 py-2.5 text-sm w-full sm:w-80 lg:w-96 outline-none hover:border-lila focus:ring-1 focus:ring-lila transition-all shadow-sm placeholder-lila/30"
          />
        </div>

        <button className="bg-lila text-oscuro border-none rounded-lg px-6 py-2.5 font-bold text-sm cursor-pointer hover:bg-blanco hover:scale-105 transition-all active:scale-95 w-full lg:w-auto">
          + Producto
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-bg-card rounded-xl border border-lila/20 shadow-lg relative overflow-x-auto w-full">
        <table className="w-full border-collapse min-w-200"> 
          <thead>
            <tr className="bg-black/20">
              {[ "Sku", "Nombre", "Categoría", "Marca", "Modelo", "P. venta", "Stok", "Estado", "Acciones" ].map((col) => (
                <th key={col} className="p-4 text-center text-[15px] font-bold text-lila-soft whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockData
              .filter((row) => filtro === "" || row.estado === filtro)
              .filter((row) => busqueda === "" || row.nombre.toLowerCase().includes(busqueda.toLowerCase()) || row.sku.toLowerCase().includes(busqueda.toLowerCase()))
              .map((row, i) => (
                <tr key={i} className="border-b border-lila/5 hover:bg-oscuro/40 transition-colors">
                  <td className="p-4 text-center text-sm whitespace-nowrap">{row.sku}</td>
                  <td className="p-4 text-center text-sm font-medium text-blanco whitespace-nowrap">{row.nombre}</td>
                  <td className="p-4 text-center whitespace-nowrap">
                    <span style={categoriaStyle}>{row.categoria}</span>
                  </td>
                  <td className="p-4 text-center text-sm whitespace-nowrap">{row.marca}</td>
                  <td className="p-4 text-center text-sm whitespace-nowrap">{row.modelo}</td>
                  <td className="p-4 text-center text-[#88E06A] font-semibold text-sm whitespace-nowrap">
                    ${row.pVenta}
                  </td>
                  <td
                    className="p-4 text-center text-sm whitespace-nowrap"
                    style={{ color: getStockColor(row.stock), fontWeight: row.stock <= 5 ? 700 : 400 }}
                  >
                    {row.stock}
                  </td>
                  <td className="p-4 text-center whitespace-nowrap">
                    <span style={{ ...estadoStyle[row.estado], padding: "4px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>
                      {row.estado}
                    </span>
                  </td>
                  <td className="p-4 text-center relative whitespace-nowrap">
                    <button className="bg-transparent border-none cursor-pointer text-lg mx-1 opacity-70 text-lila-soft hover:opacity-100 hover:text-lila hover:scale-125 transition-all relative group" title="Ver Historial">
                      <i className="bi bi-eye"></i>
                    </button>
                    <button className="bg-transparent border-none cursor-pointer text-lg mx-1 opacity-70 text-lila-soft hover:opacity-100 hover:text-[#F0C040] hover:scale-125 transition-all relative group" title="Editar">
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button className="bg-transparent border-none cursor-pointer text-lg mx-1 opacity-70 text-lila-soft hover:opacity-100 hover:text-[#C0392B] hover:scale-125 transition-all relative group" title="Eliminar">
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
        <button className="bg-transparent text-lila-soft border border-lila/20 rounded-lg px-5 py-2 font-bold cursor-pointer hover:border-lila-mid hover:text-blanco transition-all active:scale-95 w-full sm:w-auto">
          Exportar
        </button>
        <span className="text-text-muted text-sm font-medium">1 – 5 de 5,000</span>
        <div className="flex gap-2">
          {["‹", "1", "2", "3", "4", "›"].map((p) => (
            <button
              key={p}
              className={`w-9 h-9 rounded-lg font-bold cursor-pointer transition-all hover:scale-110 active:scale-90 ${
                p === "1" 
                  ? "bg-lila text-oscuro border-none hover:bg-blanco" 
                  : "bg-transparent text-lila-soft border border-lila/20 hover:border-lila-mid hover:text-blanco"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}