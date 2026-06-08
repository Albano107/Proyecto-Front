import { useState, useEffect } from "react";
import axios from "../api/axios";
import "./inicio.css";

export default function Inicio({ onNavegar }) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const [dashboard, setDashboard] = useState({
    verdes: 0,
    amarillos: 0,
    rojos: 0,
    usuariosActivos: 0,
    productosCriticos: [],
    retiros: [],
  });

  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        const response = await axios.get("/dashboard");
        setDashboard(response.data);
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      }
    };

    cargarDashboard();
  }, []);

  const verdes = dashboard.verdes;
  const amarillos = dashboard.amarillos;
  const rojos = dashboard.rojos;
  const activos = dashboard.usuariosActivos;

  return (
    <div className="layout">

      <div className="sidebar">
        <div className="sidebar-logo">GóndolaPro</div>

        <nav className="sidebar-nav">
          <a className="nav-item active">🏠 Inicio</a>
          <a className="nav-item" onClick={() => onNavegar("inventario")}>
            📦 Inventario
          </a>
          <a className="nav-item" onClick={() => onNavegar("reportes")}>
            📊 Reportes
          </a>
          <a className="nav-item" onClick={() => onNavegar("usuarios")}>
            👤 Usuarios
          </a>
        </nav>
      </div>

      {menuAbierto && (
        <div className="menu-mobile">
          <div className="menu-mobile-header">
            <span>GóndolaPro</span>
            <span
              onClick={() => setMenuAbierto(false)}
              className="menu-cerrar"
            >
              ✕
            </span>
          </div>

          <nav className="menu-mobile-nav">
            <a className="nav-item active">🏠 Inicio</a>
            <a
              className="nav-item"
              onClick={() => onNavegar("inventario")}
            >
              📦 Inventario
            </a>
            <a className="nav-item" onClick={() => onNavegar("reportes")}>
              📊 Reportes
            </a>
            <a className="nav-item" onClick={() => onNavegar("usuarios")}>
              👤 Usuarios
            </a>
          </nav>
        </div>
      )}

      <div className="contenido">

        <div className="topbar">
          <span className="topbar-logo">GóndolaPro</span>
          <span
            className="topbar-menu"
            onClick={() => setMenuAbierto(true)}
          >
            ☰
          </span>
        </div>

        <div className="page-header">
          <h1 className="page-title">Inicio</h1>
          <p className="page-subtitle">Resumen general del sistema</p>
        </div>

        <div className="cards-grid">

          <div
            className="card"
            onClick={() => onNavegar("inventario")}
          >
            <p className="card-label">✅ En buen estado</p>
            <p className="card-valor verde">{verdes}</p>
            <p className="card-hint">productos</p>
          </div>

          <div
            className="card"
            onClick={() => onNavegar("inventario")}
          >
            <p className="card-label">⚠️ Por vencer</p>
            <p className="card-valor amarillo">{amarillos}</p>
            <p className="card-hint">productos</p>
          </div>

          <div
            className="card"
            onClick={() => onNavegar("inventario")}
          >
            <p className="card-label">🚨 Vencidos</p>
            <p className="card-valor rojo">{rojos}</p>
            <p className="card-hint">productos</p>
          </div>

          <div
            className="card"
            onClick={() => onNavegar("usuarios")}
          >
            <p className="card-label">👤 Usuarios activos</p>
            <p className="card-valor">{activos}</p>
            <p className="card-hint">usuarios activos</p>
          </div>

        </div>

        <div className="resumen-grid">

          <div className="resumen-box">
            <div className="resumen-header">
              <h2 className="resumen-title">Últimos retiros</h2>
              <a
                className="resumen-link"
                onClick={() => onNavegar("reportes")}
              >
                Ver todos →
              </a>
            </div>

            {dashboard.retiros.length === 0 ? (
              <div className="resumen-fila">
                <span className="resumen-detalle">
                  No hay retiros registrados
                </span>
              </div>
            ) : (
              dashboard.retiros.map((r, index) => (
                <div className="resumen-fila" key={index}>
                  <span className="resumen-nombre">{r.producto}</span>
                  <span className="resumen-detalle">
                    {r.cantidad} u. — {r.fecha_retiro?.split("T")[0]}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="resumen-box">
            <div className="resumen-header">
              <h2 className="resumen-title">Productos críticos</h2>
              <a
                className="resumen-link"
                onClick={() => onNavegar("inventario")}
              >
                Ver todos →
              </a>
            </div>

            {dashboard.productosCriticos.map((p, index) => (
              <div className="resumen-fila" key={index}>
                <span className="resumen-nombre">
                  {p.producto}
                </span>

                <span
                  className={`badge ${
                    p.estado === "AMARILLO"
                      ? "badge-amarillo"
                      : "badge-rojo"
                  }`}
                >
                  {p.estado === "AMARILLO"
                    ? "Por vencer"
                    : "Vencido"}
                </span>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}