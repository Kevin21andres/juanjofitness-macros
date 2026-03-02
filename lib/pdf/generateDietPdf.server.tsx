// lib/pdf/generateDietPdf.server.tsx
import { pdf } from "@react-pdf/renderer";
import DietPdf from "@/app/pdf/DietPdf";
import { SharedDiet } from "@/lib/dietsApi";
import logoFile from "@/lib/assets/logo.png";

export async function generateDietPdfServer(
  diet: SharedDiet
): Promise<ArrayBuffer> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const logoUrl = `${baseUrl}${logoFile.src}`;

    const document = (
      <DietPdf
        diet={diet}
        logo={logoUrl}
      />
    );

    const blob = await pdf(document).toBlob();

    return await blob.arrayBuffer();
  } catch (error) {
    console.error("Error generando PDF:", error);
    throw new Error("No se pudo generar el PDF");
  }
}