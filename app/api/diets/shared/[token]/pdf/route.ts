// app/api/diets/shared/[token]/pdf/route.ts

import { getSharedDietByToken } from "@/lib/dietsApi";
import { generateDietPdfServer } from "@/lib/pdf/generateDietPdf.server";

/* =========================
   CONFIGURACIÓN
========================= */

export const dynamic = "force-dynamic";
export const revalidate = 0;

/* =========================
   NOMBRE DE ARCHIVO SEGURO
========================= */

function sanitizePdfFilename(name: string): string {
  const sanitized = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._ -]/g, "_")
    .replace(/\s+/g, " ")
    .replace(/^[.\s]+|[.\s]+$/g, "")
    .slice(0, 100);

  return sanitized || "plan-nutricional";
}

/* =========================
   GET PDF PÚBLICO POR TOKEN
========================= */

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ token: string }>;
  }
) {
  const { token } = await params;

  /*
   * getSharedDietByToken() utiliza la RPC
   * get_shared_diet(), que valida:
   *
   * - existencia del token;
   * - estado activo;
   * - fecha de expiración.
   */
  const shared =
    await getSharedDietByToken(token);

  if (!shared) {
    return new Response(
      "No encontrada",
      {
        status: 404,
        headers: {
          "Cache-Control":
            "private, no-store, max-age=0, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
          "X-Robots-Tag":
            "noindex, nofollow, noarchive, nosnippet",
          "X-Content-Type-Options":
            "nosniff",
        },
      }
    );
  }

  const pdfBuffer =
    await generateDietPdfServer(
      shared.diet
    );

  /*
   * Nunca introducimos directamente el nombre
   * de la dieta en Content-Disposition.
   *
   * Esto evita caracteres de control,
   * comillas, barras y otros caracteres
   * problemáticos en una cabecera HTTP.
   */
  const filename =
    sanitizePdfFilename(
      shared.diet.name
    );

  return new Response(
    pdfBuffer,
    {
      status: 200,

      headers: {
        "Content-Type":
          "application/pdf",

        "Content-Disposition":
          `attachment; filename="${filename}.pdf"`,

        /*
         * El PDF contiene información asociada
         * a un enlace privado por token.
         * No debe almacenarse en caches.
         */
        "Cache-Control":
          "private, no-store, max-age=0, must-revalidate",

        Pragma:
          "no-cache",

        Expires:
          "0",

        /*
         * Evita que buscadores indexen
         * directamente el endpoint del PDF.
         */
        "X-Robots-Tag":
          "noindex, nofollow, noarchive, nosnippet",

        /*
         * Evita MIME sniffing.
         */
        "X-Content-Type-Options":
          "nosniff",

        /*
         * No enviamos la URL que contiene
         * el token como Referer.
         */
        "Referrer-Policy":
          "no-referrer",
      },
    }
  );
}