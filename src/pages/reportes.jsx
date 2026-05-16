import { useState } from "react";
import "./reportes.css";

const retiros = [
  { id: 1, producto: "Leche La Serenísima", cantidad: 10, motivo: "Vencimiento", fecha: "2026-05-16", usuario: "María Operaria" },
  { id: 2, producto: "Manteca Sancor", cantidad: 3, motivo: "Vencimiento", fecha: "2026-05-15", usuario: "Carlos Admin" },
  { id: 3, producto: "Yogur Ser Frutilla", cantidad: 5, motivo: "Vencimiento", fecha: "2026-05-14", usuario: "María Operaria" },
  { id: 4, producto: "Crema de Leche", cantidad: 2, motivo: "Vencimiento", fecha: "2026-05-13", usuario: "Carlos Admin" },
];

export default function Reportes({ onNavegar }) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <div className="layout">

      <div className="sidebar">
        <div className="sidebar-logo">GóndolaPro</div>
        <nav className="sidebar-nav">
          <a className="nav-item" onClick={() => onNavegar("inicio")}>🏠 Inicio</a>
          <a className="nav-item" onClick={() => onNavegar("inventario")}>📦 Inventario</a>
          <a className="nav-item active">📊 Reportes</a>
          <a className="nav-item" onClick={() => onNavegar("usuarios")}>👤 Usuarios</a>
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
           <a className="nav-item" onClick={() => onNavegar("usuarios")}>👤 Usuarios</a>
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

          {retiros.map(r => (
            <div className="tabla-fila" key={r.id}>
              <span className="producto-nombre">{r.producto}</span>
              <span>{r.cantidad} u.</span>
              <span>{r.motivo}</span>
              <span>{r.fecha}</span>
              <span>{r.usuario}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}