import { useState } from "react";
import Login from "./pages/login";
import Inicio from "./pages/inicio";
import Inventario from "./pages/inventario";
import Reportes from "./pages/reportes";
import Usuarios from "./pages/usuarios";

function App() {
  const [pagina, setPagina] = useState("login");

  if (pagina === "inicio") return <Inicio onNavegar={setPagina} />;
  if (pagina === "inventario") return <Inventario onNavegar={setPagina} />;
  if (pagina === "reportes") return <Reportes onNavegar={setPagina} />;
  if (pagina === "usuarios") return <Usuarios onNavegar={setPagina} />;
  return <Login onLogin={() => setPagina("inicio")} />;
}

export default App;