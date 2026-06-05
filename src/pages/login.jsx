import { useState } from "react";
import "./login.css";
// import { loginConEmail, loginConPin } from "../api/auth"; // descomentar cuando el backend esté listo

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleLoginEmail = async () => {
    setError("");
    try {
      // const data = await loginConEmail(email, password); // con backend real
      // onLogin(data.usuario, data.token);
      onLogin(); // mock por ahora
    } catch (err) {
      setError("Email o contraseña incorrectos.");
    }
  };

  const handleLoginPin = async () => {
    setError("");
    try {
      // const data = await loginConPin(pin); // con backend real
      // onLogin(data.usuario, data.token);
      onLogin(); // mock por ahora
    } catch (err) {
      setError("PIN incorrecto.");
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">

        <div className="login-left">
          <h2 className="login-brand">GóndolaPro</h2>
          <p className="login-brand-sub">Control de vencimientos</p>
          <div className="login-features">
            <div className="feature-item">
              <span className="feature-icon">📦</span>
              <div>
                <p className="feature-title">Stock en tiempo real</p>
                <p className="feature-desc">Monitoreá productos y vencimientos</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🚨</span>
              <div>
                <p className="feature-title">Alertas automáticas</p>
                <p className="feature-desc">Detectá productos próximos a vencer</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <div>
                <p className="feature-title">Reportes de mermas</p>
                <p className="feature-desc">Analizá pérdidas y tomá decisiones</p>
              </div>
            </div>
          </div>
        </div>

        <div className="login-right">
          <h1 className="login-title">Iniciar sesión</h1>
          <p className="login-subtitle">Accedé a tu cuenta para continuar</p>

          {error && <p className="login-error">{error}</p>}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="ej: admin@gondola.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button className="btn-login" onClick={handleLoginEmail}>
            Ingresar
          </button>

          <div className="divider">o</div>

          <div className="form-group">
            <label>Acceso rápido con PIN</label>
            <input
              type="password"
              placeholder="••••"
              maxLength={4}
              value={pin}
              onChange={e => setPin(e.target.value)}
            />
          </div>

          <button className="btn-pin" onClick={handleLoginPin}>
            Ingresar con PIN
          </button>
        </div>

      </div>
    </div>
  );
}