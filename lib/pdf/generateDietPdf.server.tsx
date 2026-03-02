// lib/pdf/generateDietPdf.server.tsx
import { pdf } from "@react-pdf/renderer";
import DietPdf from "@/app/pdf/DietPdf";
import { SharedDiet } from "@/lib/dietsApi";
import fs from "fs";
import path from "path";

export async function generateDietPdfServer(
  diet: SharedDiet
): Promise<ArrayBuffer> {
  try {
    // 📌 Leer el logo desde la carpeta public
    const logoPath = path.join(process.cwd(), "public", "logo.png");

    const logoBuffer = fs.readFileSync(logoPath);

    // Convertir a base64 compatible con react-pdf
    const logoBase64 = `data:image/png;base64,${logoBuffer.toString(
      "base64"
    )}`;

    // Pasar logo al componente PDF
    const document = <DietPdf diet={diet} logo={logoBase64} />;

    const blob = await pdf(document).toBlob();

    return await blob.arrayBuffer();
  } catch (error) {
    console.error("Error generando PDF:", error);
    throw new Error("No se pudo generar el PDF");
  }
}