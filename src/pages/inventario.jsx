import { useState, useEffect } from "react";
import axios from "../api/axios";
import "./inventario.css";


export default function Inventario({ onNavegar }) {
  const [modo, setModo] = useState("productos");
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [productos, setProductos] = useState([]);

  useEffect(() => {

  const cargarInventario = async () => {

    try {

      const response = await axios.get("/inventario");

      const datos = response.data.map(item => ({
        id: item.id_inventario,
        nombre: item.producto,
        vencimiento: item.fecha_vencimiento.split("T")[0],
        cantidad: item.cantidad,
        estado: item.estado.toLowerCase()
      }));

      setProductos(datos);

    } catch (error) {

      console.error("Error cargando inventario:", error);

    }

  };

  cargarInventario();

}, []);

  // Por productos
  const totalP = productos.length;
  const verdesP = productos.filter(p => p.estado === "verde").length;
  const amarillosP = productos.filter(p => p.estado === "amarillo").length;
  const rojosP = productos.filter(p => p.estado === "rojo").length;

  // Por unidades
  const totalU = productos.reduce((acc, p) => acc + p.cantidad, 0);
  const verdesU = productos.filter(p => p.estado === "verde").reduce((acc, p) => acc + p.cantidad, 0);
  const amarillosU = productos.filter(p => p.estado === "amarillo").reduce((acc, p) => acc + p.cantidad, 0);
  const rojosU = productos.filter(p => p.estado === "rojo").reduce((acc, p) => acc + p.cantidad, 0);

  const total     = modo === "productos" ? totalP     : totalU;
  const verdes    = modo === "productos" ? verdesP    : verdesU;
  const amarillos = modo === "productos" ? amarillosP : amarillosU;
  const rojos     = modo === "productos" ? rojosP     : rojosU;

  return (
    <div className="layout">

      <div className="sidebar">
        <div className="sidebar-logo">GóndolaPro</div>
        <nav className="sidebar-nav">
            <a className="nav-item" onClick={() => onNavegar("inicio")}>🏠 Inicio</a>
            <a className="nav-item active">📦 Inventario</a>
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
            <a className="nav-item" onClick={() => onNavegar("inicio")}>🏠 Inicio</a>
            <a className="nav-item active">📦 Inventario</a>
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
          <h1 className="page-title">Inventario</h1>
          <div className="header-actions">
            <button
              className="btn-modo"
              onClick={() => setModo(modo === "productos" ? "unidades" : "productos")}
            >
              Ver por {modo === "productos" ? "unidades" : "productos"}
            </button>
            <button className="btn-agregar">+ Nuevo producto</button>
          </div>
        </div>

        <div className="cards-grid">
          <div className="card">
            <p className="card-label">Total {modo}</p>
            <p className="card-valor">{total}</p>
          </div>
          <div className="card">
            <p className="card-label">En buen estado</p>
            <p className="card-valor verde">{verdes}</p>
          </div>
          <div className="card">
            <p className="card-label">Por vencer</p>
            <p className="card-valor amarillo">{amarillos}</p>
          </div>
          <div className="card">
            <p className="card-label">Vencidos</p>
            <p className="card-valor rojo">{rojos}</p>
          </div>
        </div>

        <div className="tabla-container">
          <div className="tabla-header">
            <span>Producto</span>
            <span>Vencimiento</span>
            <span>Cantidad</span>
            <span>Estado</span>
          </div>

          {productos.map(p => (
            <div className="tabla-fila" key={p.id}>
              <span className="producto-nombre">{p.nombre}</span>
              <span>{p.vencimiento}</span>
              <span>{p.cantidad} u.</span>
              <span className={`badge badge-${p.estado}`}>
                {p.estado === "verde" && "OK"}
                {p.estado === "amarillo" && "Por vencer"}
                {p.estado === "rojo" && "Vencido"}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}