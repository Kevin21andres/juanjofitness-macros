// lib/pdf/generateDietPdf.server.tsx
import { pdf } from "@react-pdf/renderer";
import DietPdf from "@/app/pdf/DietPdf";
import { SharedDiet } from "@/lib/dietsApi";

export async function generateDietPdfServer(
  diet: SharedDiet,
  clientName: string
): Promise<ArrayBuffer> {
  const document = <DietPdf diet={diet} clientName={clientName} />;

  const blob = await pdf(document).toBlob();
  return await blob.arrayBuffer();
}
