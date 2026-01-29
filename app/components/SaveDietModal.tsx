"use client";

import { useState } from "react";
import { DietDetail } from "@/lib/dietsApi";
import { generateDietPdf } from "@/lib/pdf/generateDietPdf";
import {
  shareDietByWhatsApp,
  shareDietByEmail,
  getDietShareUrl,
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
  const [generating, setGenerating] = useState(false);

  /* =========================
     DESCARGA PDF LOCAL
  ========================= */
  const handlePdf = async () => {
    if (generating) return;

    try {
      setGenerating(true);
      await new Promise((r) => setTimeout(r, 300));
      generateDietPdf(diet, clientName);
    } finally {
      setGenerating(false);
    }
  };

  /* =========================
     WHATSAPP
  ========================= */
  const handleWhatsapp = () => {
    try {
      shareDietByWhatsApp({
        clientName,
        dietId: diet.id,
        clientPhone,
      });
    } catch (e) {
      alert("El cliente no tiene teléfono");
    }
  };

  /* =========================
     EMAIL
  ========================= */
  const handleEmail = () => {
    try {
      shareDietByEmail({
        clientName,
        dietId: diet.id,
        clientEmail,
      });
    } catch (e) {
      alert("El cliente no tiene email");
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
            disabled={generating}
            className={`
              border border-white/20 rounded-lg py-2 text-sm text-white
              transition
              ${generating ? "opacity-50 cursor-not-allowed" : "hover:bg-white/5"}
            `}
          >
            {generating ? "⏳ Generando…" : "📄 Descargar PDF"}
          </button>

          {/* EMAIL */}
          <button
            onClick={handleEmail}
            disabled={!clientEmail}
            className={`
              border border-white/20 rounded-lg py-2 text-sm text-white
              transition
              ${!clientEmail ? "opacity-40 cursor-not-allowed" : "hover:bg-white/5"}
            `}
          >
            📧 Email
          </button>

          {/* WHATSAPP */}
          <button
            onClick={handleWhatsapp}
            disabled={!clientPhone}
            className={`
              border border-white/20 rounded-lg py-2 text-sm text-white
              transition
              ${!clientPhone ? "opacity-40 cursor-not-allowed" : "hover:bg-white/5"}
            `}
          >
            📲 WhatsApp
          </button>

        </div>

        {/* FOOTER */}
        <div className="flex justify-end pt-3 border-t border-white/10">
          <button
            onClick={onClose}
            className="text-sm text-white/60 hover:text-white transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
