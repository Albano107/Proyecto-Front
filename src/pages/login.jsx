import "./login.css";

export default function Login({ onLogin }) {
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

          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="ej: admin@gondola.com" />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" placeholder="••••••••" />
          </div>

          <button className="btn-login" onClick={onLogin}>
            Ingresar
          </button>

          <div className="divider">o</div>

          <div className="form-group">
            <label>Acceso rápido con PIN</label>
            <input type="password" placeholder="••••" maxLength={4} />
          </div>

          <button className="btn-pin" onClick={onLogin}>
            Ingresar con PIN
          </button>
        </div>

      </div>
    </div>
  );
}