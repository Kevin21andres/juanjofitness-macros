import { getSharedDietByToken } from "@/lib/dietsApi";
import { generateDietPdfServer } from "@/lib/pdf/generateDietPdf.server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  // 🔑 OBLIGATORIO EN NEXT 15
  const { token } = await params;

  const shared = await getSharedDietByToken(token);

  if (!shared) {
    return new Response("No encontrada", { status: 404 });
  }

  const pdfBuffer = await generateDietPdfServer(
    shared.diet,
    "Cliente"
  );

  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${shared.diet.name}.pdf"`,
    },
  });
}
