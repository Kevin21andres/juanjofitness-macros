import { getSharedDietByToken } from "@/lib/dietsApi";
import { generateDietPdfServer } from "@/lib/pdf/generateDietPdf.server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  // Next 15: los params de rutas dinámicas llegan como Promise
  const { token } = await params;

  // Recupera la dieta asociada al token (acceso público controlado)
  const shared = await getSharedDietByToken(token);

  if (!shared) {
    // No revelamos detalles para evitar enumeración de tokens
    return new Response("No encontrada", { status: 404 });
  }

  // Generación del PDF en servidor con el único motor de PDF
  const pdfBuffer = await generateDietPdfServer(
    shared.diet,
    "Cliente"
  );

  // Respuesta binaria forzando descarga
  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${shared.diet.name}.pdf"`,
    },
  });
}
