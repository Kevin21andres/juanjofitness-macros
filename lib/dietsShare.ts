// lib/dietsShare.ts
/* =========================
   COMPARTIR DIETAS (TOKEN)
========================= */

import { supabase } from "./supabaseClient";

/* =========================
   TIPOS
========================= */

type CreateDietShareParams = {
  dietId: string;
  channel: "whatsapp" | "email";
  sentTo: string;
};

type ShareByWhatsappParams = {
  clientName: string;
  clientPhone: string;
  shareToken: string;
};

type ShareByEmailParams = {
  clientName: string;
  clientEmail: string;
  shareToken: string;
};

/* =========================
   URL BASE
========================= */

function getBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // Para SSR / Vercel
  return process.env.NEXT_PUBLIC_SITE_URL ?? "";
}

/* =========================
   URL PÚBLICA (TOKEN)
========================= */

export function getDietShareUrl(token: string) {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/share/diet/${token}`;
}

/* =========================
   CREAR / REUTILIZAR SHARE
   → La generación, validación,
     reutilización y expiración
     se gestionan en Supabase.
========================= */

export async function createDietShare({
  dietId,
  channel,
  sentTo,
}: CreateDietShareParams): Promise<{ token: string }> {
  const { data, error } = await supabase.rpc("create_diet_share", {
    p_diet_id: dietId,
    p_channel: channel,
    p_sent_to: sentTo,
  });

  if (error) {
  console.error("❌ Error creando diet_share:", {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint,
  });

  throw new Error(
    `No se pudo crear el enlace de la dieta: ${error.message}`
  );
}

  if (typeof data !== "string" || data.trim().length === 0) {
    throw new Error("No se recibió un token válido.");
  }

  return {
    token: data,
  };
}

/* =========================
   WHATSAPP
========================= */

export async function shareDietByWhatsApp({
  clientName,
  clientPhone,
  shareToken,
}: ShareByWhatsappParams) {
  if (!clientPhone) {
    throw new Error("El cliente no tiene teléfono");
  }

  const url = getDietShareUrl(shareToken);

  const message = `
Hola ${clientName}
Te dejo tu plan nutricional.
${url}
Cualquier duda me dices
  `.trim();

  const phone = clientPhone.replace(/\s+/g, "");
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;

  window.location.href = whatsappUrl;
}

/* =========================
   EMAIL
========================= */

export async function shareDietByEmail({
  clientName,
  clientEmail,
  shareToken,
}: ShareByEmailParams) {
  if (!clientEmail) {
    throw new Error("El cliente no tiene email");
  }

  const url = getDietShareUrl(shareToken);

  const subject = encodeURIComponent("Tu plan nutricional");

  const body = encodeURIComponent(`
Hola ${clientName},

Te envío tu plan nutricional.

Puedes consultarlo aquí:
${url}

Cualquier duda, dime.

Un saludo,
Juanjo
  `.trim());

  window.location.href = `mailto:${clientEmail}?subject=${subject}&body=${body}`;
}
