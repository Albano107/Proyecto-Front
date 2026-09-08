import { useState, useEffect, useRef } from "react";
import axios from "../api/axios";
import "./inicio.css";

const NAV_ITEMS = [
  { id: "inicio", label: "INICIO" },
  { id: "inventario", label: "INVENTARIO" },
  { id: "reportes", label: "REPORTES" },
  { id: "usuarios", label: "USUARIOS", soloAdmin: true },
];

const DIAS = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
const MESES = [
  "ENE", "FEB", "MAR", "ABR", "MAY", "JUN",
  "JUL", "AGO", "SEP", "OCT", "NOV", "DIC",
];

function formatearFechaHora(fecha) {
  const dd = String(fecha.getDate()).padStart(2, "0");
  const hh = String(fecha.getHours()).padStart(2, "0");
  const mm = String(fecha.getMinutes()).padStart(2, "0");
  return `${DIAS[fecha.getDay()]} ${dd} ${MESES[fecha.getMonth()]} ${fecha.getFullYear()} · ${hh}:${mm}`;
}

export default function Inicio({ onNavegar, usuario, onLogout }) {
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
      if (
        menuUsuarioRef.current &&
        !menuUsuarioRef.current.contains(e.target)
      ) {
        setMenuUsuarioAbierto(false);
      }
    };

    document.addEventListener("mousedown", handleClickFuera);

    return () => {
      document.removeEventListener("mousedown", handleClickFuera);
    };
  }, []);

  const [dashboard, setDashboard] = useState({
    verdes: 0,
    amarillos: 0,
    rojos: 0,
    usuariosActivos: 0,
    productosCriticos: [],
    retiros: [],
  });

  const [listaSucursales, setListaSucursales] = useState([]);

  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        const params = new URLSearchParams();

        if (!esAdmin && usuario?.id_sucursal) {
          params.append("id_sucursal", usuario.id_sucursal);
        }

        const response = await axios.get(`/dashboard?${params.toString()}`);
        setDashboard(response.data);
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      }
    };

    cargarDashboard();
  }, [esAdmin, usuario]);

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

  const { verdes, amarillos, rojos, usuariosActivos, productosCriticos, retiros } =
    dashboard;

  const total = verdes + amarillos + rojos;
  const pct = (n) => (total > 0 ? (n / total) * 100 : 0);

  const ahora = new Date();
  const fechaHora = formatearFechaHora(ahora);

  const ambitoLabel = esAdmin ? "ÁMBITO" : "OPERARIO DE LA SUCURSAL";
  const ambitoValor = esAdmin
    ? `${listaSucursales.length} sucursales`
    : usuario?.sucursal || "-";

  const piePrincipal = esAdmin
    ? `${listaSucursales.map((s) => s.nombre.toUpperCase()).join(" · ")} — DATOS AL ${fechaHora}`
    : `SUCURSAL ${(usuario?.sucursal || "").toUpperCase()} — DATOS AL ${fechaHora}`;

  return (
    <div className="ic-shell" data-tema={tema}>
      {/* Sidebar */}
      <aside className="ic-sidebar">
        <div className="ic-sidebar-top">
          <div className="ic-logo">GóndolaPro</div>
          <div className="ic-sublogo">SISTEMA DE INVENTARIO</div>
        </div>

        <nav className="ic-nav">
          {NAV_ITEMS.filter(
            (item) => !item.soloAdmin || usuario?.rol !== "Operario"
          ).map((item) => (
            <a
              key={item.id}
              className={`ic-nav-item${item.id === "inicio" ? " activo" : ""}`}
              onClick={() => onNavegar(item.id)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="ic-theme-switch">
          <button
            className={`ic-theme-btn${tema === "oscuro" ? " activo" : ""}`}
            onClick={() => setTema("oscuro")}
          >
            🌙 OSCURO
          </button>
          <button
            className={`ic-theme-btn${tema === "claro" ? " activo" : ""}`}
            onClick={() => setTema("claro")}
          >
            ☀️ CLARO
          </button>
        </div>

        <div className="ic-sidebar-footer" ref={menuUsuarioRef}>
          <button
            className="ic-user-btn"
            onClick={() => setMenuUsuarioAbierto((v) => !v)}
          >
            <span className="ic-user-info">
              <span className="ic-user-name">
                {usuario?.nombre || "Usuario"}
              </span>
              <span className="ic-user-role">
                {(usuario?.rol || "").toUpperCase()}
              </span>
            </span>
            <span className="ic-user-caret">
              {menuUsuarioAbierto ? "▴" : "▾"}
            </span>
          </button>

          {menuUsuarioAbierto && (
            <div className="ic-user-menu">
              <button
                className="ic-user-menu-item"
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
      <div className="ic-main">
        <div className="ic-topbar">
          <div className="ic-title-group">
            <h1 className="ic-title">Inicio</h1>
            <div className="ic-subtitle">RESUMEN GENERAL DEL SISTEMA</div>
          </div>

          <div className="ic-ambito">
            <div className="ic-ambito-label">{ambitoLabel}</div>
            <div className="ic-ambito-valor">{ambitoValor}</div>
            <div className="ic-fecha">{fechaHora}</div>
          </div>
        </div>

        {/* Stats grandes */}
        <div className="ic-stats">
          <button
            className="ic-stat ic-stat-rojo"
            onClick={() => onNavegar("inventario")}
          >
            <span className="ic-stat-num">{rojos}</span>
            <span className="ic-stat-label">VENCIDOS</span>
          </button>

          <button
            className="ic-stat ic-stat-amarillo"
            onClick={() => onNavegar("inventario")}
          >
            <span className="ic-stat-num">{amarillos}</span>
            <span className="ic-stat-label">POR VENCER</span>
          </button>

          <button
            className="ic-stat ic-stat-verde"
            onClick={() => onNavegar("inventario")}
          >
            <span className="ic-stat-num">{verdes}</span>
            <span className="ic-stat-label">EN REGLA</span>
          </button>

          {esAdmin && (
            <button
              className="ic-stat ic-stat-neutro"
              onClick={() => onNavegar("usuarios")}
            >
              <span className="ic-stat-num">{usuariosActivos}</span>
              <span className="ic-stat-label">USUARIOS ACTIVOS</span>
            </button>
          )}

          <div className="ic-stat ic-stat-total">
            <span className="ic-stat-num">{total}</span>
            <span className="ic-stat-label">TOTAL</span>
          </div>
        </div>

        {/* Barra de proporción */}
        <div className="ic-barra">
          <span
            className="ic-barra-rojo"
            style={{ width: `${pct(rojos)}%` }}
          />
          <span
            className="ic-barra-amarillo"
            style={{ width: `${pct(amarillos)}%` }}
          />
          <span
            className="ic-barra-verde"
            style={{ width: `${pct(verdes)}%` }}
          />
        </div>

        {/* Banner de acción */}
        {rojos > 0 && (
          <div className="ic-banner">
            <span className="ic-banner-dot" />
            <span className="ic-banner-titulo">
              {rojos} producto{rojos === 1 ? "" : "s"} vencido
              {rojos === 1 ? "" : "s"} para retirar
            </span>
            <button
              className="ic-banner-btn"
              onClick={() => onNavegar("inventario")}
            >
              IR A INVENTARIO
            </button>
          </div>
        )}

        {/* Columnas: críticos / retiros */}
        <div className="ic-columnas">
          <div className="ic-columna ic-columna-borde">
            <div className="ic-columna-header">
              <span className="ic-columna-titulo">Productos críticos</span>
              <a
                className="ic-columna-link"
                onClick={() => onNavegar("inventario")}
              >
                VER TODOS →
              </a>
            </div>

            {productosCriticos.length === 0 ? (
              <div className="ic-fila ic-fila-vacia">
                <span className="ic-vacio">NO HAY PRODUCTOS CRÍTICOS</span>
              </div>
            ) : (
              productosCriticos.map((p, index) => (
                <div className="ic-fila ic-fila-criticos" key={index}>
                  <span className="ic-fila-col-nombre">
                    <span className="ic-fila-nombre">{p.producto}</span>
                    <span className="ic-fila-meta">
                      {[p.departamento, p.sucursal]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>

                  <span className="ic-fila-venc">
                    {p.fecha_vencimiento
                      ? String(p.fecha_vencimiento).split("T")[0]
                      : "-"}
                  </span>

                  <span
                    className={`ic-fila-estado ${
                      p.estado === "ROJO"
                        ? "ic-fila-estado-rojo"
                        : "ic-fila-estado-amarillo"
                    }`}
                  >
                    {p.estado === "ROJO" ? "VENCIDO" : "POR VENCER"}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="ic-columna">
            <div className="ic-columna-header">
              <span className="ic-columna-titulo">Últimos retiros</span>
              <a
                className="ic-columna-link"
                onClick={() => onNavegar("reportes")}
              >
                VER TODOS →
              </a>
            </div>

            {retiros.length === 0 ? (
              <div className="ic-fila ic-fila-vacia">
                <span className="ic-vacio">NO HAY RETIROS REGISTRADOS</span>
              </div>
            ) : (
              retiros.map((r, index) => (
                <div className="ic-fila ic-fila-retiros" key={index}>
                  <span className="ic-fila-col-nombre">
                    <span className="ic-fila-nombre">{r.producto}</span>
                    <span className="ic-fila-meta">
                      {[r.usuario, r.sucursal].filter(Boolean).join(" · ")}
                    </span>
                  </span>

                  <span className="ic-fila-cantidad">{r.cantidad} u</span>

                  <span className="ic-fila-fecha">
                    {r.fecha_retiro
                      ? String(r.fecha_retiro).split("T")[0]
                      : "-"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="ic-footer">
          <span className="ic-footer-info">{piePrincipal}</span>
          <span className="ic-footer-marca">GÓNDOLAPRO</span>
        </div>
      </div>
    </div>
  );
}
