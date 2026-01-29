"use client";

import { useState } from "react";
import { DietDetail } from "@/lib/dietsApi";
import { useRouter } from "next/navigation";
import { generateDietPdf } from "@/lib/pdf/generateDietPdf";
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
     DESCARGA PDF LOCAL
  ========================= */
  const handlePdf = async () => {
    if (generatingPdf) return;

    try {
      setGeneratingPdf(true);
      await new Promise((r) => setTimeout(r, 300));
      generateDietPdf(diet, clientName);
    } finally {
      setGeneratingPdf(false);
    }
  };

  /* =========================
     WHATSAPP (TOKEN)
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
     EMAIL (TOKEN)
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#111] rounded-2xl p-6 w-full max-w-md space-y-5 shadow-xl border border-white/10">

        {/* HEADER */}
        <h2 className="text-xl font-semibold text-white">
          ✅ Dieta guardada correctamente
        </h2>

        <p className="text-sm text-white/70">
          La dieta se ha guardado para<br />
          <span className="text-white font-medium">{clientName}</span>
        </p>

        {/* ACTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">

          {/* PDF */}
          <button
            onClick={handlePdf}
            disabled={generatingPdf}
            className={`
              border border-white/20 rounded-lg py-2 text-sm text-white
              transition
              ${generatingPdf ? "opacity-50 cursor-not-allowed" : "hover:bg-white/5"}
            `}
          >
            {generatingPdf ? "⏳ Generando…" : "📄 Descargar PDF"}
          </button>

          {/* EMAIL */}
          <button
            onClick={handleEmail}
            disabled={!clientEmail || sharingEmail}
            className={`
              border border-white/20 rounded-lg py-2 text-sm text-white
              transition
              ${
                !clientEmail || sharingEmail
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:bg-white/5"
              }
            `}
          >
            {sharingEmail ? "⏳ Enviando…" : "📧 Email"}
          </button>

          {/* WHATSAPP */}
          <button
            onClick={handleWhatsapp}
            disabled={!clientPhone || sharingWhatsapp}
            className={`
              border border-white/20 rounded-lg py-2 text-sm text-white
              transition
              ${
                !clientPhone || sharingWhatsapp
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:bg-white/5"
              }
            `}
          >
            {sharingWhatsapp ? "⏳ Enviando…" : "📲 WhatsApp"}
          </button>

        </div>

        {/* ERROR */}
        {error && (
          <p className="text-sm text-red-400 pt-1">{error}</p>
        )}

        {/* FOOTER */}
        <div className="flex justify-end pt-3 border-t border-white/10">
          <button
            onClick={() => {
              onClose();
            router.push('/clients');}}
            
            className="text-sm text-white/60 hover:text-white transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
