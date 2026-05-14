import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, Legend,
} from "recharts";

// ── Componentes UI ─────────────────────────────────────────────
import Tarjetas from "../components/Tarjetas";
import Tabla from "../components/Tabla";
import Etiquetas from "../components/Etiquetas";
import Toast from "../components/Toast";

// ── URL base de tu API ─────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL ?? "";

// ── Colores (mapeo de tus CSS vars a hex para Recharts) ────────
const C = {
  lila:      "#E7D6FF",
  lilaMid:   "#A68DC8",
  lilaSoft:  "#C9B8E8",
  verde:     "#A3E378",
  rojo:      "#FF6B6B",
  amarillo:  "#F7CB57",
  azul:      "#7EC9ED",
  rosa:      "#ED8ABA",
  naranja:   "#FAA86B",
  muted:     "#5A5870",
  card:      "#231E3C",
  oscuro:    "#2C2A4A",
};

// ── Tooltip compartido para todas las gráficas ─────────────────
const TOOLTIP = {
  contentStyle: {
    background: C.card,
    border: `1px solid ${C.lilaMid}55`,
    borderRadius: 8,
    color: C.lila,
    fontSize: 12,
    fontFamily: "Poppins, sans-serif",
  },
  labelStyle:  { color: C.lilaSoft, marginBottom: 4 },
  cursor:      { fill: "rgba(231,214,255,0.04)" },
};

// ── Botón toggle tabla / gráfica ───────────────────────────────
function ToggleBtn({ isGrafica, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold
        border border-lila/30 cursor-pointer transition-all active:scale-95
        font-poppins
        ${isGrafica
          ? "bg-lila text-oscuro border-lila"
          : "bg-transparent text-lila-soft hover:bg-lila hover:text-oscuro"}
      `}
    >
      <i className={`bi ${isGrafica ? "bi-table" : "bi-bar-chart-line"} text-sm`}></i>
      {isGrafica ? "Ver tabla" : "Ver gráfica"}
    </button>
  );
}

// ── Encabezado de sección ──────────────────────────────────────
function SectionHeader({ title, icon, isGrafica, onToggle, extra }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="flex items-center gap-2 text-sm font-bold text-lila m-0">
        <i className={`bi ${icon} text-lila-mid`}></i>
        {title}
      </h2>
      <div className="flex items-center gap-3">
        {extra}
        <ToggleBtn isGrafica={isGrafica} onClick={onToggle} />
      </div>
    </div>
  );
}

// ── Panel contenedor de sección ────────────────────────────────
function Panel({ children }) {
  return (
    <div className="bg-bg-card rounded-xl border border-lila/10 shadow-lg p-5 w-full">
      {children}
    </div>
  );
}

// ── Fila de tabla genérica ─────────────────────────────────────
function Tr({ children, idx }) {
  return (
    <tr className={idx % 2 === 0 ? "bg-black/10" : ""}>
      {children}
    </tr>
  );
}

function Td({ children, mono, color, align = "center" }) {
  return (
    <td
      className={`p-3 text-xs border-b border-lila/5 ${mono ? "font-mono" : "font-poppins"}`}
      style={{ textAlign: align, color: color || C.lilaSoft }}
    >
      {children}
    </td>
  );
}

// ── Skeleton loader ────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-8 bg-lila/5 rounded-lg w-full"></div>
      ))}
    </div>
  );
}

// ── Helpers para derivar datos de gráficas ─────────────────────

/** Agrupa recepciones por status y cuenta */
function recepcionesPieData(receps) {
  const counts = receps.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  const colorMap = {
    COMPLETED:  C.verde,
    CONFIRMED:  C.verde,
    PENDING:    C.amarillo,
    DRAFT:      C.lilaMid,
  };
  return Object.entries(counts).map(([name, value]) => ({
    name,
    value,
    color: colorMap[name] || C.lilaSoft,
  }));
}

/** Cuenta entradas y salidas de movimientos */
function movimientosBarData(movs) {
  const data = { Entrada: 0, Salida: 0 };
  movs.forEach((m) => {
    const tipo = m.tipo?.toLowerCase().includes("entr") ? "Entrada" : "Salida";
    data[tipo] += Math.abs(Number(m.cantidad) || 0);
  });
  return [
    { tipo: "Entradas", cantidad: data.Entrada, color: C.verde },
    { tipo: "Salidas",  cantidad: data.Salida,  color: C.rojo  },
  ];
}

/** Cuenta acciones del log de auditoría */
function auditBarData(logs) {
  const counts = logs.reduce((acc, l) => {
    acc[l.action] = (acc[l.action] || 0) + 1;
    return acc;
  }, {});
  const colorMap = {
    CREATE: C.azul,
    UPDATE: C.amarillo,
    DELETE: C.rojo,
    READ:   C.lilaMid,
  };
  return Object.entries(counts).map(([accion, total]) => ({
    accion,
    total,
    color: colorMap[accion] || C.lilaSoft,
  }));
}

// ══════════════════════════════════════════════════════════════
//  DASHBOARD PRINCIPAL
// ══════════════════════════════════════════════════════════════

export default function Dashboard() {
  // ── Estado principal ───────────────────────────────────────
  const [summary,  setSummary]  = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState({ message: "", type: "error" });

  // ── Toggles tabla/gráfica por sección ─────────────────────
  const [views, setViews] = useState({
    productos:   false,   // false = tabla, true = gráfica
    recepciones: false,
    movimientos: false,
    auditoria:   false,
  });

  const toggleView = (section) =>
    setViews((prev) => ({ ...prev, [section]: !prev[section] }));

  // ── Fetch /summary ─────────────────────────────────────────
const fetchSummary = useCallback(async () => {
  setLoading(true);

  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}/dashboard/summary`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Error ${res.status}`);
    }

    const data = await res.json();
    setSummary(data);

  } catch (err) {
    setToast({
      message: `No se pudo cargar el resumen: ${err.message}`,
      type: "error",
    });

  } finally {
    setLoading(false);
  }
}, []);

// ── Fetch /recent-activity ─────────────────────────────────
const fetchActivity = useCallback(async () => {
  if (activity) return;

  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${API_BASE}/dashboard/recent-activity?limit=10`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Error ${res.status}`);
    }

    const data = await res.json();
    setActivity(data.items ?? []);

  } catch (err) {
    setToast({
      message: `No se pudo cargar la actividad: ${err.message}`,
      type: "error",
    });
  }
}, [activity]);
  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  // Cuando se abre la sección de auditoría, carga el endpoint lazy
  useEffect(() => {
    if (views.auditoria) fetchActivity();
  }, [views.auditoria, fetchActivity]);

  // ── Datos derivados para gráficas ──────────────────────────
  const t    = summary?.totals ?? {};
  const lsp  = summary?.lowStockProducts        ?? [];
  const recep = summary?.recepcionesRecientes   ?? [];
  const movs  = summary?.recentInventoryMovements ?? [];
  const audit = summary?.recentAudit            ?? [];
  const acts  = activity ?? audit; // usa recentAudit hasta que cargue /activity

  const pieRecep   = recepcionesPieData(recep);
  const barMovs    = movimientosBarData(movs);
  const barAudit   = auditBarData(acts);

  // ── Formatters ─────────────────────────────────────────────
  const fmt = (n) => Number(n ?? 0).toLocaleString("es-MX");
  const fmtDate = (d) => {
    if (!d) return "—";
    try { return new Date(d).toLocaleDateString("es-MX"); } catch { return d; }
  };
  const fmtCur = (n) => `$${Number(n ?? 0).toLocaleString("es-MX")}`;

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-8 space-y-6 font-poppins">

      {/* Toast de errores */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "error" })}
      />

      {/* ── Encabezado de página ──────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-lila m-0">Dashboard</h1>
          <p className="text-xs text-text-muted mt-1 m-0">
            Resumen general · {new Date().toLocaleDateString("es-MX", { dateStyle: "long" })}
          </p>
        </div>
        <button
          onClick={fetchSummary}
          className="flex items-center gap-2 bg-transparent text-lila-soft border border-lila/20
                     rounded-lg px-4 py-2 text-xs font-bold hover:bg-lila hover:text-oscuro
                     transition-all active:scale-95 cursor-pointer"
        >
          <i className="bi bi-arrow-clockwise"></i>
          Actualizar
        </button>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-bg-card rounded-xl animate-pulse border border-lila/10" />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          <Tarjetas
            label="Total productos"
            value={fmt(t.products)}
            sub={`${fmt(t.activeProducts)} activos`}
            accent={C.lilaMid}
            icon="bi bi-box-seam"
          />
          <Tarjetas
            label="Clientes"
            value={fmt(t.clients)}
            sub={`${fmt(t.activeClients)} activos`}
            accent={C.azul}
            icon="bi bi-people"
          />
          <Tarjetas
            label="Proveedores"
            value={fmt(t.suppliers)}
            sub={`${fmt(t.activeSuppliers)} activos`}
            accent={C.verde}
            icon="bi bi-truck"
          />
          <Tarjetas
            label="Recepciones"
            value={fmt(t.recepciones)}
            sub="total acumulado"
            accent={C.naranja}
            icon="bi bi-clipboard-check"
          />
          <Tarjetas
            label="Bajo stock"
            value={fmt(summary?.lowStockCount)}
            sub="requieren reorden"
            accent={C.rojo}
            icon="bi bi-exclamation-triangle"
          />
        </div>
      )}

      {/* ── Alerta bajo stock ──────────────────────────────── */}
      {!loading && summary?.lowStockCount > 0 && (
        <div
          className="flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-medium"
          style={{
            background: C.rojo + "18",
            border: `1px solid ${C.rojo}44`,
            color: C.rojo,
          }}
        >
          <i className="bi bi-exclamation-triangle-fill text-base"></i>
          <span>
            <b>{summary.lowStockCount} producto{summary.lowStockCount > 1 ? "s" : ""}</b>
            {" "}por debajo del stock mínimo. Revisa la sección de inventario.
          </span>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          SECCIÓN 1: Inventario · Bajo stock
      ════════════════════════════════════════════════════ */}
      <Panel>
        <SectionHeader
          title="Inventario · Bajo stock"
          icon="bi-box-seam"
          isGrafica={views.productos}
          onToggle={() => toggleView("productos")}
        />

        {loading ? <Skeleton /> : views.productos ? (
          /* ── Gráfica de stock actual vs mínimo ── */
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lsp.slice(0, 8).map((p) => ({
                nombre: p.nombre?.slice(0, 12) ?? p.sku,
                stock:  Number(p.stock        ?? 0),
                min:    Number(p.stockMinimo  ?? 0),
              }))} barSize={20}>
                <CartesianGrid stroke="rgba(231,214,255,0.07)" vertical={false} />
                <XAxis dataKey="nombre" tick={{ fill: C.lilaSoft, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.lilaSoft, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip {...TOOLTIP} />
                <Bar dataKey="stock" name="Stock actual"  fill={C.lilaMid}       radius={[4, 4, 0, 0]} />
                <Bar dataKey="min"   name="Stock mínimo"  fill={C.rojo + "80"}   radius={[4, 4, 0, 0]} />
                <Legend wrapperStyle={{ fontSize: 11, color: C.lilaSoft, paddingTop: 8 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          /* ── Tabla de productos bajo stock ── */
          <Tabla encabezados={["SKU", "Nombre", "Stock actual", "Stock mínimo", "Déficit", "Estado"]}>
            {lsp.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-text-muted py-6 text-sm">
                  Sin productos con bajo stock 🎉
                </td>
              </tr>
            ) : lsp.map((p, i) => (
              <Tr key={p.id} idx={i}>
                <Td mono color={C.azul}>{p.sku}</Td>
                <Td align="left">{p.nombre}</Td>
                <Td color={Number(p.stock) <= Number(p.stockMinimo) ? C.rojo : C.verde}>
                  <b>{fmt(p.stock)}</b>
                </Td>
                <Td>{fmt(p.stockMinimo)}</Td>
                <Td color={C.rojo}>
                  <b>−{Math.max(0, Number(p.stockMinimo) - Number(p.stock))}</b>
                </Td>
                <Td><Etiquetas contenido={p.activo ? "Activo" : "Inactivo"} /></Td>
              </Tr>
            ))}
          </Tabla>
        )}
      </Panel>

      {/* ════════════════════════════════════════════════════
          SECCIÓN 2: Recepciones
      ════════════════════════════════════════════════════ */}
      <Panel>
        <SectionHeader
          title="Recepciones recientes"
          icon="bi-clipboard-check"
          isGrafica={views.recepciones}
          onToggle={() => toggleView("recepciones")}
        />

        {loading ? <Skeleton /> : views.recepciones ? (
          /* ── Pie chart + leyenda ── */
          <div className="flex items-center gap-6" style={{ height: 240 }}>
            <div style={{ flex: "0 0 220px", height: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieRecep}
                    cx="50%" cy="50%"
                    outerRadius={88} innerRadius={42}
                    dataKey="value"
                    paddingAngle={3}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: "rgba(231,214,255,0.2)" }}
                  >
                    {pieRecep.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP.contentStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3">
              {pieRecep.map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="flex items-center gap-2 text-xs" style={{ color: C.lilaSoft }}>
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, display: "inline-block" }}></span>
                      {s.name}
                    </span>
                    <b className="text-sm" style={{ color: s.color }}>{s.value}</b>
                  </div>
                  <div style={{ height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 3 }}>
                    <div style={{
                      height: 5,
                      width: `${(s.value / Math.max(recep.length, 1) * 100).toFixed(0)}%`,
                      background: s.color,
                      borderRadius: 3,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ── Tabla de recepciones ── */
          <Tabla encabezados={["Folio", "Proveedor", "Fecha", "Total", "Estado"]}>
            {recep.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-text-muted py-6 text-sm">Sin recepciones recientes</td>
              </tr>
            ) : recep.map((r, i) => (
              <Tr key={r.id} idx={i}>
                <Td mono color={C.azul}>{r.folio}</Td>
                <Td align="left">{r.supplierNombre}</Td>
                <Td>{fmtDate(r.fecha || r.createdAt)}</Td>
                <Td color={C.verde}><b>{fmtCur(r.total)}</b></Td>
                <Td>
                  <Etiquetas contenido={
                    r.status === "COMPLETED" ? "Confirmado"
                    : r.status === "PENDING"   ? "Pendiente"
                    : "Draft"
                  } />
                </Td>
              </Tr>
            ))}
          </Tabla>
        )}
      </Panel>

      {/* ════════════════════════════════════════════════════
          SECCIÓN 3 + 4: Grid 2 columnas
      ════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* ── Movimientos de inventario ── */}
        <Panel>
          <SectionHeader
            title="Movimientos de inventario"
            icon="bi-arrow-left-right"
            isGrafica={views.movimientos}
            onToggle={() => toggleView("movimientos")}
          />

          {loading ? <Skeleton /> : views.movimientos ? (
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={movs.map((m, idx) => ({
                  idx: idx + 1,
                  cantidad: Math.abs(Number(m.cantidad) || 0),
                  tipo: m.tipo?.toLowerCase().includes("entr") ? "entrada" : "salida",
                }))}>
                  <defs>
                    <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={C.verde} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={C.verde} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(231,214,255,0.07)" vertical={false} />
                  <XAxis dataKey="idx" tick={{ fill: C.lilaSoft, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.lilaSoft, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    {...TOOLTIP}
                    formatter={(value, name, props) => [
                      `${value} unidades`,
                      props.payload.tipo === "entrada" ? "Entrada" : "Salida",
                    ]}
                  />
                  <Area
                    type="monotone" dataKey="cantidad"
                    name="Cantidad"
                    stroke={C.verde} fill="url(#gV)" strokeWidth={2} dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
              {/* Mini resumen entradas vs salidas */}
              <div className="flex gap-4 mt-3">
                {barMovs.map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs" style={{ color: C.lilaSoft }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: b.color, flexShrink: 0 }}></span>
                    <span>{b.tipo}</span>
                    <b style={{ color: b.color }}>{fmt(b.cantidad)} uds</b>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Tabla encabezados={["Producto", "Tipo", "Cant.", "Ant. → Nuevo", "Usuario"]}>
              {movs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-text-muted py-6 text-sm">Sin movimientos recientes</td>
                </tr>
              ) : movs.map((m, i) => {
                const esEntrada = m.tipo?.toLowerCase().includes("entr");
                return (
                  <Tr key={m.id} idx={i}>
                    <Td align="left"><span className="text-xs">{m.productNombre}</span></Td>
                    <Td><Etiquetas contenido={esEntrada ? "Activo" : "Inactivo"} /></Td>
                    <Td color={esEntrada ? C.verde : C.rojo}>
                      <b>{esEntrada ? "+" : ""}{fmt(m.cantidad)}</b>
                    </Td>
                    <Td mono color={C.lilaSoft}>
                      <span className="text-xs">{fmt(m.stockAnterior)} → {fmt(m.stockNuevo)}</span>
                    </Td>
                    <Td color={C.lilaMid}>{m.usuario}</Td>
                  </Tr>
                );
              })}
            </Tabla>
          )}
        </Panel>

        {/* ── Auditoría / Actividad reciente ── */}
        <Panel>
          <SectionHeader
            title="Actividad · Auditoría"
            icon="bi-clock-history"
            isGrafica={views.auditoria}
            onToggle={() => toggleView("auditoria")}
          />

          {loading ? <Skeleton /> : views.auditoria ? (
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barAudit} layout="vertical" barSize={16}>
                  <CartesianGrid stroke="rgba(231,214,255,0.07)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: C.lilaSoft, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis
                    dataKey="accion" type="category"
                    tick={{ fill: C.lilaSoft, fontSize: 10 }}
                    axisLine={false} tickLine={false} width={52}
                  />
                  <Tooltip {...TOOLTIP} />
                  <Bar dataKey="total" name="Total acciones" radius={[0, 4, 4, 0]}>
                    {barAudit.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Tabla encabezados={["Acción", "Recurso", "ID", "Usuario", "Cuándo"]}>
              {acts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-text-muted py-6 text-sm">Sin actividad reciente</td>
                </tr>
              ) : acts.map((a, i) => (
                <Tr key={a.id} idx={i}>
                  <Td>
                    <Etiquetas contenido={
                      a.action === "CREATE" ? "Activo"
                      : a.action === "UPDATE" ? "Pendiente"
                      : a.action === "DELETE" ? "Inactivo"
                      : "Default"
                    } />
                  </Td>
                  <Td color={C.lilaMid}>{a.resource}</Td>
                  <Td mono color={C.lilaSoft}>
                    <span className="text-xs">{a.resourceId?.slice(0, 10)}</span>
                  </Td>
                  <Td color={C.azul}>{a.usuario}</Td>
                  <Td color={C.muted}>
                    {fmtDate(a.createdAt)}
                  </Td>
                </Tr>
              ))}
            </Tabla>
          )}
        </Panel>

      </div>
    </div>
  );
}
