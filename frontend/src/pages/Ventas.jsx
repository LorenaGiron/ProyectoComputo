import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Tarjetas from "../components/Tarjetas";
import ToolBar from "../components/ToolBar";
import Tabla from "../components/Tabla";
import AccionesTabla from "../components/AccionesTabla";
import Etiquetas from "../components/Etiquetas";
import Paginacion from "../components/Paginacion";
import ModalConfirmacion from "../components/ModalConfirmacion";
import Encabezado from "../components/Encabezado";
import { api } from "../services/api";

const LIMIT = 10;

function generarDatos30Dias(ventas) {
  const hoy = new Date();
  const dias = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() - (29 - i));
    d.setHours(0, 0, 0, 0);
    return { fecha: d, label: String(d.getDate()).padStart(2, "0"), monto: 0 };
  });

  ventas
    .filter((v) => v.estado === "pagado" || v.estado === "entregado")
    .forEach((v) => {
      const fecha = new Date(v.createdAt);
      fecha.setHours(0, 0, 0, 0);
      const idx = dias.findIndex((d) => d.fecha.getTime() === fecha.getTime());
      if (idx !== -1) dias[idx].monto += v.total;
    });

  return dias;
}

function MiniChart({ data }) {
  const W = 900, H = 160;
  const pad = { l: 42, r: 14, t: 14, b: 26 };
  const iW = W - pad.l - pad.r;
  const iH = H - pad.t - pad.b;
  const max = Math.max(...data.map((d) => d.monto), 1);
  const xStep = iW / (data.length - 1);
  const y = (v) => pad.t + iH - (v / max) * iH;
  const pts = data.map((d, i) => [pad.l + i * xStep, y(d.monto)]);
  const linea = pts.map((p, i) => (i ? `L${p[0]},${p[1]}` : `M${p[0]},${p[1]}`)).join(" ");
  const area  = `${linea} L${pts[pts.length - 1][0]},${pad.t + iH} L${pts[0][0]},${pad.t + iH} Z`;
  const ticks = [0, 0.33, 0.66, 1].map((t) => Math.round(max * t));

  return (
    <svg className="w-full h-[160px]" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E7D6FF" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#E7D6FF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={pad.l} y1={y(t)} x2={W - pad.r} y2={y(t)} stroke="rgba(231,214,255,0.07)" strokeDasharray="2 4" />
          <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="10" fill="rgba(201,184,232,0.45)">
            {t >= 1000 ? `${(t / 1000).toFixed(0)}k` : t}
          </text>
        </g>
      ))}

      {data.map((d, i) => i % 5 === 0 && (
        <text key={i} x={pad.l + i * xStep} y={H - 6} textAnchor="middle" fontSize="10" fill="rgba(201,184,232,0.45)">
          {d.label}
        </text>
      ))}

      <path d={area} fill="url(#vg)" />
      <path d={linea} fill="none" stroke="#E7D6FF" strokeWidth="2.5" />

      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="7" fill="#E7D6FF" opacity="0.2" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="4" fill="#E7D6FF" />
    </svg>
  );
}

const OPCIONES_ESTADO = [
  { value: "",           label: "Todos" },
  { value: "pendiente",  label: "Pendientes" },
  { value: "pagado",     label: "Pagados" },
  { value: "enviado",    label: "Enviados" },
  { value: "entregado",  label: "Entregados" },
  { value: "cancelado",  label: "Cancelados" },
];

const formatFecha = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
};

const formatMoney = (n) => `$${Number(n).toLocaleString("es-MX")}`;

export default function Ventas() {
  const { usuario } = useContext(AuthContext);
  const puedeActualizar = usuario?.permissions?.includes("ventas:update");

  const [ventas, setVentas]               = useState([]);
  const [cargando, setCargando]           = useState(true);
  const [filtroEstado, setFiltroEstado]   = useState("");
  const [busqueda, setBusqueda]           = useState("");
  const [paginaActiva, setPaginaActiva]   = useState(1);
  const [ventaDetalle, setVentaDetalle]   = useState(null);
  const [ventaCancelando, setVentaCancelando] = useState(null);
  const [modalExito, setModalExito]       = useState("");
  const [refresh, setRefresh]             = useState(0);

  useEffect(() => {
    setCargando(true);
    api.get("/ventas?limit=100")
      .then((data) => setVentas(data.items ?? []))
      .catch(() => setVentas([]))
      .finally(() => setCargando(false));
  }, [refresh]);

  useEffect(() => { setPaginaActiva(1); }, [filtroEstado, busqueda]);

  const ventasFiltradas = ventas
    .filter((v) => !filtroEstado || v.estado === filtroEstado)
    .filter((v) => {
      if (!busqueda.trim()) return true;
      const q = busqueda.toLowerCase();
      return (
        v.id.toLowerCase().includes(q) ||
        v.cliente?.nombre?.toLowerCase().includes(q) ||
        v.cliente?.email?.toLowerCase().includes(q)
      );
    });

  const totalRegistros = ventasFiltradas.length;
  const inicio = (paginaActiva - 1) * LIMIT;
  const rows = ventasFiltradas.slice(inicio, inicio + LIMIT);

  const totalIngresos = ventas
    .filter((v) => v.estado === "pagado" || v.estado === "entregado")
    .reduce((acc, v) => acc + v.total, 0);

  const cambiarPagina = (p) => {
    const totalPaginas = Math.max(1, Math.ceil(totalRegistros / LIMIT));
    if (p === "‹") setPaginaActiva((c) => Math.max(1, c - 1));
    else if (p === "›") setPaginaActiva((c) => Math.min(totalPaginas, c + 1));
    else setPaginaActiva(Number(p));
  };

  const cancelarVenta = async () => {
    if (!ventaCancelando) return;
    try {
      await api.patch(`/ventas/${ventaCancelando.id}/estado`, { estado: "cancelado" });
      setRefresh((r) => r + 1);
      setModalExito("Venta cancelada correctamente");
    } catch {
      window.alert("No se pudo cancelar la venta.");
    } finally {
      setVentaCancelando(null);
    }
  };

  const cambiarEstado = async (id, estado) => {
    try {
      await api.patch(`/ventas/${id}/estado`, { estado });
      setRefresh((r) => r + 1);
      setModalExito("Estado actualizado correctamente");
      setVentaDetalle(null);
    } catch {
      window.alert("No se pudo actualizar el estado.");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Encabezado 
        titulo="Ventas" 
        onActualizar={() => setRefresh((r) => r + 1)}
      />

      <div className="flex flex-col sm:flex-row gap-6 w-full mb-8">
        <Tarjetas
          label="Total pedidos"
          value={ventas.length}
          sub="Todos los estados"
          icon="bi bi-bag"
        />
        <Tarjetas
          label="Pagados"
          value={ventas.filter((v) => v.estado === "pagado").length}
          sub="Confirmados"
          accent="#A3E378"
          icon="bi bi-check-circle"
        />
        <Tarjetas
          label="Pendientes"
          value={ventas.filter((v) => v.estado === "pendiente").length}
          sub="Por procesar"
          accent="#F7CB57"
          icon="bi bi-hourglass-split"
        />
        <Tarjetas
          label="Ingresos"
          value={formatMoney(totalIngresos)}
          sub="Pagados + entregados"
          accent="#7EC9ED"
          icon="bi bi-cash-coin"
        />
      </div>

      {/* Gráfica 30 días */}
      <div className="bg-bg-card rounded-xl p-6 border border-lila/10 shadow-lg mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-lila-soft">Tendencia · últimos 30 días</p>
            <p className="text-xs text-text-muted mt-1">Monto total de ventas confirmadas</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] tracking-[2px] text-lila-soft uppercase font-semibold">Total 30d</p>
            <p className="text-lg font-bold text-blanco tabular-nums">{formatMoney(totalIngresos)}</p>
          </div>
        </div>
        <MiniChart data={generarDatos30Dias(ventas)} />
      </div>

      <ToolBar
        filtro={filtroEstado}
        setFiltro={setFiltroEstado}
        opcionesFiltro={OPCIONES_ESTADO}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        placeholderBuscar="Buscar por ID, cliente o email..."
      />

      <Tabla encabezados={["ID", "Fecha", "Cliente", "Método pago", "Artículos", "Total", "Estado", "Acciones"]}>
        {cargando ? (
          <tr>
            <td colSpan={8} className="text-center py-10 text-sm opacity-50 text-lila">
              Cargando ventas...
            </td>
          </tr>
        ) : rows.length === 0 ? (
          <tr>
            <td colSpan={8} className="text-center py-10 text-sm opacity-50 text-lila">
              No hay resultados
            </td>
          </tr>
        ) : rows.map((v) => (
          <tr key={v.id} className="border-b border-lila/5 hover:bg-oscuro/40 transition-colors text-white">
            <td className="p-4 text-center text-xs font-mono text-lila-soft whitespace-nowrap">
              #{v.id.slice(0, 8).toUpperCase()}
            </td>
            <td className="p-4 text-center text-sm whitespace-nowrap">
              {formatFecha(v.createdAt)}
            </td>
            <td className="p-4 text-center text-sm whitespace-nowrap">
              <div className="leading-tight">
                <div className="font-medium">{v.cliente?.nombre}</div>
                <div className="text-xs text-text-muted">{v.cliente?.email}</div>
              </div>
            </td>
            <td className="p-4 text-center text-sm whitespace-nowrap capitalize">
              {v.metodoPago}
            </td>
            <td className="p-4 text-center text-sm whitespace-nowrap">
              {v.items?.reduce((a, i) => a + i.cantidad, 0)} uds.
            </td>
            <td className="p-4 text-center text-sm font-bold text-verde whitespace-nowrap tabular-nums">
              {formatMoney(v.total)}
            </td>
            <td className="p-4 text-center whitespace-nowrap">
              <Etiquetas contenido={v.estado} />
            </td>
            <td className="p-4 align-middle whitespace-nowrap">
              <AccionesTabla
                onVer={() => setVentaDetalle(v)}
                onCancelar={
                  puedeActualizar && v.estado !== "cancelado"
                    ? () => setVentaCancelando(v)
                    : null
                }
              />
            </td>
          </tr>
        ))}
      </Tabla>

      <Paginacion
        paginaActual={paginaActiva}
        totalRegistros={totalRegistros}
        rangoSiguiente={`${totalRegistros === 0 ? 0 : inicio + 1} – ${Math.min(inicio + LIMIT, totalRegistros)}`}
        onCambiarPagina={cambiarPagina}
        exportTitulo="Ventas"
        exportColumnas={[
          { header: "ID",      key: "id",      width: 12 },
          { header: "Fecha",   key: "fecha",   width: 14 },
          { header: "Cliente", key: "cliente", width: 28 },
          { header: "Total",   key: "total",   width: 14 },
          { header: "Estado",  key: "estado",  width: 14 },
        ]}
        exportFilas={ventasFiltradas.map((v) => ({
          id:      `#${v.id.slice(0, 8).toUpperCase()}`,
          fecha:   formatFecha(v.createdAt),
          cliente: v.cliente?.nombre ?? "",
          total:   formatMoney(v.total),
          estado:  v.estado,
        }))}
      />

      {ventaDetalle && (
        <ModalDetalleVenta
          venta={ventaDetalle}
          puedeActualizar={puedeActualizar}
          onClose={() => setVentaDetalle(null)}
          onCambiarEstado={cambiarEstado}
          onCancelar={(v) => { setVentaDetalle(null); setVentaCancelando(v); }}
        />
      )}

      {ventaCancelando && (
        <ModalConfirmacion
          tipo="eliminar"
          titulo="¿Cancelar esta venta?"
          mensaje={`La venta de ${ventaCancelando.cliente?.nombre} por ${formatMoney(ventaCancelando.total)} será marcada como cancelada.`}
          textoConfirmar="Cancelar venta"
          onConfirmar={cancelarVenta}
          onCancelar={() => setVentaCancelando(null)}
        />
      )}

      {modalExito && (
        <ModalConfirmacion
          tipo="exito"
          titulo={modalExito}
          onCancelar={() => setModalExito("")}
        />
      )}
    </div>
  );
}

function ModalDetalleVenta({ venta, puedeActualizar, onClose, onCambiarEstado, onCancelar }) {
  const [nuevoEstado, setNuevoEstado] = useState(venta.estado);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl border border-lila/30 bg-oscuro/90 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between border-b border-lila/10">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-lila/10 text-lila border border-lila/20 font-mono">
              #{venta.id.slice(0, 8).toUpperCase()}
            </span>
            <Etiquetas contenido={venta.estado} />
            <span className="text-xs text-lila-soft capitalize border border-lila/20 px-3 py-1 rounded-full">
              {venta.metodoPago}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-lila opacity-70 hover:opacity-100 transition text-xl ml-4 shrink-0"
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">

          {/* Cliente */}
          <div>
            <p className="text-[11px] tracking-[2px] text-lila-soft uppercase font-bold mb-3">Cliente</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Nombre", value: venta.cliente?.nombre },
                { label: "Email",  value: venta.cliente?.email },
                { label: "Ciudad", value: venta.cliente?.ciudad },
                { label: "Calle",  value: venta.cliente?.calle },
                { label: "C.P.",   value: venta.cliente?.cp },
                { label: "Fecha",  value: formatFecha(venta.createdAt) },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl border border-lila/15 bg-bg-card p-3">
                  <p className="text-[10px] uppercase tracking-widest text-lila-soft mb-1">{label}</p>
                  <p className="text-sm font-semibold text-blanco truncate">{value || "—"}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="text-[11px] tracking-[2px] text-lila-soft uppercase font-bold mb-3">
              Artículos ({venta.items?.length ?? 0})
            </p>
            <div className="flex flex-col gap-2">
              {(venta.items ?? []).map((item, i) => (
                <div key={i} className="flex items-center gap-4 rounded-xl bg-bg-card border border-lila/10 px-4 py-3">
                  <div className="w-9 h-9 rounded-lg bg-lila/10 flex items-center justify-center shrink-0">
                    <i className="bi bi-box text-lila" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-blanco truncate">{item.nombre}</p>
                    <p className="text-xs text-text-muted">Talla {item.talla}</p>
                  </div>
                  <div className="text-center min-w-[48px]">
                    <p className="text-[10px] text-lila-soft">Cant.</p>
                    <p className="text-sm font-bold text-blanco">{item.cantidad}</p>
                  </div>
                  <div className="text-center min-w-[64px]">
                    <p className="text-[10px] text-lila-soft">P. unit.</p>
                    <p className="text-sm font-bold text-blanco tabular-nums">{formatMoney(item.precioUnitario)}</p>
                  </div>
                  <div className="text-center min-w-[72px]">
                    <p className="text-[10px] text-lila-soft">Subtotal</p>
                    <p className="text-sm font-bold text-lila tabular-nums">{formatMoney(item.cantidad * item.precioUnitario)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totales */}
          <div className="bg-bg-card border border-lila/10 rounded-xl p-4 flex flex-col gap-1.5">
            <div className="flex justify-between text-sm text-lila-soft">
              <span>Subtotal</span>
              <b className="text-blanco tabular-nums">{formatMoney(venta.subtotal)}</b>
            </div>
            <div className="flex justify-between text-sm text-lila-soft">
              <span>Envío</span>
              <b className={`tabular-nums ${venta.envio === 0 ? "text-verde" : "text-blanco"}`}>
                {venta.envio === 0 ? "GRATIS" : formatMoney(venta.envio)}
              </b>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-lila/15">
              <span className="text-base font-semibold text-blanco">Total</span>
              <b className="text-2xl font-extrabold text-verde tabular-nums">{formatMoney(venta.total)}</b>
            </div>
          </div>

          {/* Cambiar estado */}
          {puedeActualizar && venta.estado !== "cancelado" && (
            <div>
              <p className="text-[11px] tracking-[2px] text-lila-soft uppercase font-bold mb-2">Cambiar estado</p>
              <div className="flex gap-2">
                <select
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value)}
                  className="flex-1 bg-bg-card text-lila border border-lila/20 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-lila capitalize"
                >
                  {["pendiente", "pagado", "enviado", "entregado", "cancelado"].map((e) => (
                    <option key={e} value={e} className="bg-oscuro capitalize">{e}</option>
                  ))}
                </select>
                <button
                  onClick={() => onCambiarEstado(venta.id, nuevoEstado)}
                  disabled={nuevoEstado === venta.estado}
                  className="bg-lila text-oscuro font-bold px-5 py-2 rounded-xl hover:bg-lila-soft transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Guardar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-lila/10 flex justify-between items-center gap-3 flex-wrap">
          <div>
            {puedeActualizar && venta.estado !== "cancelado" && (
              <button
                onClick={() => onCancelar(venta)}
                className="text-rojo border border-rojo/30 bg-rojo/10 rounded-lg px-4 py-2 text-sm font-bold hover:bg-rojo/20 transition"
              >
                <i className="bi bi-slash-circle mr-1" />Cancelar venta
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="bg-lila text-oscuro font-bold px-6 py-2 rounded-xl hover:bg-lila-soft transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
