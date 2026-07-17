import { useState } from "react";

const ITEMS = [
  { id: "inicio", label: "🏠 Inicio" },
  { id: "inventario", label: "📦 Inventario" },
  { id: "reportes", label: "📊 Reportes" },
  { id: "usuarios", label: "👤 Usuarios", soloAdmin: true },
];

function NavLinks({ activo, usuario, onNavegar }) {
  return ITEMS.filter((item) => !item.soloAdmin || usuario?.rol !== "Operario").map(
    (item) => (
      <a
        key={item.id}
        className={`nav-item${activo === item.id ? " active" : ""}`}
        onClick={() => onNavegar(item.id)}
      >
        {item.label}
      </a>
    )
  );
}

export default function Layout({ activo, usuario, onNavegar, children }) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <div className="layout">
      <div className="sidebar">
        <div className="sidebar-logo">GóndolaPro</div>

        <nav className="sidebar-nav">
          <NavLinks activo={activo} usuario={usuario} onNavegar={onNavegar} />
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
            <NavLinks activo={activo} usuario={usuario} onNavegar={onNavegar} />
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

        {children}
      </div>
    </div>
  );
}
