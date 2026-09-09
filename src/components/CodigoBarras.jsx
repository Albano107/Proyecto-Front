import Barcode from "react-barcode";
import "./CodigoBarras.css";

/*
  Código de barras visual compacto para mostrar en la tabla.
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
        height={24}
        fontSize={8}
        margin={0}
        displayValue={true}
      />
    </div>
  );
}