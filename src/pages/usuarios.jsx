import { useState } from "react";
import "./usuarios.css";

const usuariosIniciales = [
  { id: 1, nombre: "Carlos Admin", email: "carlos@gondola.com", rol: "admin", activo: true },
  { id: 2, nombre: "María Operaria", email: "maria@gondola.com", rol: "operario", activo: true },
  { id: 3, nombre: "Juan Operario", email: "juan@gondola.com", rol: "operario", activo: false },
  { id: 4, nombre: "Laura Operaria", email: "laura@gondola.com", rol: "operario", activo: true },
];

export default function Usuarios({ onNavegar }) {
  const [usuarios, setUsuarios] = useState(usuariosIniciales);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const toggleActivo = (id) => {
    setUsuarios(usuarios.map(u =>
      u.id === id ? { ...u, activo: !u.activo } : u
    ));
  };

  return (
    <div className="layout">

      <div className="sidebar">
        <div className="sidebar-logo">GóndolaPro</div>
        <nav className="sidebar-nav">
          <a className="nav-item" onClick={() => onNavegar("inicio")}>🏠 Inicio</a>
          <a className="nav-item" onClick={() => onNavegar("inventario")}>📦 Inventario</a>
          <a className="nav-item" onClick={() => onNavegar("reportes")}>📊 Reportes</a>
          <a className="nav-item active">👤 Usuarios</a>
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
            <a className="nav-item" onClick={() => onNavegar("reportes")}>📊 Reportes</a>
            <a className="nav-item active">👤 Usuarios</a>
          </nav>
        </div>
      )}

      <div className="contenido">

        <div className="topbar">
          <span className="topbar-logo">GóndolaPro</span>
          <span className="topbar-menu" onClick={() => setMenuAbierto(true)}>☰</span>
        </div>

        <div className="page-header">
          <h1 className="page-title">Usuarios</h1>
        </div>

        <div className="tabla-container">
          <div className="tabla-header">
            <span>Nombre</span>
            <span>Email</span>
            <span>Rol</span>
            <span>Estado</span>
            <span>Acción</span>
          </div>

          {usuarios.map(u => (
            <div className="tabla-fila" key={u.id}>
              <span className="usuario-nombre">{u.nombre}</span>
              <span className="usuario-email">{u.email}</span>
              <span>
                <span className={`badge badge-${u.rol}`}>
                  {u.rol === "admin" ? "Admin" : "Operario"}
                </span>
              </span>
              <span>
                <span className={`badge badge-${u.activo ? "activo" : "inactivo"}`}>
                  {u.activo ? "Activo" : "Inactivo"}
                </span>
              </span>
              <span>
                <button
                  className={`btn-toggle ${u.activo ? "btn-baja" : "btn-alta"}`}
                  onClick={() => toggleActivo(u.id)}
                >
                  {u.activo ? "Dar de baja" : "Reactivar"}
                </button>
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}