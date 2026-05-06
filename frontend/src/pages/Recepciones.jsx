import { useState } from "react";

const mockData = [
  {
    folio: "FAC-100",
    proveedor: "Proveedor 1",
    fecha: "10-05-2026",
    usuario: "usuario1",
    items: 50,
    total: 200,
    estado: "Cancelada",
  },
  {
    folio: "FAC-100",
    proveedor: "Proveedor 1",
    fecha: "10-05-2026",
    usuario: "usuario1",
    items: 50,
    total: 200,
    estado: "Confirmada",
  },
  {
    folio: "FAC-100",
    proveedor: "Proveedor 1",
    fecha: "10-05-2026",
    usuario: "usuario1",
    items: 50,
    total: 200,
    estado: "Draft",
  },
  {
    folio: "FAC-100",
    proveedor: "Proveedor 1",
    fecha: "10-05-2026",
    usuario: "usuario1",
    items: 50,
    total: 200,
    estado: "Confirmada",
  },
  {
    folio: "FAC-100",
    proveedor: "Proveedor 1",
    fecha: "10-05-2026",
    usuario: "usuario1",
    items: 50,
    total: 200,
    estado: "Confirmada",
  },
];

const estadoStyle = {
  Cancelada: { background: "#C0392B", color: "#fff" },
  Confirmada: { background: "#27AE60", color: "#fff" },
  Draft: { background: "#F0C040", color: "#221E3A" },
};

export default function Recepciones() {
  const [filtro, setFiltro] = useState("");

  return (
    <div
      style={{
        padding: "40px 48px",
        color: "#E7D6FF",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* Título */}
      <h1
        style={{
          fontSize: "28px",
          fontWeight: 700,
          marginBottom: "32px",
          color: "#fff",
        }}
      >
        RECEPCIONES
      </h1>

      {/* Tarjetas de stats */}
      <div style={{ display: "flex", gap: "24px", marginBottom: "36px" }}>
        {[
          {
            label: "Recepciones",
            value: "248",
            sub: "este mes",
            accent: "#7C6AF7",
          },
          {
            label: "Confirmadas",
            value: "183",
            sub: "Esto es un 73%",
            accent: "#27AE60",
          },
          {
            label: "Canceladas",
            value: "41",
            sub: "Esto es un 9.7%",
            accent: "#C0392B",
          },
          {
            label: "Total",
            value: "20,000",
            sub: "Recepciones",
            accent: "#7C6AF7",
          },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              flex: 1,
              background: "#2C2A4A",
              borderRadius: "12px",
              padding: "24px",
              borderLeft: `4px solid ${card.accent}`,
            }}
          >
            <p style={{ margin: 0, fontSize: "14px", opacity: 0.7 }}>
              {card.label}
            </p>
            <p
              style={{
                margin: "8px 0",
                fontSize: "36px",
                fontWeight: 700,
                color: card.accent,
              }}
            >
              {card.value}
            </p>
            <p style={{ margin: 0, fontSize: "13px", opacity: 0.6 }}>
              {card.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Filtro + botón */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          style={{
            background: "#2C2A4A",
            color: "#E7D6FF",
            border: "1px solid #3D3A5C",
            borderRadius: "8px",
            padding: "8px 16px",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          <option value="">Filtrar por...</option>
          <option value="Confirmada">Confirmadas</option>
          <option value="Cancelada">Canceladas</option>
          <option value="Draft">Draft</option>
        </select>

        <button
          style={{
            background: "#E7D6FF",
            color: "#221E3A",
            border: "none",
            borderRadius: "10px",
            padding: "10px 20px",
            fontWeight: 700,
            fontSize: "15px",
            cursor: "pointer",
          }}
        >
          + Recepción
        </button>
      </div>

      {/* Tabla */}
      <div
        style={{
          background: "#2C2A4A",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#221E3A" }}>
              {[
                "Folio",
                "Proveedor",
                "Fecha",
                "Usuario",
                "Items",
                "Total",
                "Estado",
                "Acciones",
              ].map((col) => (
                <th
                  key={col}
                  style={{
                    padding: "16px",
                    textAlign: "center",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#E7D6FF",
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockData
              .filter((row) => filtro === "" || row.estado === filtro)
              .map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #3D3A5C" }}>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    {row.folio}
                  </td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    {row.proveedor}
                  </td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    {row.fecha}
                  </td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    {row.usuario}
                  </td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    {row.items}
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      color: "#27AE60",
                      fontWeight: 700,
                    }}
                  >
                    ${row.total}
                  </td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    <span
                      style={{
                        ...estadoStyle[row.estado],
                        padding: "4px 14px",
                        borderRadius: "20px",
                        fontSize: "13px",
                        fontWeight: 700,
                      }}
                    >
                      {row.estado}
                    </span>
                  </td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    <button title="Ver" style={iconBtn}>
                      👁
                    </button>
                    <button title="Editar" style={iconBtn}>
                      ✏️
                    </button>
                    <button title="Eliminar" style={iconBtn}>
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Footer: exportar + paginación */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "24px",
        }}
      >
        <button
          style={{
            background: "transparent",
            color: "#E7D6FF",
            border: "2px solid #E7D6FF",
            borderRadius: "8px",
            padding: "8px 20px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Exportar
        </button>
        <span style={{ opacity: 0.6, fontSize: "13px" }}>1 – 5 de 20,000</span>
        <div style={{ display: "flex", gap: "8px" }}>
          {["‹", "1", "2", "3", "4", "›"].map((p) => (
            <button
              key={p}
              style={{
                background: p === "1" ? "#E7D6FF" : "#2C2A4A",
                color: p === "1" ? "#221E3A" : "#E7D6FF",
                border: "none",
                borderRadius: "8px",
                width: "36px",
                height: "36px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const iconBtn = {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  fontSize: "16px",
  margin: "0 4px",
  opacity: 0.8,
};
