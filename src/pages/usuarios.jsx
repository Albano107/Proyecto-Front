import { useState, useEffect } from "react";
import axios from "../api/axios";
import "./usuarios.css";

export default function Usuarios({ onNavegar }) {
  const [usuarios, setUsuarios] = useState([]);
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const response = await axios.get("/usuarios");
        setUsuarios(response.data);
      } catch (error) {
        console.error("Error cargando usuarios:", error);
      }
    };

    cargarUsuarios();
  }, []);

 const toggleActivo = async (id) => {

  const usuario = usuarios.find(
    (u) => Number(u.id_usuario) === Number(id)
  );

  const nuevoEstado = !usuario.activo;

  try {

    await axios.patch(`/usuarios/${id}`, {
      activo: nuevoEstado
    });

    setUsuarios(
      usuarios.map((u) =>
        Number(u.id_usuario) === Number(id)
          ? { ...u, activo: nuevoEstado }
          : u
      )
    );

  } catch (error) {

    console.error(error);

    alert("Error al actualizar usuario");

  }

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
            <span
              onClick={() => setMenuAbierto(false)}
              className="menu-cerrar"
            >
              ✕
            </span>
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
          <span
            className="topbar-menu"
            onClick={() => setMenuAbierto(true)}
          >
            ☰
          </span>
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

          {usuarios.map((u) => (
            <div className="tabla-fila" key={u.id_usuario}>

              <span className="usuario-nombre">
                {u.nombre}
              </span>

              <span className="usuario-email">
                {u.email}
              </span>

              <span>
                <span className="badge">
                  {u.rol}
                </span>
              </span>

              <span>
                <span
                  className={`badge badge-${
                    u.activo ? "activo" : "inactivo"
                  }`}
                >
                  {u.activo ? "Activo" : "Inactivo"}
                </span>
              </span>

              <span>
                <button
                  className={`btn-toggle ${
                    u.activo ? "btn-baja" : "btn-alta"
                  }`}
                  onClick={() => toggleActivo(u.id_usuario)}
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