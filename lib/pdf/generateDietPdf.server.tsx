// lib/pdf/generateDietPdf.server.tsx
import { pdf } from "@react-pdf/renderer";
import DietPdf from "@/app/pdf/DietPdf";
import { SharedDiet } from "@/lib/dietsApi";

export async function generateDietPdfServer(
  diet: SharedDiet
): Promise<ArrayBuffer> {
  const document = <DietPdf diet={diet} />;

  const blob = await pdf(document).toBlob();
  return await blob.arrayBuffer();
}
