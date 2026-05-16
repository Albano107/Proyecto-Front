import { useState } from "react";
import "./inicio.css";

const productos = [
  { id: 1, nombre: "Leche La Serenísima", vencimiento: "2026-05-17", cantidad: 10, estado: "rojo" },
  { id: 2, nombre: "Yogur Ser Frutilla", vencimiento: "2026-05-25", cantidad: 5, estado: "amarillo" },
  { id: 3, nombre: "Queso Cremoso", vencimiento: "2026-06-10", cantidad: 8, estado: "verde" },
  { id: 4, nombre: "Manteca Sancor", vencimiento: "2026-05-18", cantidad: 3, estado: "rojo" },
  { id: 5, nombre: "Crema de Leche", vencimiento: "2026-06-20", cantidad: 12, estado: "verde" },
];

const retiros = [
  { id: 1, producto: "Leche La Serenísima", cantidad: 10, fecha: "2026-05-16" },
  { id: 2, producto: "Manteca Sancor", cantidad: 3, fecha: "2026-05-15" },
  { id: 3, producto: "Yogur Ser Frutilla", cantidad: 5, fecha: "2026-05-14" },
];

const usuarios = [
  { id: 1, nombre: "Carlos Admin", rol: "admin", activo: true },
  { id: 2, nombre: "María Operaria", rol: "operario", activo: true },
  { id: 3, nombre: "Juan Operario", rol: "operario", activo: false },
  { id: 4, nombre: "Laura Operaria", rol: "operario", activo: true },
];

export default function Inicio({ onNavegar }) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const verdes = productos.filter(p => p.estado === "verde").length;
  const amarillos = productos.filter(p => p.estado === "amarillo").length;
  const rojos = productos.filter(p => p.estado === "rojo").length;
  const activos = usuarios.filter(u => u.activo).length;

  return (
    <div className="layout">

      <div className="sidebar">
        <div className="sidebar-logo">GóndolaPro</div>
        <nav className="sidebar-nav">
          <a className="nav-item active">🏠 Inicio</a>
          <a className="nav-item" onClick={() => onNavegar("inventario")}>📦 Inventario</a>
          <a className="nav-item" onClick={() => onNavegar("reportes")}>📊 Reportes</a>
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
            <a className="nav-item active">🏠 Inicio</a>
            <a className="nav-item" onClick={() => onNavegar("inventario")}>📦 Inventario</a>
            <a className="nav-item" onClick={() => onNavegar("reportes")}>📊 Reportes</a>
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
          <h1 className="page-title">Inicio</h1>
          <p className="page-subtitle">Resumen general del sistema</p>
        </div>

        {/* Cards resumen */}
        <div className="cards-grid">
          <div className="card" onClick={() => onNavegar("inventario")}>
            <p className="card-label">✅ En buen estado</p>
            <p className="card-valor verde">{verdes}</p>
            <p className="card-hint">productos</p>
          </div>
          <div className="card" onClick={() => onNavegar("inventario")}>
            <p className="card-label">⚠️ Por vencer</p>
            <p className="card-valor amarillo">{amarillos}</p>
            <p className="card-hint">productos</p>
          </div>
          <div className="card" onClick={() => onNavegar("inventario")}>
            <p className="card-label">🚨 Vencidos</p>
            <p className="card-valor rojo">{rojos}</p>
            <p className="card-hint">productos</p>
          </div>
          <div className="card" onClick={() => onNavegar("usuarios")}>
            <p className="card-label">👤 Usuarios activos</p>
            <p className="card-valor">{activos}</p>
            <p className="card-hint">de {usuarios.length} totales</p>
          </div>
        </div>

        <div className="resumen-grid">

          {/* Últimos retiros */}
          <div className="resumen-box">
            <div className="resumen-header">
              <h2 className="resumen-title">Últimos retiros</h2>
              <a className="resumen-link" onClick={() => onNavegar("reportes")}>Ver todos →</a>
            </div>
            {retiros.map(r => (
              <div className="resumen-fila" key={r.id}>
                <span className="resumen-nombre">{r.producto}</span>
                <span className="resumen-detalle">{r.cantidad} u. — {r.fecha}</span>
              </div>
            ))}
          </div>

          {/* Productos críticos */}
          <div className="resumen-box">
            <div className="resumen-header">
              <h2 className="resumen-title">Productos críticos</h2>
              <a className="resumen-link" onClick={() => onNavegar("inventario")}>Ver todos →</a>
            </div>
            {productos.filter(p => p.estado !== "verde").map(p => (
              <div className="resumen-fila" key={p.id}>
                <span className="resumen-nombre">{p.nombre}</span>
                <span className={`badge badge-${p.estado}`}>
                  {p.estado === "amarillo" ? "Por vencer" : "Vencido"}
                </span>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}