import { useState, useEffect, useRef, useMemo } from "react";
import axios from "../api/axios";
import "./reportes.css";

const NAV_ITEMS = [
  { id: "inicio", label: "INICIO" },
  { id: "inventario", label: "INVENTARIO" },
  { id: "reportes", label: "REPORTES" },
  { id: "administracion", label: "ADMINISTRACIÓN", soloAdmin: true },
];

const RANGOS = [
  { dias: 7, label: "7 DÍAS" },
  { dias: 30, label: "30 DÍAS" },
  { dias: 365, label: "AÑO" },
];

// Estilo por motivo de retiro (mismos valores que ofrece el select de
// Inventario al retirar un producto — si se agrega uno ahí, sumarlo acá).
const MOTIVO_ESTILO = {
  Vencimiento: { color: "#e1222a", tinta: "#fff" },
  "Producto dañado": { color: "#f1bd30", tinta: "#000" },
  "Rotura de envase": { color: "#f1bd30", tinta: "#000" },
  "Control de calidad": { color: "#f1bd30", tinta: "#000" },
  Otro: { color: "#5a5a5a", tinta: "#fff" },
};
const estiloMotivo = (motivo) =>
  MOTIVO_ESTILO[motivo] || { color: "#5a5a5a", tinta: "#fff" };

const CHIPS_MOTIVO = [
  { id: "todos", label: "TODOS" },
  ...Object.keys(MOTIVO_ESTILO).map((motivo) => ({
    id: motivo,
    label: motivo.toUpperCase(),
  })),
];

// Color por ranking descendente: el primero (peor) en rojo, el último
// (mejor) en verde, y todo lo del medio en amarillo. Con 1 solo valor
// (p. ej. un Operario viendo solo su sucursal) queda en rojo.
function colorRankingDesc(indice, total) {
  if (total <= 1 || indice === 0) return "#e1222a";
  if (indice === total - 1) return "#0ba852";
  return "#f1bd30";
}

// Color del top de productos: 1-2 rojo, 3-4 amarillo, 5+ gris neutro.
function colorTop(indice) {
  if (indice < 2) return "#e1222a";
  if (indice < 4) return "#f1bd30";
  return "#c9c9c9";
}

function formatoNum(n) {
  return Number(n || 0).toLocaleString("es-AR");
}

function formatoCorto(fecha) {
  return `${String(fecha.getDate()).padStart(2, "0")}/${String(
    fecha.getMonth() + 1
  ).padStart(2, "0")}`;
}

function formatoFechaHora(fecha) {
  const dias = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
  const meses = [
    "ENE", "FEB", "MAR", "ABR", "MAY", "JUN",
    "JUL", "AGO", "SEP", "OCT", "NOV", "DIC",
  ];
  const hh = String(fecha.getHours()).padStart(2, "0");
  const mm = String(fecha.getMinutes()).padStart(2, "0");
  return `${dias[fecha.getDay()]} ${formatoCorto(fecha)} ${meses[fecha.getMonth()]} ${fecha.getFullYear()} · ${hh}:${mm}`;
}

function exportarCsv(retiros) {
  const filas = [
    ["FECHA", "PRODUCTO", "DEPARTAMENTO", "CANTIDAD", "MOTIVO", "RETIRÓ", "SUCURSAL"],
  ];

  retiros.forEach((r) => {
    filas.push([
      r.fecha_retiro ? new Date(r.fecha_retiro).toLocaleDateString("es-AR") : "-",
      r.producto,
      r.departamento || "",
      r.cantidad,
      r.motivo,
      r.usuario,
      r.sucursal,
    ]);
  });

  const csv = filas
    .map((fila) => fila.map((celda) => `"${String(celda).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "reportes-mermas.csv";
  link.click();

  URL.revokeObjectURL(url);
}

export default function Reportes({ onNavegar, usuario, onLogout }) {
  const esAdmin = usuario?.rol !== "Operario";

  // Tema claro/oscuro (persistido, compartido entre páginas)
  const [tema, setTema] = useState(() => {
    try {
      return localStorage.getItem("gondolapro_tema") || "oscuro";
    } catch {
      return "oscuro";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("gondolapro_tema", tema);
    } catch {
      // localStorage no disponible: no es crítico.
    }
  }, [tema]);

  // Menú de usuario (cerrar sesión)
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
  const menuUsuarioRef = useRef(null);

  useEffect(() => {
    const handleClickFuera = (e) => {
      if (menuUsuarioRef.current && !menuUsuarioRef.current.contains(e.target)) {
        setMenuUsuarioAbierto(false);
      }
    };

    document.addEventListener("mousedown", handleClickFuera);

    return () => {
      document.removeEventListener("mousedown", handleClickFuera);
    };
  }, []);

  const [listaSucursales, setListaSucursales] = useState([]);

  useEffect(() => {
    const cargarSucursales = async () => {
      try {
        const response = await axios.get("/sucursales");
        setListaSucursales(response.data);
      } catch (error) {
        console.error("Error cargando sucursales:", error);
      }
    };

    cargarSucursales();
  }, []);

  // ── Filtros ──────────────────────────────────────────────────────────────
  const [dias, setDias] = useState(30);
  const [motivoFiltro, setMotivoFiltro] = useState("todos");

  const idSucursalEfectiva = !esAdmin ? usuario?.id_sucursal || null : null;

  // ── Datos ────────────────────────────────────────────────────────────────
  const [retiros, setRetiros] = useState([]);
  const [resumen, setResumen] = useState({
    totalRetiros: 0,
    totalUnidades: 0,
    unidadesPeriodoAnterior: 0,
    porMotivo: [],
    porSucursal: [],
    topProductos: [],
  });
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const cargarReportes = async () => {
      setCargando(true);
      try {
        const params = new URLSearchParams();
        params.append("dias", dias);
        if (idSucursalEfectiva) params.append("id_sucursal", idSucursalEfectiva);
        const qs = params.toString();

        const [retirosRes, resumenRes] = await Promise.all([
          axios.get(`/retiros?${qs}`),
          axios.get(`/retiros/resumen?${qs}`),
        ]);

        setRetiros(retirosRes.data);
        setResumen({
          totalRetiros: Number(resumenRes.data.totalRetiros || 0),
          totalUnidades: Number(resumenRes.data.totalUnidades || 0),
          unidadesPeriodoAnterior: Number(resumenRes.data.unidadesPeriodoAnterior || 0),
          porMotivo: resumenRes.data.porMotivo || [],
          porSucursal: resumenRes.data.porSucursal || [],
          topProductos: resumenRes.data.topProductos || [],
        });
      } catch (error) {
        console.error("Error cargando reportes:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarReportes();
  }, [dias, idSucursalEfectiva]);

  const retirosFiltrados = useMemo(() => {
    if (motivoFiltro === "todos") return retiros;
    return retiros.filter((r) => r.motivo === motivoFiltro);
  }, [retiros, motivoFiltro]);

  // ── Derivados para los gráficos ─────────────────────────────────────────
  const maxMotivo = Math.max(1, ...resumen.porMotivo.map((m) => m.unidades));
  const motivosView = resumen.porMotivo.map((m) => {
    const estilo = estiloMotivo(m.motivo);
    return {
      ...m,
      ...estilo,
      ancho: `${Math.round((m.unidades / maxMotivo) * 100)}%`,
      porcentaje:
        resumen.totalUnidades > 0
          ? `${Math.round((m.unidades / resumen.totalUnidades) * 100)}%`
          : "0%",
    };
  });

  const maxSucursal = Math.max(1, ...resumen.porSucursal.map((s) => s.unidades));
  const sucursalesView = resumen.porSucursal.map((s, i) => ({
    ...s,
    alto: `${Math.max(4, Math.round((s.unidades / maxSucursal) * 100))}%`,
    color: colorRankingDesc(i, resumen.porSucursal.length),
  }));

  const topView = resumen.topProductos.map((p, i) => ({
    ...p,
    puesto: i + 1,
    color: colorTop(i),
  }));

  // Tendencia vs. el período anterior de igual duración
  const { anterior, actual } = { anterior: resumen.unidadesPeriodoAnterior, actual: resumen.totalUnidades };
  const hayDatosPrevios = anterior > 0;
  const cambioPct = hayDatosPrevios ? Math.round(((actual - anterior) / anterior) * 100) : 0;
  const empeoro = cambioPct > 0;

  let tendenciaTexto = "SIN DATOS PREVIOS";
  let tendenciaBg = "var(--rp-surface)";
  let tendenciaTinta = "var(--rp-text-mono)";

  if (hayDatosPrevios) {
    if (cambioPct === 0) {
      tendenciaTexto = "SIN CAMBIOS";
      tendenciaBg = "var(--rp-surface)";
      tendenciaTinta = "var(--rp-text-mono)";
    } else if (empeoro) {
      tendenciaTexto = `↑ ${cambioPct}% MÁS`;
      tendenciaBg = "#e1222a";
      tendenciaTinta = "#fff";
    } else {
      tendenciaTexto = `↓ ${Math.abs(cambioPct)}% MENOS`;
      tendenciaBg = "#0ba852";
      tendenciaTinta = "#000";
    }
  }

  // Lecturas: pequeñas observaciones calculadas a partir de los datos reales.
  const lecturaMotivos = useMemo(() => {
    if (motivosView.length === 0 || resumen.totalUnidades === 0) return "";
    const top = motivosView[0];
    const pct = Math.round((top.unidades / resumen.totalUnidades) * 100);
    return pct >= 50
      ? `${pct}% DE LAS UNIDADES SE DESCARTAN POR ${top.motivo.toUpperCase()}: ES DONDE MÁS SE PUEDE RECUPERAR.`
      : `${top.motivo.toUpperCase()} ES EL MOTIVO MÁS FRECUENTE, CON EL ${pct}% DE LAS UNIDADES.`;
  }, [motivosView, resumen.totalUnidades]);

  const lecturaSucursales = useMemo(() => {
    if (sucursalesView.length < 2) return "";
    const max = sucursalesView[0];
    const min = sucursalesView[sucursalesView.length - 1];
    if (!min.unidades) return "";
    const ratio = (max.unidades / min.unidades).toFixed(1);
    if (ratio === "1.0") return "";
    return `${max.sucursal} DESCARTA ${ratio}X MÁS QUE ${min.sucursal}.`;
  }, [sucursalesView]);

  const lecturaTop = useMemo(() => {
    if (topView.length === 0 || resumen.totalUnidades === 0) return "";
    const suma = topView.reduce((acc, p) => acc + Number(p.unidades || 0), 0);
    const pct = Math.round((suma / resumen.totalUnidades) * 100);
    return `LOS ${topView.length} PRIMEROS CONCENTRAN EL ${pct}% DE LA MERMA TOTAL.`;
  }, [topView, resumen.totalUnidades]);

  const hoy = new Date();
  const desde = new Date(hoy);
  desde.setDate(desde.getDate() - dias);
  const periodoTexto = `PERÍODO ${formatoCorto(desde)} AL ${formatoCorto(hoy)}/${hoy.getFullYear()}`;

  const ambitoTexto = esAdmin
    ? `${listaSucursales.map((s) => s.nombre.toUpperCase()).join(" · ")} — ${periodoTexto}`
    : `SUCURSAL ${(usuario?.sucursal || "").toUpperCase()} — ${periodoTexto}`;

  const sinRetiros = !cargando && resumen.totalRetiros === 0;
  const detalleContexto =
    resumen.totalRetiros === 0
      ? "0 OPERACIONES"
      : retiros.length < resumen.totalRetiros
      ? `${formatoNum(resumen.totalRetiros)} OPERACIONES · ${retiros.length} MÁS RECIENTES`
      : `${formatoNum(resumen.totalRetiros)} OPERACIONES`;

  const piePrincipal =
    resumen.totalRetiros === 0
      ? "SIN OPERACIONES EN EL PERÍODO"
      : `${formatoNum(resumen.totalRetiros)} RETIROS · ${formatoNum(resumen.totalUnidades)} UNIDADES · DATOS AL ${formatoFechaHora(hoy)}`;

  return (
    <div className="rp-shell" data-tema={tema}>
      {/* Sidebar */}
      <aside className="rp-sidebar">
        <div className="rp-sidebar-top">
          <div className="rp-logo">GóndolaPro</div>
          <div className="rp-sublogo">SISTEMA DE INVENTARIO</div>
        </div>

        <nav className="rp-nav">
          {NAV_ITEMS.filter((item) => !item.soloAdmin || usuario?.rol !== "Operario").map(
            (item) => (
              <a
                key={item.id}
                className={`rp-nav-item${item.id === "reportes" ? " activo" : ""}`}
                onClick={() => onNavegar(item.id)}
              >
                {item.label}
              </a>
            )
          )}
        </nav>

        <div className="rp-theme-switch">
          <button
            className={`rp-theme-btn${tema === "oscuro" ? " activo" : ""}`}
            onClick={() => setTema("oscuro")}
          >
            🌙 OSCURO
          </button>
          <button
            className={`rp-theme-btn${tema === "claro" ? " activo" : ""}`}
            onClick={() => setTema("claro")}
          >
            ☀️ CLARO
          </button>
        </div>

        <div className="rp-sidebar-footer" ref={menuUsuarioRef}>
          <button className="rp-user-btn" onClick={() => setMenuUsuarioAbierto((v) => !v)}>
            <span className="rp-user-info">
              <span className="rp-user-name">{usuario?.nombre || "Usuario"}</span>
              <span className="rp-user-role">{(usuario?.rol || "").toUpperCase()}</span>
            </span>
            <span className="rp-user-caret">{menuUsuarioAbierto ? "▴" : "▾"}</span>
          </button>

          {menuUsuarioAbierto && (
            <div className="rp-user-menu">
              <button
                className="rp-user-menu-item"
                onClick={() => {
                  setMenuUsuarioAbierto(false);
                  onLogout?.();
                }}
              >
                CERRAR SESIÓN
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="rp-main">
        <div className="rp-topbar">
          <div className="rp-title-group">
            <h1 className="rp-title">Reportes de mermas</h1>
            <div className="rp-subtitle">{ambitoTexto}</div>
          </div>

          <div className="rp-topbar-acciones">
            <div className="rp-tiempo">
              {RANGOS.map((r) => (
                <button
                  key={r.dias}
                  className={`rp-tiempo-btn${dias === r.dias ? " activo" : ""}`}
                  onClick={() => setDias(r.dias)}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <button className="rp-btn-exportar" onClick={() => exportarCsv(retirosFiltrados)}>
              EXPORTAR CSV
            </button>
          </div>
        </div>

        <div className="rp-resumen">
          <div className="rp-resumen-label">EN LOS ÚLTIMOS {dias} DÍAS SE DESCARTARON</div>

          <div className="rp-resumen-fila">
            <span className="rp-total-num">{formatoNum(resumen.totalUnidades)}</span>

            <span className="rp-total-detalle">
              <span className="rp-total-unidad">unidades</span>
              <span className="rp-total-retiros">
                EN {formatoNum(resumen.totalRetiros)} RETIROS
              </span>
            </span>

            <span className="rp-tendencia">
              <span
                className="rp-tendencia-badge"
                style={{ background: tendenciaBg, color: tendenciaTinta }}
              >
                {tendenciaTexto}
              </span>
              <span className="rp-tendencia-hint">
                VS. {dias} DÍAS ANTERIORES ({formatoNum(resumen.unidadesPeriodoAnterior)} U.)
              </span>
            </span>
          </div>
        </div>

        {motivosView.length > 0 && (
          <div className="rp-motivos">
            <span className="rp-seccion-titulo">UNIDADES POR MOTIVO</span>

            {motivosView.map((m) => (
              <div className="rp-motivo-fila" key={m.motivo}>
                <span className="rp-motivo-nombre">{(m.motivo || "").toUpperCase()}</span>
                <span className="rp-motivo-track">
                  <span
                    className="rp-motivo-fill"
                    style={{ width: m.ancho, background: m.color }}
                  />
                </span>
                <span className="rp-motivo-unidades">{formatoNum(m.unidades)}</span>
                <span className="rp-motivo-pct">{m.porcentaje}</span>
              </div>
            ))}

            {lecturaMotivos && <div className="rp-lectura">{lecturaMotivos}</div>}
          </div>
        )}

        {(sucursalesView.length > 0 || topView.length > 0) && (
          <div className="rp-grid2">
            <div className="rp-col rp-col-borde">
              <div className="rp-col-header">
                <span className="rp-seccion-titulo">UNIDADES POR SUCURSAL</span>
              </div>

              <div className="rp-sucursales-barras">
                {sucursalesView.map((s) => (
                  <div className="rp-sucursal-col" key={s.sucursal}>
                    <span className="rp-sucursal-unidades">{formatoNum(s.unidades)}</span>
                    <span
                      className="rp-sucursal-barra"
                      style={{ height: s.alto, background: s.color }}
                    />
                    <span className="rp-sucursal-nombre">{s.sucursal}</span>
                  </div>
                ))}
              </div>

              {lecturaSucursales && <div className="rp-lectura">{lecturaSucursales}</div>}
            </div>

            <div className="rp-col">
              <div className="rp-col-header">
                <span className="rp-seccion-titulo">LOS 5 PRODUCTOS QUE MÁS SE DESCARTAN</span>
              </div>

              <div className="rp-top-lista">
                {topView.map((p) => (
                  <div className="rp-top-fila" key={p.producto}>
                    <span className="rp-top-puesto" style={{ color: p.color }}>
                      {p.puesto}
                    </span>
                    <span className="rp-top-nombre">{p.producto}</span>
                    <span className="rp-top-unidades">{formatoNum(p.unidades)} u.</span>
                  </div>
                ))}
              </div>

              {lecturaTop && <div className="rp-lectura">{lecturaTop}</div>}
            </div>
          </div>
        )}

        <div className="rp-detalle-header">
          <span className="rp-detalle-titulo">
            <span className="rp-seccion-titulo">DETALLE DE CADA RETIRO</span>
            <span className="rp-detalle-contexto">{detalleContexto}</span>
          </span>

          <span className="rp-chips">
            {CHIPS_MOTIVO.map((c) => (
              <button
                key={c.id}
                className={`rp-chip${motivoFiltro === c.id ? " activo" : ""}`}
                onClick={() => setMotivoFiltro(c.id)}
              >
                {c.label}
              </button>
            ))}
          </span>
        </div>

        <div className="rp-thead">
          <span>PRODUCTO</span>
          <span>UNIDADES</span>
          <span>MOTIVO</span>
          <span>FECHA ↓</span>
          <span>RETIRÓ</span>
          <span>SUCURSAL</span>
        </div>

        {cargando ? (
          <div className="rp-vacio">
            <span className="rp-vacio-texto">CARGANDO REPORTES…</span>
          </div>
        ) : sinRetiros ? (
          <div className="rp-sin-datos">
            <span className="rp-sin-datos-titulo">Todavía no hay retiros registrados</span>
            <span className="rp-sin-datos-detalle">
              CUANDO UN OPERARIO RETIRE UN PRODUCTO EN INVENTARIO, APARECE ACÁ
            </span>
          </div>
        ) : retirosFiltrados.length === 0 ? (
          <div className="rp-vacio">
            <span className="rp-vacio-texto">NINGÚN RETIRO COINCIDE CON ESE FILTRO</span>
          </div>
        ) : (
          <div className="rp-tbody">
            {retirosFiltrados.map((r) => {
              const estilo = estiloMotivo(r.motivo);
              return (
                <div className="rp-fila" key={r.id_retiro}>
                  <span className="rp-fila-producto">
                    <span className="rp-fila-marca" style={{ background: estilo.color }} />
                    <span className="rp-fila-producto-info">
                      <span className="rp-fila-nombre">{r.producto}</span>
                      <span className="rp-fila-meta">
                        {[r.departamento, r.codigo_barras].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                  </span>

                  <span className="rp-fila-cantidad">{r.cantidad}</span>

                  <span
                    className="rp-fila-motivo"
                    style={{ background: estilo.color, color: estilo.tinta }}
                  >
                    {(r.motivo || "").toUpperCase()}
                  </span>

                  <span className="rp-fila-fecha">
                    {r.fecha_retiro ? new Date(r.fecha_retiro).toLocaleDateString("es-AR") : "-"}
                  </span>

                  <span className="rp-fila-usuario">{r.usuario}</span>
                  <span className="rp-fila-sucursal">{(r.sucursal || "").toUpperCase()}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="rp-footer">
          <span className="rp-footer-info">{piePrincipal}</span>
          <span className="rp-footer-marca">GÓNDOLAPRO</span>
        </div>
      </div>
    </div>
  );
}
