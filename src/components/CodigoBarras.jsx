import Barcode from "react-barcode";
import "./CodigoBarras.css";

/*
  Componente para mostrar un código de barras visual.

  Recibe un valor numérico o texto desde el producto.
  Usamos formato CODE128 porque acepta códigos numéricos y alfanuméricos,
  ideal para códigos de prueba o códigos reales cargados en la base.
*/
export default function CodigoBarras({ valor }) {
  if (!valor || String(valor).trim() === "") {
    return null;
  }

  const codigo = String(valor).trim();

  return (
    <div className="codigo-barras-box" title={`Código: ${codigo}`}>
      <Barcode
        value={codigo}
        format="CODE128"
        width={1}
        height={34}
        fontSize={10}
        margin={0}
        displayValue={true}
      />
    </div>
  );
}