import { useState, useEffect, useRef, useMemo } from "react";
import axios from "../api/axios";
import "./administracion.css";

const NAV_ITEMS = [
  { id: "inicio", label: "INICIO" },
  { id: "inventario", label: "INVENTARIO" },
  { id: "reportes", label: "REPORTES" },
  { id: "administracion", label: "ADMINISTRACIÓN", soloAdmin: true },
];

// ─── Auditoría ──────────────────────────────────────────────────────────────
// Datos reales, servidos por GET /auditorias (tabla Auditorias, ver init.sql
// y backend/src/services/auditoria.service.js). Cada acción relevante del
// sistema (login, altas/ediciones/bajas de inventario, retiros, altas/bajas
// de usuario) inserta ahí un registro desde el controller correspondiente.
const ACCION_ESTILO = {
  RETIRO: "verde",
  EDICIÓN: "amarillo",
  ELIMINACIÓN: "rojo",
  ALTA: "neutro-fuerte",
  SESIÓN: "neutro",
  "ALTA USUARIO": "neutro-fuerte",
  "BAJA USUARIO": "rojo",
};

const FILTROS_AUDITORIA = [
  { id: "todo", label: "TODO" },
  { id: "RETIRO", label: "RETIROS", clase: "verde" },
  { id: "EDICIÓN", label: "EDICIONES", clase: "amarillo" },
  { id: "ELIMINACIÓN", label: "ELIMINACIONES", clase: "rojo" },
  { id: "ALTA", label: "ALTAS" },
  { id: "SESIÓN", label: "SESIONES" },
  { id: "ALTA USUARIO", label: "ALTAS USUARIO" },
  { id: "BAJA USUARIO", label: "BAJAS USUARIO", clase: "rojo" },
];

function formatearHora(fechaIso) {
  return new Date(fechaIso).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatearFechaGrupo(fechaIso) {
  const texto = new Date(fechaIso).toLocaleDateString("es-AR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return texto.replace(/\./g, "").toUpperCase();
}

const FILTROS_USUARIOS = [
  { id: "todos", label: "TODOS" },
  { id: "activos", label: "ACTIVOS", clase: "verde" },
  { id: "inactivos", label: "INACTIVOS" },
  { id: "Administrador", label: "ADMINISTRADORES" },
  { id: "Operario", label: "OPERARIOS" },
];

function exportarCsv(dias) {
  const filas = [["FECHA", "HORA", "USUARIO", "ROL", "ACCIÓN", "DETALLE", "SUCURSAL"]];

  dias.forEach((d) => {
    d.eventos.forEach((e) => {
      filas.push([d.fecha, e.hora, e.usuario, e.rol, e.accion, e.detalle, e.sucursal]);
    });
  });

  const csv = filas
    .map((fila) =>
      fila.map((celda) => `"${String(celda).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "auditoria.csv";
  link.click();

  URL.revokeObjectURL(url);
}

export default function Administracion({ onNavegar, usuario, onLogout }) {
  const [tab, setTab] = useState("usuarios");

  // Tema claro/oscuro (persistido, compartido entre páginas)
  const [tema, setTema] = useState(() => {
    try {
      return localStorage.getItem("gondolapro_tema") || "oscuro";
    } catch {
      return "oscuro";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("gondolapro_tema", tema);
    } catch {
      // localStorage no disponible: no es crítico.
    }
  }, [tema]);

  // Menú de usuario (cerrar sesión)
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
  const menuUsuarioRef = useRef(null);

  useEffect(() => {
    const handleClickFuera = (e) => {
      if (
        menuUsuarioRef.current &&
        !menuUsuarioRef.current.contains(e.target)
      ) {
        setMenuUsuarioAbierto(false);
      }
    };

    document.addEventListener("mousedown", handleClickFuera);

    return () => {
      document.removeEventListener("mousedown", handleClickFuera);
    };
  }, []);

  // ── Usuarios ────────────────────────────────────────────────────────────
  const [usuarios, setUsuarios] = useState([]);
  const [filtroUsuarios, setFiltroUsuarios] = useState("todos");

  const cargarUsuarios = async () => {
    try {
      const response = await axios.get("/usuarios");
      setUsuarios(response.data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const toggleActivo = async (id) => {
    const objetivo = usuarios.find((u) => Number(u.id_usuario) === Number(id));
    if (!objetivo) return;

    const nuevoEstado = !objetivo.activo;

    try {
      await axios.patch(`/usuarios/${id}`, {
        activo: nuevoEstado,
        id_usuario_actor: usuario?.id_usuario || null,
      });

      setUsuarios(
        usuarios.map((u) =>
          Number(u.id_usuario) === Number(id) ? { ...u, activo: nuevoEstado } : u
        )
      );
    } catch (error) {
      console.error(error);
      alert("Error al actualizar usuario");
    }
  };

  const activos = usuarios.filter((u) => u.activo).length;
  const inactivos = usuarios.length - activos;
  const administradores = usuarios.filter((u) => u.rol === "Administrador").length;
  const operarios = usuarios.filter((u) => u.rol === "Operario").length;

  const usuariosFiltrados = usuarios.filter((u) => {
    if (filtroUsuarios === "todos") return true;
    if (filtroUsuarios === "activos") return u.activo;
    if (filtroUsuarios === "inactivos") return !u.activo;
    return u.rol === filtroUsuarios;
  });

  // ── Auditorías ───────────────────────────────────────────────────────────
  const [eventosAuditoria, setEventosAuditoria] = useState([]);
  const [filtroAuditoria, setFiltroAuditoria] = useState("todo");
  const [rangoDias, setRangoDias] = useState(7);
  const [cargandoAuditoria, setCargandoAuditoria] = useState(false);

  const cargarAuditorias = async () => {
    setCargandoAuditoria(true);
    try {
      const response = await axios.get(`/auditorias?dias=${rangoDias}`);
      setEventosAuditoria(response.data);
    } catch (error) {
      console.error("Error cargando auditorías:", error);
    } finally {
      setCargandoAuditoria(false);
    }
  };

  useEffect(() => {
    if (tab === "auditorias") {
      cargarAuditorias();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, rangoDias]);

  // Cada evento trae su fecha ISO completa (columna `fecha` de Auditorias);
  // acá se derivan la hora y la etiqueta de día usadas para agrupar y
  // mostrar, manteniendo la misma forma de evento que usaba el mock.
  const eventosPlanos = useMemo(
    () =>
      eventosAuditoria.map((e) => ({
        hora: formatearHora(e.fecha),
        usuario: e.usuario || "Usuario eliminado",
        rol: (e.rol || "").toUpperCase(),
        accion: e.accion,
        detalle: e.detalle,
        sucursal: e.sucursal || "TODAS",
        _fechaGrupo: formatearFechaGrupo(e.fecha),
      })),
    [eventosAuditoria]
  );

  const diasAuditoria = useMemo(() => {
    const mapa = new Map();

    eventosPlanos.forEach((e) => {
      if (!mapa.has(e._fechaGrupo)) mapa.set(e._fechaGrupo, []);
      mapa.get(e._fechaGrupo).push(e);
    });

    return Array.from(mapa, ([fecha, eventos]) => ({ fecha, eventos }));
  }, [eventosPlanos]);

  const diasFiltrados = useMemo(() => {
    if (filtroAuditoria === "todo") return diasAuditoria;

    return diasAuditoria
      .map((d) => ({
        ...d,
        eventos: d.eventos.filter((e) => e.accion === filtroAuditoria),
      }))
      .filter((d) => d.eventos.length > 0);
  }, [diasAuditoria, filtroAuditoria]);

  const hoyGrupo = useMemo(() => formatearFechaGrupo(new Date().toISOString()), []);
  const eventosHoy = eventosPlanos.filter((e) => e._fechaGrupo === hoyGrupo).length;
  const eventosCriticos = eventosPlanos.filter((e) => e.accion === "ELIMINACIÓN").length;
  const usuariosConActividad = new Set(eventosPlanos.map((e) => e.usuario)).size;
  const ultimoEvento = eventosPlanos[0];

  return (
    <div className="ad-shell" data-tema={tema}>
      {/* Sidebar */}
      <aside className="ad-sidebar">
        <div className="ad-sidebar-top">
          <div className="ad-logo">GóndolaPro</div>
          <div className="ad-sublogo">SISTEMA DE INVENTARIO</div>
        </div>

        <nav className="ad-nav">
          {NAV_ITEMS.filter(
            (item) => !item.soloAdmin || usuario?.rol !== "Operario"
          ).map((item) => (
            <a
              key={item.id}
              className={`ad-nav-item${item.id === "administracion" ? " activo" : ""}`}
              onClick={() => onNavegar(item.id)}
            >
              {item.label}
            </a>
          ))}

          <div className="ad-subnav">
            <span
              className={`ad-subnav-item${tab === "usuarios" ? " activo" : ""}`}
              onClick={() => setTab("usuarios")}
            >
              USUARIOS
            </span>
            <span
              className={`ad-subnav-item${tab === "auditorias" ? " activo" : ""}`}
              onClick={() => setTab("auditorias")}
            >
              AUDITORÍAS
            </span>
          </div>
        </nav>

        <div className="ad-theme-switch">
          <button
            className={`ad-theme-btn${tema === "oscuro" ? " activo" : ""}`}
            onClick={() => setTema("oscuro")}
          >
            🌙 OSCURO
          </button>
          <button
            className={`ad-theme-btn${tema === "claro" ? " activo" : ""}`}
            onClick={() => setTema("claro")}
          >
            ☀️ CLARO
          </button>
        </div>

        <div className="ad-sidebar-footer" ref={menuUsuarioRef}>
          <button
            className="ad-user-btn"
            onClick={() => setMenuUsuarioAbierto((v) => !v)}
          >
            <span className="ad-user-info">
              <span className="ad-user-name">
                {usuario?.nombre || "Usuario"}
              </span>
              <span className="ad-user-role">
                {(usuario?.rol || "").toUpperCase()}
              </span>
            </span>
            <span className="ad-user-caret">
              {menuUsuarioAbierto ? "▴" : "▾"}
            </span>
          </button>

          {menuUsuarioAbierto && (
            <div className="ad-user-menu">
              <button
                className="ad-user-menu-item"
                onClick={() => {
                  setMenuUsuarioAbierto(false);
                  onLogout?.();
                }}
              >
                CERRAR SESIÓN
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="ad-main">
        <div className="ad-topbar">
          <div className="ad-title-group">
            <h1 className="ad-title">Administración</h1>
            <div className="ad-subtitle">
              {tab === "usuarios"
                ? "ALTAS Y BAJAS DEL EQUIPO"
                : "REGISTRO DE ACTIVIDAD DEL SISTEMA"}
            </div>
          </div>

          <div className="ad-maintabs">
            <button
              className={`ad-maintab${tab === "usuarios" ? " activo" : ""}`}
              onClick={() => setTab("usuarios")}
            >
              USUARIOS
            </button>
            <button
              className={`ad-maintab${tab === "auditorias" ? " activo" : ""}`}
              onClick={() => setTab("auditorias")}
            >
              AUDITORÍAS
            </button>
          </div>
        </div>

        {tab === "usuarios" ? (
          <>
            <div className="ad-stats">
              <div className="ad-stat ad-stat-grande ad-stat-verde">
                <span className="ad-stat-num">{activos}</span>
                <span className="ad-stat-label">ACTIVOS</span>
              </div>
              <div className="ad-stat ad-stat-media ad-stat-neutro">
                <span className="ad-stat-num">{inactivos}</span>
                <span className="ad-stat-label">INACTIVOS</span>
              </div>
              <div className="ad-stat">
                <span className="ad-stat-num">{administradores}</span>
                <span className="ad-stat-label">ADMINISTRADORES</span>
              </div>
              <div className="ad-stat">
                <span className="ad-stat-num">{operarios}</span>
                <span className="ad-stat-label">OPERARIOS</span>
              </div>
            </div>

            <div className="ad-filtros">
              {FILTROS_USUARIOS.map((f) => (
                <button
                  key={f.id}
                  className={`ad-filtro-btn${f.clase ? ` ${f.clase}` : ""}${
                    filtroUsuarios === f.id ? " activo" : ""
                  }`}
                  onClick={() => setFiltroUsuarios(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="ad-thead">
              <span>NOMBRE</span>
              <span>EMAIL</span>
              <span>ROL</span>
              <span>ESTADO</span>
              <span>ACCIÓN</span>
            </div>

            <div className="ad-tbody">
              {usuariosFiltrados.length === 0 ? (
                <div className="ad-empty">No hay usuarios para mostrar</div>
              ) : (
                usuariosFiltrados.map((u) => (
                  <div className="ad-row" key={u.id_usuario}>
                    <span className="ad-col-usuario">
                      <span
                        className={`ad-marca${
                          !u.activo
                            ? ""
                            : u.rol === "Administrador"
                            ? " amarillo"
                            : " verde"
                        }`}
                      />
                      <span className={`ad-nombre${u.activo ? "" : " inactivo"}`}>
                        {u.nombre}
                      </span>
                    </span>

                    <span className="ad-email">{u.email}</span>

                    <span
                      className={`ad-rol${u.rol === "Administrador" ? " admin" : ""}`}
                    >
                      {(u.rol || "").toUpperCase()}
                    </span>

                    <span
                      className={`ad-estado ${
                        u.activo ? "ad-estado-activo" : "ad-estado-inactivo"
                      }`}
                    >
                      {u.activo ? "ACTIVO" : "INACTIVO"}
                    </span>

                    <span>
                      <button
                        className={`ad-btn-accion ${
                          u.activo ? "ad-btn-baja" : "ad-btn-alta"
                        }`}
                        onClick={() => toggleActivo(u.id_usuario)}
                      >
                        {u.activo ? "DAR DE BAJA" : "REACTIVAR"}
                      </button>
                    </span>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            <div className="ad-stats">
              <div className="ad-stat ad-stat-grande">
                <span className="ad-stat-num">{eventosHoy}</span>
                <span className="ad-stat-label">EVENTOS HOY</span>
              </div>
              <div className="ad-stat ad-stat-media ad-stat-rojo">
                <span className="ad-stat-num">{eventosCriticos}</span>
                <span className="ad-stat-label">ELIMINACIONES</span>
              </div>
              <div className="ad-stat">
                <span className="ad-stat-num">{usuariosConActividad}</span>
                <span className="ad-stat-label">USUARIOS CON ACTIVIDAD</span>
              </div>
              {ultimoEvento && (
                <div className="ad-ultimo">
                  <span className="ad-ultimo-label">ÚLTIMO EVENTO</span>
                  <span className="ad-ultimo-valor">
                    {ultimoEvento.accion.charAt(0)}
                    {ultimoEvento.accion.slice(1).toLowerCase()} · {ultimoEvento.usuario}
                  </span>
                  <span className="ad-ultimo-hora">
                    HOY {ultimoEvento.hora} · {ultimoEvento.sucursal}
                  </span>
                </div>
              )}
            </div>

            <div className="ad-filtros ad-filtros-auditoria">
              {FILTROS_AUDITORIA.map((f) => (
                <button
                  key={f.id}
                  className={`ad-filtro-btn${f.clase ? ` ${f.clase}` : ""}${
                    filtroAuditoria === f.id ? " activo" : ""
                  }`}
                  onClick={() => setFiltroAuditoria(f.id)}
                >
                  {f.label}
                </button>
              ))}

              <span className="ad-filtros-derecha">
                <select
                  className="ad-rango"
                  value={rangoDias}
                  onChange={(e) => setRangoDias(Number(e.target.value))}
                >
                  <option value={7}>ÚLTIMOS 7 DÍAS</option>
                  <option value={30}>ÚLTIMOS 30 DÍAS</option>
                  <option value={90}>ÚLTIMOS 90 DÍAS</option>
                </select>
                <button
                  className="ad-btn-exportar"
                  onClick={() => exportarCsv(diasFiltrados)}
                >
                  EXPORTAR CSV
                </button>
              </span>
            </div>

            <div className="ad-aud-thead">
              <span>HORA</span>
              <span>USUARIO</span>
              <span>ACCIÓN</span>
              <span>DETALLE</span>
              <span>SUCURSAL</span>
            </div>

            <div className="ad-tbody">
              {cargandoAuditoria ? (
                <div className="ad-empty">Cargando…</div>
              ) : diasFiltrados.length === 0 ? (
                <div className="ad-empty">No hay eventos para mostrar</div>
              ) : (
                diasFiltrados.map((d) => (
                  <div key={d.fecha} className="ad-dia-grupo">
                    <div className="ad-dia-header">
                      <span className="ad-dia-fecha">{d.fecha}</span>
                      <span className="ad-dia-resumen">
                        {d.eventos.length} EVENTOS
                      </span>
                    </div>

                    {d.eventos.map((e, i) => (
                      <div className="ad-evento-row" key={`${d.fecha}-${i}`}>
                        <span className="ad-evento-hora">{e.hora}</span>

                        <span className="ad-evento-usuario-wrap">
                          <span
                            className={`ad-evento-marca ${
                              ACCION_ESTILO[e.accion] || "neutro"
                            }`}
                          />
                          <span className="ad-evento-usuario-info">
                            <span className="ad-evento-nombre">{e.usuario}</span>
                            <span className="ad-evento-rol">{e.rol}</span>
                          </span>
                        </span>

                        <span
                          className={`ad-evento-accion ${
                            ACCION_ESTILO[e.accion] || "neutro"
                          }`}
                        >
                          {e.accion}
                        </span>

                        <span className="ad-evento-detalle">{e.detalle}</span>
                        <span className="ad-evento-sucursal">{e.sucursal}</span>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </>
        )}

        <div className="ad-footer">
          <span className="ad-footer-info">
            {tab === "usuarios"
              ? `${usuarios.length} USUARIOS`
              : `${eventosPlanos.length} EVENTOS EN LOS ÚLTIMOS ${rangoDias} DÍAS`}
          </span>
          <span className="ad-footer-brand">GÓNDOLAPRO</span>
        </div>
      </div>
    </div>
  );
}
