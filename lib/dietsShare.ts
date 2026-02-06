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

  // para SSR / Vercel
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
========================= */

export async function createDietShare({
  dietId,
  channel,
  sentTo,
}: CreateDietShareParams) {
  const now = new Date().toISOString();

  const { data: existing, error: selectError } = await supabase
    .from("diet_shares")
    .select("token")
    .eq("diet_id", dietId)
    .eq("channel", channel)
    .eq("sent_to", sentTo)
    .eq("is_active", true)
    .gt("expires_at", now)
    .maybeSingle();

  if (selectError) {
    console.error("❌ Error buscando diet_share existente:", selectError);
  }

  if (existing?.token) {
    console.log("♻️ Reutilizando token existente:", existing.token);
    return { token: existing.token };
  }

  const token =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 15);

  const expiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 días
  ).toISOString();

  const { error: insertError } = await supabase
    .from("diet_shares")
    .insert({
      diet_id: dietId,
      token,
      channel,
      sent_to: sentTo,
      is_active: true,
      expires_at: expiresAt,
    });

  if (insertError) {
    console.error("❌ Error insertando diet_share:", insertError);
    throw insertError;
  }

  console.log("✅ Nuevo diet_share creado:", token);

  return { token };
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

  const subject = encodeURIComponent(
    "Tu plan nutricional"
  );

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
