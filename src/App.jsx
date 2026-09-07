import { useState } from "react";
import Login from "./pages/login";
import Inicio from "./pages/inicio";
import Inventario from "./pages/inventario";
import Reportes from "./pages/reportes";
import Usuarios from "./pages/usuarios";

function App() {
  const [pagina, setPagina] = useState("login");
  const [usuario, setUsuario] = useState(null);

  const handleLogin = (data) => {
    setUsuario(data);
    setPagina("inicio");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUsuario(null);
    setPagina("login");
  };

  if (pagina === "inicio")
    return <Inicio usuario={usuario} onNavegar={setPagina} onLogout={handleLogout} />;
  if (pagina === "inventario")
    return <Inventario usuario={usuario} onNavegar={setPagina} onLogout={handleLogout} />;
  if (pagina === "reportes")
    return <Reportes usuario={usuario} onNavegar={setPagina} onLogout={handleLogout} />;
  if (pagina === "usuarios")
    return <Usuarios usuario={usuario} onNavegar={setPagina} onLogout={handleLogout} />;
  return <Login onLogin={handleLogin} />;
}
export default App;