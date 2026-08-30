import { useState, useEffect } from "react";
import "./login.css";
import { loginConEmail, loginConPin } from "../api/auth";
import { obtenerResumenSucursales } from "../api/sucursales";

const PARTE_DIA_KEY = "gondolapro_parte_dia";
// Cada tantos ms el slider avanza a la siguiente sucursal (ver ParteSlider).
const SLIDER_INTERVALO_MS = 6000;

const DIAS = ["DOMINGO", "LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO"];
const DIAS_CORTO = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
const MESES = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

const KEYS = [
  ["1"], ["2"], ["3"],
  ["4"], ["5"], ["6"],
  ["7"], ["8"], ["9"],
  ["", "vacio"], ["0"], ["⌫", "borrar"],
];

function turnoDe(hora) {
  if (hora >= 6 && hora < 14) return "MAÑANA";
  if (hora >= 14 && hora < 22) return "TARDE";
  return "NOCHE";
}

function formatSello(fecha, corto = false) {
  const dias = corto ? DIAS_CORTO : DIAS;
  const dia = dias[fecha.getDay()];
  const num = fecha.getDate();
  const mes = MESES[fecha.getMonth()];
  const hh = String(fecha.getHours()).padStart(2, "0");
  const mm = String(fecha.getMinutes()).padStart(2, "0");
  const turno = turnoDe(fecha.getHours());
  return `${dia} ${num} ${mes} · ${hh}:${mm} · TURNO ${turno}`;
}

function leerParteCache() {
  try {
    const raw = localStorage.getItem(PARTE_DIA_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!Array.isArray(data?.sucursales) || typeof data?.ts !== "number") {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

// Antepone un cuarto slide "General" que suma los tres conteos + el total
// de cada sucursal — no pide nada aparte, `/sucursales/resumen` ya trae
// todo lo necesario para agregarlo en el cliente.
function conGeneral(porSucursal) {
  const general = porSucursal.reduce(
    (acc, s) => ({
      verdes: acc.verdes + s.verdes,
      amarillos: acc.amarillos + s.amarillos,
      rojos: acc.rojos + s.rojos,
      total: acc.total + s.total,
    }),
    { verdes: 0, amarillos: 0, rojos: 0, total: 0 }
  );

  return [{ sucursal: "General", general: true, ...general }, ...porSucursal];
}

function LogoChangoMas({ tam = "lg" }) {
  return (
    <span className={`logo-changomas logo-${tam}`}>
      <span className="logo-chango">Chango</span>
      <span className="logo-mas">Mas</span>
    </span>
  );
}

// Recorre todas las sucursales una a la vez — cada una con sus 3 conteos de
// vencimiento más el total de inventario — con avance automático y puntos
// para saltar manualmente. Colapsa (no renderiza nada) si todavía no hay
// datos, ni en vivo ni en caché.
function ParteSlider({ sucursales, indice, onSeleccionar }) {
  if (sucursales.length === 0) return null;

  const actual = sucursales[indice % sucursales.length];
  const etiqueta = actual.general
    ? "TODAS LAS SUCURSALES"
    : `SUCURSAL ${actual.sucursal?.toUpperCase()}`;

  const bandas = [
    { key: "rojo", bg: "#e1222a", fg: "#fff", n: actual.rojos, l1: "VENCIDOS", l2: "PARA RETIRAR HOY" },
    { key: "amarillo", bg: "#f1bd30", fg: "#000", n: actual.amarillos, l1: "VENCEN", l2: "EN 7 DÍAS" },
    { key: "verde", bg: "#0ba852", fg: "#000", n: actual.verdes, l1: "EN REGLA", l2: "SIN RIESGO" },
    { key: "total", n: actual.total, l1: "TOTAL", l2: "EN INVENTARIO" },
  ];

  return (
    <div className="parte-bloque">
      <span className="parte-slide-label">{etiqueta}</span>

      <div className="bandas">
        {bandas.map((b) => (
          <div
            key={b.key}
            className={`banda${b.key === "total" ? " banda-total" : ""}`}
            style={b.bg ? { background: b.bg } : undefined}
          >
            <span className="banda-numero" style={b.fg ? { color: b.fg } : undefined}>
              {b.n}
            </span>
            <span className="banda-etiqueta" style={b.fg ? { color: b.fg } : undefined}>
              {b.l1}<br />{b.l2}
            </span>
          </div>
        ))}
      </div>

      {/* Como en un carrusel de historias: los puntos van después del
          contenido, en un margen negro angosto pegado al borde inferior —
          no flotan encima ni empujan las bandas hacia arriba. */}
      {sucursales.length > 1 && (
        <div className="parte-dots">
          {sucursales.map((s, i) => (
            <button
              key={s.sucursal}
              type="button"
              className={`parte-dot${i === indice % sucursales.length ? " parte-dot-activo" : ""}`}
              onClick={() => onSeleccionar(i)}
              aria-label={`Ver ${s.sucursal}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BarraError({ texto }) {
  if (!texto) return null;
  return (
    <div className="barra-error">
      <span className="barra-error-texto">{texto.toUpperCase()}</span>
    </div>
  );
}

function TecladoNumerico({ onTecla }) {
  return (
    <div className="teclado-numerico">
      {KEYS.map(([k, kind], i) => (
        <button
          key={i}
          type="button"
          className={`tecla${kind === "vacio" ? " tecla-vacia" : ""}${kind === "borrar" ? " tecla-borrar" : ""}`}
          disabled={kind === "vacio"}
          onClick={() => onTecla(k, kind)}
          tabIndex={kind === "vacio" ? -1 : 0}
        >
          {k}
        </button>
      ))}
    </div>
  );
}

function PinCasillas({ pin, onChange, error, tam = "desktop" }) {
  const casillas = [0, 1, 2, 3];

  return (
    <div className={`pin-casillas pin-casillas-${tam}${error ? " pin-casillas-error" : ""}`}>
      {casillas.map((i) => {
        const lleno = i < pin.length;
        const esActiva = i === pin.length;
        return (
          <span
            key={i}
            className={`pin-casilla${esActiva ? " pin-casilla-activa" : ""}`}
          >
            {lleno ? "•" : ""}
          </span>
        );
      })}
      <input
        className="pin-input-oculto"
        type="tel"
        inputMode="numeric"
        autoComplete="off"
        maxLength={4}
        value={pin}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
        aria-label="PIN de 4 dígitos"
      />
    </div>
  );
}

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const [verPassword, setVerPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [vistaMobil, setVistaMobil] = useState("pin"); // "pin" | "email"

  const [parte, setParte] = useState(leerParteCache);
  const [indice, setIndice] = useState(0);

  const sucursales = parte?.sucursales ?? [];

  // El caché (de la última visita a este login) es el fallback; el dato en
  // vivo lo pisa apenas llega, y de paso refresca el caché para la próxima
  // vez que la API no responda (kiosco offline, etc).
  useEffect(() => {
    let cancelado = false;

    obtenerResumenSucursales()
      .then((data) => {
        if (cancelado) return;

        const fresco = { sucursales: conGeneral(data), ts: Date.now() };

        setParte(fresco);
        setIndice(0);

        try {
          localStorage.setItem(PARTE_DIA_KEY, JSON.stringify(fresco));
        } catch {
          // localStorage no disponible: no es crítico, ya se actualizó la UI.
        }
      })
      .catch((err) => {
        // Sin conexión, etc.: se queda con lo que ya haya en caché (o
        // colapsado si no hay nada).
        console.error("No se pudo obtener el resumen de sucursales:", err);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  // Avance automático del slider. Se reprograma en cada cambio de índice —
  // manual (click en un punto) o automático — así un click reinicia el
  // conteo en vez de saltar de nuevo enseguida.
  useEffect(() => {
    if (sucursales.length < 2) return;

    const id = setTimeout(() => {
      setIndice((i) => (i + 1) % sucursales.length);
    }, SLIDER_INTERVALO_MS);

    return () => clearTimeout(id);
  }, [indice, sucursales.length]);

  const selloFecha = formatSello(parte ? new Date(parte.ts) : new Date());
  const selloFechaCorta = formatSello(parte ? new Date(parte.ts) : new Date(), true);

  const handleLoginEmail = async () => {
    setError("");
    setCargando(true);

    try {
      const data = await loginConEmail(email, password);
      console.log("Login exitoso:", data);
      onLogin(data);
    } catch (err) {
      console.error(err);
      setError("Email o contraseña incorrectos.");
    } finally {
      setCargando(false);
    }
  };

  const handleLoginPin = async () => {
    setError("");
    setCargando(true);

    try {
      const data = await loginConPin(pin);
      console.log("Login PIN exitoso:", data);
      onLogin(data);
    } catch (err) {
      console.error(err);
      setError("PIN incorrecto.");
    } finally {
      setCargando(false);
    }
  };

  const actualizarPin = (valor) => {
    if (error) setError("");
    setPin(valor);
  };

  const onTeclaPin = (k, kind) => {
    if (kind === "vacio") return;
    if (kind === "borrar") {
      actualizarPin(pin.slice(0, -1));
      return;
    }
    if (pin.length < 4) actualizarPin(pin + k);
  };

  const irAEmail = () => {
    setError("");
    setVistaMobil("email");
  };

  const irAPin = () => {
    setError("");
    setVistaMobil("pin");
  };

  return (
    <div className="login-bg">
      <div className="login-shell">

        {/* ---- Columna izquierda (sólo escritorio ≥1024px): parte del día ---- */}
        <aside className="parte-dia">
          <div className="parte-header">
            <LogoChangoMas tam="lg" />
            <h1 className="parte-titulo">PARTE<br />DEL DÍA</h1>
            <span className="parte-fecha">{selloFecha}</span>
          </div>
          <ParteSlider sucursales={sucursales} indice={indice} onSeleccionar={setIndice} />
        </aside>

        {/* ---- Bloque superior mobile (<1024px): logo + fecha/título + bandas/error ---- */}
        <div className="mobile-top">
          <div className="mobile-header">
            <LogoChangoMas tam="sm" />
            {vistaMobil === "pin" && error ? (
              <span className="mobile-titulo-error">ACCESO RÁPIDO<br />CON PIN</span>
            ) : (
              <span className="mobile-fecha">{selloFechaCorta}</span>
            )}
          </div>
          {vistaMobil === "pin" && error ? (
            <BarraError texto={error} />
          ) : (
            <ParteSlider sucursales={sucursales} indice={indice} onSeleccionar={setIndice} />
          )}
        </div>

        {/* ---- Columna derecha: formulario ---- */}
        <main className="login-right">

          {/* Vista escritorio + vista email mobile */}
          <div className={`vista-form${vistaMobil === "email" ? " vista-form-mobil-activa" : ""}`}>
            <div className="login-right-inner">

              {vistaMobil === "email" && <BarraError texto={error} />}

              <div className="titulo-bloque">
                <h2 className="login-titulo">INICIAR SESIÓN</h2>
                <p className="login-subtitulo">Accedé a tu cuenta para continuar</p>
              </div>

              {/* En escritorio el error aplica a ambos flujos (email y PIN), se muestra acá */}
              {error && <div className="solo-desktop"><BarraError texto={error} /></div>}

              <label className="campo">
                <span className="campo-label">EMAIL</span>
                <input
                  type="email"
                  className="campo-input"
                  placeholder="ej: admin@gondolapro.com"
                  value={email}
                  onChange={(e) => {
                    if (error) setError("");
                    setEmail(e.target.value);
                  }}
                />
              </label>

              <label className="campo">
                <span className="campo-label">CONTRASEÑA</span>
                <span className="campo-password">
                  <input
                    type={verPassword ? "text" : "password"}
                    className="campo-input campo-input-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      if (error) setError("");
                      setPassword(e.target.value);
                    }}
                  />
                  <button
                    type="button"
                    className="btn-ver"
                    onClick={() => setVerPassword((v) => !v)}
                  >
                    {verPassword ? "OCULTAR" : "VER"}
                  </button>
                </span>
              </label>

              <button
                type="button"
                className="btn-ingresar"
                disabled={cargando}
                onClick={handleLoginEmail}
              >
                INGRESAR
              </button>

              {/* El bloque de PIN de escritorio queda oculto en la vista email mobile */}
              <div className="bloque-pin-desktop">
                <div className="separador">
                  <span className="separador-linea" />
                  <span className="separador-o">O</span>
                  <span className="separador-linea" />
                </div>

                <div className="pin-bloque">
                  <span className="campo-label">ACCESO RÁPIDO CON PIN</span>
                  <div className="pin-fila">
                    <PinCasillas pin={pin} onChange={actualizarPin} error={!!error} tam="desktop" />
                    <button
                      type="button"
                      className="btn-pin-desktop"
                      disabled={cargando || pin.length !== 4}
                      onClick={handleLoginPin}
                    >
                      INGRESAR CON PIN
                    </button>
                  </div>
                </div>
              </div>

              {/* Volver al PIN, sólo visible en la vista email mobile */}
              <button type="button" className="volver-pin-mobil" onClick={irAPin}>
                ← Ingresar con PIN
              </button>

            </div>
          </div>

          {/* Vista PIN mobile (pantalla por defecto en teléfono) */}
          <div className={`vista-pin-mobil${vistaMobil === "email" ? " oculto" : ""}`}>
            <div className="vista-pin-mobil-inner">
              <h1 className="acceso-pin-titulo">ACCESO RÁPIDO CON PIN</h1>

              <PinCasillas pin={pin} onChange={actualizarPin} error={!!error} tam="mobile" />

              <TecladoNumerico onTecla={onTeclaPin} />
            </div>

            <div className="vista-pin-mobil-pie">
              <button type="button" className="link-email-mobil" onClick={irAEmail}>
                Ingresar con email y contraseña
              </button>
              <button
                type="button"
                className="btn-pin-mobil"
                disabled={cargando || pin.length !== 4}
                onClick={handleLoginPin}
              >
                INGRESAR CON PIN
              </button>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
