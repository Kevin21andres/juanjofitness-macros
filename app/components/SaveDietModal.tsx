// app/components/SaveDietModal.tsx
"use client";

import { useState } from "react";
import { DietDetail } from "@/lib/dietsApi";
import { useRouter } from "next/navigation";
import {
  createDietShare,
  shareDietByWhatsApp,
  shareDietByEmail,
} from "@/lib/dietsShare";

type Props = {
  clientName: string;
  diet: DietDetail;
  clientEmail?: string | null;
  clientPhone?: string | null;
  onClose: () => void;
};

export default function SaveDietModal({
  clientName,
  diet,
  clientEmail,
  clientPhone,
  onClose,
}: Props) {
  const router = useRouter();
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [sharingWhatsapp, setSharingWhatsapp] = useState(false);
  const [sharingEmail, setSharingEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* =========================
    PDF (MÓVIL COMPATIBLE)
  ========================= */
  const handlePdf = async () => {
    if (generatingPdf) return;

    try {
      setError(null);
      setGeneratingPdf(true);

      // 1️⃣ Abrimos ventana inmediatamente (gesto usuario válido para Safari)
      const newWindow = window.open("", "_blank");

      const { token } = await createDietShare({
        dietId: diet.id,
        channel: "email",
        sentTo: clientName,
      });

      // 2️⃣ Redirigimos la ventana abierta
      if (newWindow) {
        newWindow.location.href = `/api/diets/shared/${token}/pdf`;
      } else {
        // Fallback por si el navegador bloquea popups
        window.location.href = `/api/diets/shared/${token}/pdf`;
      }
    } catch (e) {
      console.error(e);
      setError("Error generando el PDF");
    } finally {
      setGeneratingPdf(false);
    }
  };

  /* =========================
    WHATSAPP
  ========================= */
  const handleWhatsapp = async () => {
    if (!clientPhone) {
      setError("El cliente no tiene teléfono");
      return;
    }

    try {
      setError(null);
      setSharingWhatsapp(true);

      const { token } = await createDietShare({
        dietId: diet.id,
        channel: "whatsapp",
        sentTo: clientPhone,
      });

      await shareDietByWhatsApp({
        clientName,
        clientPhone,
        shareToken: token,
      });
    } catch (e) {
      console.error(e);
      setError("Error enviando la dieta por WhatsApp");
    } finally {
      setSharingWhatsapp(false);
    }
  };

  /* =========================
    EMAIL
  ========================= */
  const handleEmail = async () => {
    if (!clientEmail) {
      setError("El cliente no tiene email");
      return;
    }

    try {
      setError(null);
      setSharingEmail(true);

      const { token } = await createDietShare({
        dietId: diet.id,
        channel: "email",
        sentTo: clientEmail,
      });

      await shareDietByEmail({
        clientName,
        clientEmail,
        shareToken: token,
      });
    } catch (e) {
      console.error(e);
      setError("Error enviando la dieta por email");
    } finally {
      setSharingEmail(false);
    }
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#111] rounded-2xl p-6 w-full max-w-md space-y-5 border border-white/10">

        <h2 className="text-xl font-semibold text-white">
          ✅ Dieta guardada correctamente
        </h2>

        <p className="text-sm text-white/70">
          {clientName}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handlePdf}
            disabled={generatingPdf}
            className="bg-white/10 hover:bg-white/20 transition rounded-lg py-2 text-white"
          >
            {generatingPdf ? "⏳ PDF…" : "📄 PDF"}
          </button>

          <button
            onClick={handleEmail}
            disabled={!clientEmail || sharingEmail}
            className="bg-white/10 hover:bg-white/20 transition rounded-lg py-2 text-white disabled:opacity-40"
          >
            {sharingEmail ? "⏳ Email…" : "📧 Email"}
          </button>

          <button
            onClick={handleWhatsapp}
            disabled={!clientPhone || sharingWhatsapp}
            className="bg-white/10 hover:bg-white/20 transition rounded-lg py-2 text-white disabled:opacity-40"
          >
            {sharingWhatsapp ? "⏳ WhatsApp…" : "📲 WhatsApp"}
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <button
          onClick={() => {
            onClose();
            router.push("/clients");
          }}
          className="w-full mt-3 bg-[var(--color-accent)] hover:opacity-90 transition rounded-lg py-2 text-black font-medium"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}