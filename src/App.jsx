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

  if (pagina === "inicio") return <Inicio usuario={usuario} onNavegar={setPagina} />;
  if (pagina === "inventario") return <Inventario usuario={usuario} onNavegar={setPagina} />;
  if (pagina === "reportes") return <Reportes usuario={usuario} onNavegar={setPagina} />;
  if (pagina === "usuarios") return <Usuarios usuario={usuario} onNavegar={setPagina} />;
  return <Login onLogin={handleLogin} />;
}
export default App;