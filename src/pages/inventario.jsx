import { useState, useEffect, useRef } from "react";
import axios from "../api/axios";
import "./inventario.css";

// ─── AutoComplete ─────────────────────────────────────────────────────────────
function AutoComplete({ label, opciones, valorId, valorTexto, onSeleccionar, placeholder }) {
  const [texto, setTexto]           = useState(valorTexto || "");
  const [abierto, setAbierto]       = useState(false);
  const [destacado, setDestacado]   = useState(-1);
  const contenedor                  = useRef(null);

  // Sincronizar texto si el padre resetea el valor
  useEffect(() => {
    setTexto(valorTexto || "");
  }, [valorTexto]);

  // Cerrar al hacer click afuera
  useEffect(() => {
  cargarInventario();
  cargarProductosYSucursales();
}, [sucursalActiva]);

  const filtradas = opciones.filter((o) =>
    o.label.toLowerCase().includes(texto.toLowerCase())
  );

  const seleccionar = (opcion) => {
    setTexto(opcion.label);
    setAbierto(false);
    setDestacado(-1);
    onSeleccionar(opcion.id, opcion.label);
  };

  const handleKeyDown = (e) => {
    if (!abierto) return;
    if (e.key === "ArrowDown") {
      setDestacado((d) => Math.min(d + 1, filtradas.length - 1));
    } else if (e.key === "ArrowUp") {
      setDestacado((d) => Math.max(d - 1, 0));
    } else if (e.key === "Enter" && destacado >= 0) {
      seleccionar(filtradas[destacado]);
    } else if (e.key === "Escape") {
      setAbierto(false);
    }
  };

  return (
    <div className="form-grupo" ref={contenedor}>
      <label className="form-label">{label} *</label>
      <div className="autocomplete-wrap">
        <input
          className="form-input"
          type="text"
          placeholder={placeholder}
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            setAbierto(true);
            setDestacado(-1);
            // Si borra el texto, limpiar selección
            if (!e.target.value) onSeleccionar("", "");
          }}
          onFocus={() => setAbierto(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        {abierto && filtradas.length > 0 && (
          <ul className="autocomplete-lista">
            {filtradas.map((o, i) => (
              <li
                key={o.id}
                className={`autocomplete-item${i === destacado ? " autocomplete-item--activo" : ""}`}
                onMouseDown={() => seleccionar(o)}
              >
                {o.label}
              </li>
            ))}
          </ul>
        )}
        {abierto && texto && filtradas.length === 0 && (
          <ul className="autocomplete-lista">
            <li className="autocomplete-item autocomplete-item--vacio">Sin resultados</li>
          </ul>
        )}
      </div>
    </div>
  );
}

// ─── Modal reutilizable ───────────────────────────────────────────────────────
function Modal({ titulo, onCerrar, children }) {
  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-caja" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-titulo">{titulo}</h2>
          <button className="modal-cerrar" onClick={onCerrar}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Inventario({ onNavegar, usuario }) {
  const [sucursalActiva, setSucursalActiva] = useState(
    usuario?.rol === "Operario" ? usuario.id_sucursal : null
  );
  const [modo, setModo] = useState("productos");
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [productos, setProductos] = useState([]);

  // Listas para los selects
  const [listaProductos, setListaProductos] = useState([]);
  const [listaSucursales, setListaSucursales] = useState([]);

  // Control de modales
  const [modalNuevo, setModalNuevo]   = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState(null);

  // Estado del formulario de nuevo producto
  const [formNuevo, setFormNuevo] = useState({
    id_producto: "",
    id_sucursal: "",
    fecha_vencimiento: "",
    cantidad: "",
  });
  // Textos visibles en los autocomplete (para resetearlos al abrir modal)
  const [textoProducto, setTextoProducto] = useState("");
  const [textoSucursal, setTextoSucursal] = useState("");

  // Estado del formulario de edición
  const [formEditar, setFormEditar] = useState({
    fecha_vencimiento: "",
    cantidad: "",
  });

  const [cargando, setCargando] = useState(false);
  const [error, setError]       = useState("");

  // ── Carga de datos ──────────────────────────────────────────────────────────
const cargarInventario = async () => {
  try {
    const url = sucursalActiva ? `/inventario?id_sucursal=${sucursalActiva}` : "/inventario";
    const response = await axios.get(url);
    const datos = response.data.map((item) => ({
      id: item.id_inventario,
      nombre: item.producto,
      vencimiento: item.fecha_vencimiento.split("T")[0],
      cantidad: item.cantidad,
      estado: item.estado.toLowerCase(),
    }));
    setProductos(datos);
  } catch (err) {
    console.error("Error cargando inventario:", err);
  }
};

  const cargarProductosYSucursales = async () => {
    try {
      const [resP, resS] = await Promise.all([
        axios.get("/productos"),
        axios.get("/sucursales"),
      ]);
      setListaProductos(resP.data);
      setListaSucursales(resS.data);
    } catch (err) {
      console.error("Error cargando productos/sucursales:", err);
    }
  };

  useEffect(() => {
    cargarInventario();
    cargarProductosYSucursales();
  }, []);

  // ── Acciones existentes ─────────────────────────────────────────────────────
  const retirarProducto = async (producto) => {
    const cantidad = Number(prompt(`Cantidad a retirar de ${producto.nombre}:`));
    if (!cantidad || cantidad <= 0) { alert("Cantidad inválida"); return; }
    if (cantidad > producto.cantidad) { alert("No podés retirar más cantidad de la disponible"); return; }
    const motivo = prompt("Motivo del retiro:", "Vencimiento") || "Vencimiento";
    try {
      await axios.post("/retiros", {
        id_inventario: producto.id,
        cantidad,
        motivo,
        id_usuario: 1,
      });
      alert("Retiro registrado correctamente");
      cargarInventario();
    } catch (err) {
      console.error("Error registrando retiro:", err);
      alert(err.response?.data?.mensaje || "Error al registrar retiro");
    }
  };

  // ── Nuevo producto ──────────────────────────────────────────────────────────
  const abrirModalNuevo = () => {
    setFormNuevo({ id_producto: "", id_sucursal: "", fecha_vencimiento: "", cantidad: "" });
    setTextoProducto("");
    setTextoSucursal("");
    setError("");
    setModalNuevo(true);
  };

  const handleNuevoChange = (e) => {
    setFormNuevo({ ...formNuevo, [e.target.name]: e.target.value });
  };

  const guardarNuevoProducto = async () => {
    const { id_producto, id_sucursal, fecha_vencimiento, cantidad } = formNuevo;
    if (!id_producto || !id_sucursal || !fecha_vencimiento || !cantidad) {
      setError("Completá todos los campos.");
      return;
    }
    if (Number(cantidad) <= 0) {
      setError("La cantidad debe ser mayor a 0.");
      return;
    }
    setCargando(true);
    setError("");
    try {
      await axios.post("/inventario", {
        id_producto: Number(id_producto),
        id_sucursal: Number(id_sucursal),
        fecha_vencimiento,
        cantidad: Number(cantidad),
      });
      setModalNuevo(false);
      cargarInventario();
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al guardar el producto.");
    } finally {
      setCargando(false);
    }
  };

  // ── Editar ──────────────────────────────────────────────────────────────────
  const abrirModalEditar = (item) => {
    setItemSeleccionado(item);
    setFormEditar({ fecha_vencimiento: item.vencimiento, cantidad: item.cantidad });
    setError("");
    setModalEditar(true);
  };

  const handleEditarChange = (e) => {
    setFormEditar({ ...formEditar, [e.target.name]: e.target.value });
  };

  const guardarEdicion = async () => {
    const { fecha_vencimiento, cantidad } = formEditar;
    if (!fecha_vencimiento || !cantidad) {
      setError("Completá todos los campos.");
      return;
    }
    if (Number(cantidad) < 0) {
      setError("La cantidad no puede ser negativa.");
      return;
    }
    setCargando(true);
    setError("");
    try {
      await axios.put(`/inventario/${itemSeleccionado.id}`, {
        fecha_vencimiento,
        cantidad: Number(cantidad),
      });
      setModalEditar(false);
      cargarInventario();
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al editar el producto.");
    } finally {
      setCargando(false);
    }
  };

  // ── Eliminar ────────────────────────────────────────────────────────────────
  const abrirModalEliminar = (item) => {
    setItemSeleccionado(item);
    setModalEliminar(true);
  };

  const confirmarEliminar = async () => {
    setCargando(true);
    try {
      await axios.delete(`/inventario/${itemSeleccionado.id}`);
      setModalEliminar(false);
      cargarInventario();
    } catch (err) {
      alert(err.response?.data?.mensaje || "Error al eliminar el producto.");
    } finally {
      setCargando(false);
    }
  };

  // ── Totales ─────────────────────────────────────────────────────────────────
  const totalP     = productos.length;
  const verdesP    = productos.filter((p) => p.estado === "verde").length;
  const amarillosP = productos.filter((p) => p.estado === "amarillo").length;
  const rojosP     = productos.filter((p) => p.estado === "rojo").length;

  const totalU     = productos.reduce((acc, p) => acc + p.cantidad, 0);
  const verdesU    = productos.filter((p) => p.estado === "verde").reduce((acc, p) => acc + p.cantidad, 0);
  const amarillosU = productos.filter((p) => p.estado === "amarillo").reduce((acc, p) => acc + p.cantidad, 0);
  const rojosU     = productos.filter((p) => p.estado === "rojo").reduce((acc, p) => acc + p.cantidad, 0);

  const total    = modo === "productos" ? totalP     : totalU;
  const verdes   = modo === "productos" ? verdesP    : verdesU;
  const amarillos = modo === "productos" ? amarillosP : amarillosU;
  const rojos    = modo === "productos" ? rojosP     : rojosU;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-logo">GóndolaPro</div>
        <nav className="sidebar-nav">
          <a className="nav-item" onClick={() => onNavegar("inicio")}>🏠 Inicio</a>
          <a className="nav-item active">📦 Inventario</a>
          <a className="nav-item" onClick={() => onNavegar("reportes")}>📊 Reportes</a>
          {usuario?.rol !== "Operario" && (<a className="nav-item" onClick={() => onNavegar("usuarios")}>👤 Usuarios</a>
)}
        </nav>
      </div>

      {/* Menú mobile */}
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
        {/* Topbar */}
        <div className="topbar">
          <span className="topbar-logo">GóndolaPro</span>
          <span className="topbar-menu" onClick={() => setMenuAbierto(true)}>☰</span>
        </div>

        {/* Header de página */}
        <div className="page-header">
          <div className="title-sucursales">
    <h1 className="page-title">Inventario</h1>
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
          className={`btn-sucursal ${sucursalActiva === s.id_sucursal ? "activo" : ""}`}
          onClick={() => {
            if (usuario?.rol !== "Operario") setSucursalActiva(s.id_sucursal);
          }}
          disabled={usuario?.rol === "Operario" && s.id_sucursal !== usuario.id_sucursal}
        >
          {s.nombre}
        </button>
      ))}
    </div>
  </div>
  <div className="header-actions">
    <button
      className="btn-modo"
      onClick={() => setModo(modo === "productos" ? "unidades" : "productos")}
    >
      Ver por {modo === "productos" ? "unidades" : "productos"}
    </button>
    {usuario?.rol !== "Operario" && (
      <button className="btn-agregar" onClick={abrirModalNuevo}>
        + Nuevo producto
      </button>
    )}
  </div>
</div>

        {/* Cards */}
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

        {/* Tabla */}
        <div className="tabla-container">
          <div className="tabla-header tabla-header-extendido">
            <span>Producto</span>
            <span>Vencimiento</span>
            <span>Cantidad</span>
            <span>Estado</span>
            <span>Acciones</span>
          </div>

          {productos.map((p) => (
            <div className="tabla-fila tabla-fila-extendida" key={p.id}>
              <span className="producto-nombre">{p.nombre}</span>
              <span>{p.vencimiento}</span>
              <span>{p.cantidad} u.</span>
              <span className={`badge badge-${p.estado}`}>
                {p.estado === "verde"    && "OK"}
                {p.estado === "amarillo" && "Por vencer"}
                {p.estado === "rojo"     && "Vencido"}
              </span>
              <span className="acciones-grupo">
                <button
                  className="btn-agregar"
                  onClick={() => retirarProducto(p)}
                  disabled={p.cantidad <= 0}
                >
                  Retirar
                </button>
                <button
                  className="btn-editar"
                  onClick={() => abrirModalEditar(p)}
                >
                  ✏️ Editar
                </button>
                <button
                  className="btn-eliminar"
                  onClick={() => abrirModalEliminar(p)}
                >
                  🗑️ Eliminar
                </button>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modal: Nuevo producto ── */}
      {modalNuevo && (
        <Modal titulo="Nuevo producto en inventario" onCerrar={() => setModalNuevo(false)}>
          <div className="modal-body">

            <AutoComplete
              label="Producto"
              placeholder="Buscar producto..."
              opciones={listaProductos.map((p) => ({
                id: p.id_producto,
                label: p.codigo_barras ? `${p.nombre} (${p.codigo_barras})` : p.nombre,
              }))}
              valorId={formNuevo.id_producto}
              valorTexto={textoProducto}
              onSeleccionar={(id, label) => {
                setFormNuevo({ ...formNuevo, id_producto: id });
                setTextoProducto(label);
              }}
            />

            <AutoComplete
              label="Sucursal"
              placeholder="Buscar sucursal..."
              opciones={listaSucursales.map((s) => ({
                id: s.id_sucursal,
                label: s.nombre,
              }))}
              valorId={formNuevo.id_sucursal}
              valorTexto={textoSucursal}
              onSeleccionar={(id, label) => {
                setFormNuevo({ ...formNuevo, id_sucursal: id });
                setTextoSucursal(label);
              }}
            />

            <div className="form-grupo">
              <label className="form-label">Fecha de vencimiento *</label>
              <input
                className="form-input"
                type="date"
                name="fecha_vencimiento"
                value={formNuevo.fecha_vencimiento}
                onChange={handleNuevoChange}
              />
            </div>

            <div className="form-grupo">
              <label className="form-label">Cantidad *</label>
              <input
                className="form-input"
                type="number"
                name="cantidad"
                min="1"
                placeholder="Ej: 50"
                value={formNuevo.cantidad}
                onChange={handleNuevoChange}
              />
            </div>

            {error && <p className="form-error">{error}</p>}
          </div>

          <div className="modal-footer">
            <button className="btn-cancelar" onClick={() => setModalNuevo(false)}>
              Cancelar
            </button>
            <button className="btn-agregar" onClick={guardarNuevoProducto} disabled={cargando}>
              {cargando ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Modal: Editar ── */}
      {modalEditar && itemSeleccionado && (
        <Modal titulo={`Editar: ${itemSeleccionado.nombre}`} onCerrar={() => setModalEditar(false)}>
          <div className="modal-body">

            <div className="form-grupo">
              <label className="form-label">Fecha de vencimiento *</label>
              <input
                className="form-input"
                type="date"
                name="fecha_vencimiento"
                value={formEditar.fecha_vencimiento}
                onChange={handleEditarChange}
              />
            </div>

            <div className="form-grupo">
              <label className="form-label">Cantidad *</label>
              <input
                className="form-input"
                type="number"
                name="cantidad"
                min="0"
                value={formEditar.cantidad}
                onChange={handleEditarChange}
              />
            </div>

            {error && <p className="form-error">{error}</p>}
          </div>

          <div className="modal-footer">
            <button className="btn-cancelar" onClick={() => setModalEditar(false)}>
              Cancelar
            </button>
            <button className="btn-agregar" onClick={guardarEdicion} disabled={cargando}>
              {cargando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Modal: Confirmar eliminar ── */}
      {modalEliminar && itemSeleccionado && (
        <Modal titulo="Confirmar eliminación" onCerrar={() => setModalEliminar(false)}>
          <div className="modal-body">
            <p className="modal-texto-confirmar">
              ¿Estás seguro que querés eliminar <strong>{itemSeleccionado.nombre}</strong> del inventario?
              Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="modal-footer">
            <button className="btn-cancelar" onClick={() => setModalEliminar(false)}>
              Cancelar
            </button>
            <button className="btn-eliminar-confirm" onClick={confirmarEliminar} disabled={cargando}>
              {cargando ? "Eliminando..." : "Sí, eliminar"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}