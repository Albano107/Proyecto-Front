import { useState, useEffect } from "react";
import axios from "../api/axios";
import "./reportes.css";

export default function Reportes({ onNavegar, usuario }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [retiros, setRetiros] = useState([]);

  useEffect(() => {
    const cargarRetiros = async () => {
      try {
        const response = await axios.get("/retiros");
        setRetiros(response.data);
      } catch (error) {
        console.error("Error cargando retiros:", error);
      }
    };

    cargarRetiros();
  }, []);

  return (
    <div className="layout">

      <div className="sidebar">
        <div className="sidebar-logo">GóndolaPro</div>
        <nav className="sidebar-nav">
          <a className="nav-item" onClick={() => onNavegar("inicio")}>🏠 Inicio</a>
          <a className="nav-item" onClick={() => onNavegar("inventario")}>📦 Inventario</a>
          <a className="nav-item active">📊 Reportes</a>
          {usuario?.rol !== "Operario" && (<a className="nav-item" onClick={() => onNavegar("usuarios")}>👤 Usuarios</a>
)}
        </nav>
      </div>

      {menuAbierto && (
        <div className="menu-mobile">
          <div className="menu-mobile-header">
            <span>GóndolaPro</span>
            <span onClick={() => setMenuAbierto(false)} className="menu-cerrar">✕</span>
          </div>

          <nav className="menu-mobile-nav">
            <a className="nav-item" onClick={() => onNavegar("inicio")}>🏠 Inicio</a>
            <a className="nav-item" onClick={() => onNavegar("inventario")}>📦 Inventario</a>
            <a className="nav-item active">📊 Reportes</a>
            <a className="nav-item" onClick={() => onNavegar("reportes")}>📊 Reportes</a>
          <a className="nav-item" onClick={() => onNavegar("reportes")}>📊 Reportes</a>
          {usuario?.rol !== "Operario" && (<a className="nav-item" onClick={() => onNavegar("usuarios")}>👤 Usuarios</a>
)}
          </nav>
        </div>
      )}

      <div className="contenido">

        <div className="topbar">
          <span className="topbar-logo">GóndolaPro</span>
          <span className="topbar-menu" onClick={() => setMenuAbierto(true)}>☰</span>
        </div>

        <div className="page-header">
          <h1 className="page-title">Reportes de mermas</h1>
        </div>

        <div className="tabla-container">
          <div className="tabla-header">
            <span>Producto</span>
            <span>Cantidad</span>
            <span>Motivo</span>
            <span>Fecha</span>
            <span>Usuario</span>
          </div>

          {retiros.length === 0 ? (
            <div className="tabla-fila">
              <span>No hay retiros registrados</span>
              <span>-</span>
              <span>-</span>
              <span>-</span>
              <span>-</span>
            </div>
          ) : (
            retiros.map((r) => (
              <div className="tabla-fila" key={r.id_retiro}>
                <span className="producto-nombre">{r.producto}</span>
                <span>{r.cantidad} u.</span>
                <span>{r.motivo}</span>
                <span>{r.fecha_retiro?.split("T")[0]}</span>
                <span>{r.usuario}</span>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}