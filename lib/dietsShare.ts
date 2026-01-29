/* =========================
   COMPARTIR DIETAS POR URL
========================= */

type ShareOptions = {
  clientName: string;
  dietId: string;
  clientPhone?: string | null;
  clientEmail?: string | null;
};

/* =========================
   URL BASE
   (automático según entorno)
========================= */
function getBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // fallback SSR (por si acaso)
  return process.env.NEXT_PUBLIC_SITE_URL || "";
}

/* =========================
   URL PÚBLICA DE LA DIETA
========================= */
export function getDietShareUrl(dietId: string) {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/share/diet/${dietId}`;
}

/* =========================
   WHATSAPP
========================= */
export function shareDietByWhatsApp({
  clientName,
  dietId,
  clientPhone,
}: ShareOptions) {
  if (!clientPhone) {
    throw new Error("El cliente no tiene teléfono");
  }

  const url = getDietShareUrl(dietId);

  const message = `
Hola ${clientName} 👋

Te dejo tu plan nutricional actualizado 🍽️💪

👉 ${url}

Cualquier duda me dices 🙂
`.trim();

  const phone = clientPhone.replace(/\s+/g, "");
  const encodedMessage = encodeURIComponent(message);

  const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;

  window.open(whatsappUrl, "_blank");
}

/* =========================
   EMAIL
========================= */
export function shareDietByEmail({
  clientName,
  dietId,
  clientEmail,
}: ShareOptions) {
  if (!clientEmail) {
    throw new Error("El cliente no tiene email");
  }

  const url = getDietShareUrl(dietId);

  const subject = encodeURIComponent(
    "Tu plan nutricional personalizado"
  );

  const body = encodeURIComponent(`
Hola ${clientName},

Te envío tu plan nutricional actualizado.

Puedes consultarlo aquí:
${url}

Cualquier duda, dime.

Un saludo,
Juanjo
  `.trim());

  const mailtoUrl = `mailto:${clientEmail}?subject=${subject}&body=${body}`;

  window.location.href = mailtoUrl;
}
