import axios from "./axios";

// Endpoint público, sin token: lo llama la pantalla de login antes de que
// exista una sesión, para el slider del "parte del día" que recorre todas
// las sucursales. Cada elemento trae { sucursal, verdes, amarillos, rojos, total }.
export const obtenerResumenSucursales = async () => {
  const res = await axios.get("/sucursales/resumen");
  return res.data;
};
