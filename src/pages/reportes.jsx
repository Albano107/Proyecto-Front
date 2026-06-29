import { useState, useEffect } from "react";
import axios from "../api/axios";
import "./reportes.css";

export default function Reportes({ onNavegar, usuario }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [retiros, setRetiros] = useState([]);
  const [listaSucursales, setListaSucursales] = useState([]);

  const [sucursalActiva, setSucursalActiva] = useState(
    usuario?.rol === "Operario" ? usuario.id_sucursal : null
  );

  const [resumen, setResumen] = useState({
    totalRetiros: 0,
    totalUnidades: 0,
    productoMasRetirado: "-",
    unidadesProductoMasRetirado: 0,
    sucursalMasRetiro: "-",
    unidadesSucursalMasRetiro: 0,
  });

  const [cargando, setCargando] = useState(false);

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString("es-AR");
  };

  const cargarSucursales = async () => {
    try {
      const response = await axios.get("/sucursales");
      setListaSucursales(response.data);
    } catch (error) {
      console.error("Error cargando sucursales:", error);
    }
  };

  const cargarReportes = async () => {
    try {
      setCargando(true);

      const params = new URLSearchParams();

      if (sucursalActiva) {
        params.append("id_sucursal", sucursalActiva);
      }

      const query = params.toString();
      const queryString = query ? `?${query}` : "";

      const [retirosResponse, resumenResponse] = await Promise.all([
        axios.get(`/retiros${queryString}`),
        axios.get(`/retiros/resumen${queryString}`),
      ]);

      setRetiros(retirosResponse.data);

      setResumen({
        totalRetiros: Number(resumenResponse.data.totalRetiros || 0),
        totalUnidades: Number(resumenResponse.data.totalUnidades || 0),
        productoMasRetirado:
          resumenResponse.data.productoMasRetirado || "-",
        unidadesProductoMasRetirado: Number(
          resumenResponse.data.unidadesProductoMasRetirado || 0
        ),
        sucursalMasRetiro: resumenResponse.data.sucursalMasRetiro || "-",
        unidadesSucursalMasRetiro: Number(
          resumenResponse.data.unidadesSucursalMasRetiro || 0
        ),
      });
    } catch (error) {
      console.error("Error cargando reportes:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarSucursales();
  }, []);

  useEffect(() => {
    if (usuario?.rol === "Operario" && usuario?.id_sucursal) {
      setSucursalActiva(usuario.id_sucursal);
    }
  }, [usuario]);

  useEffect(() => {
    cargarReportes();
  }, [sucursalActiva]);

  return (
    <div className="layout">
      <div className="sidebar">
        <div className="sidebar-logo">GóndolaPro</div>

        <nav className="sidebar-nav">
          <a className="nav-item" onClick={() => onNavegar("inicio")}>
            🏠 Inicio
          </a>

          <a className="nav-item" onClick={() => onNavegar("inventario")}>
            📦 Inventario
          </a>

          <a className="nav-item active">📊 Reportes</a>

          {usuario?.rol !== "Operario" && (
            <a className="nav-item" onClick={() => onNavegar("usuarios")}>
              👤 Usuarios
            </a>
          )}
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
            <a className="nav-item" onClick={() => onNavegar("inicio")}>
              🏠 Inicio
            </a>

            <a className="nav-item" onClick={() => onNavegar("inventario")}>
              📦 Inventario
            </a>

            <a className="nav-item active">📊 Reportes</a>

            {usuario?.rol !== "Operario" && (
              <a className="nav-item" onClick={() => onNavegar("usuarios")}>
                👤 Usuarios
              </a>
            )}
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
          <div className="title-sucursales">
            <h1 className="page-title">Reportes de mermas</h1>

            <div className="sucursal-tabs">
              {usuario?.rol !== "Operario" && (
                <button
                  className={`btn-sucursal ${!sucursalActiva ? "activo" : ""}`}
                  onClick={() => setSucursalActiva(null)}
                >
                  Todas
                </button>
              )}

              {listaSucursales.map((s) => (
                <button
                  key={s.id_sucursal}
                  className={`btn-sucursal ${
                    sucursalActiva === s.id_sucursal ? "activo" : ""
                  }`}
                  onClick={() => {
                    if (usuario?.rol !== "Operario") {
                      setSucursalActiva(s.id_sucursal);
                    }
                  }}
                  disabled={
                    usuario?.rol === "Operario" &&
                    s.id_sucursal !== usuario.id_sucursal
                  }
                >
                  {s.nombre}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="cards-grid">
          <div className="card">
            <p className="card-label">Total de retiros</p>
            <p className="card-valor">{resumen.totalRetiros}</p>
            <p className="card-hint">operaciones registradas</p>
          </div>

          <div className="card">
            <p className="card-label">Unidades retiradas</p>
            <p className="card-valor rojo">{resumen.totalUnidades}</p>
            <p className="card-hint">unidades en merma</p>
          </div>

          <div className="card">
            <p className="card-label">Producto con más merma</p>
            <p className="card-valor-texto">
              {resumen.productoMasRetirado}
            </p>
            <p className="card-hint">
              {resumen.unidadesProductoMasRetirado} unidades
            </p>
          </div>

          <div className="card">
            <p className="card-label">Sucursal con más merma</p>
            <p className="card-valor-texto">
              {resumen.sucursalMasRetiro}
            </p>
            <p className="card-hint">
              {resumen.unidadesSucursalMasRetiro} unidades
            </p>
          </div>
        </div>

        <div className="tabla-container">
          <div className="tabla-header tabla-header-reportes">
            <span>Producto</span>
            <span>Cantidad</span>
            <span>Motivo</span>
            <span>Fecha</span>
            <span>Usuario</span>
            <span>Sucursal</span>
          </div>

          {cargando ? (
            <div className="tabla-fila tabla-fila-reportes">
              <span>Cargando reportes...</span>
              <span>-</span>
              <span>-</span>
              <span>-</span>
              <span>-</span>
              <span>-</span>
            </div>
          ) : retiros.length === 0 ? (
            <div className="tabla-fila tabla-fila-reportes">
              <span>No hay retiros registrados</span>
              <span>-</span>
              <span>-</span>
              <span>-</span>
              <span>-</span>
              <span>-</span>
            </div>
          ) : (
            retiros.map((r) => (
              <div className="tabla-fila tabla-fila-reportes" key={r.id_retiro}>
                <span className="producto-nombre">{r.producto}</span>
                <span>{r.cantidad} u.</span>
                <span>{r.motivo}</span>
                <span>{formatearFecha(r.fecha_retiro)}</span>
                <span>{r.usuario}</span>
                <span>{r.sucursal}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}