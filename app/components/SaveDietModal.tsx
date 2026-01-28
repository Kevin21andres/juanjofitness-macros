"use client";

import { useState } from "react";
import { DietDetail } from "@/lib/dietsApi";
import { generateDietPdf } from "@/lib/pdf/generateDietPdf";

type Props = {
  clientName: string;
  diet: DietDetail; // dieta completa
  onClose: () => void;
};

export default function SaveDietModal({
  clientName,
  diet,
  onClose,
}: Props) {
  const [generating, setGenerating] = useState(false);

  const handlePdf = async () => {
    if (generating) return;

    try {
      setGenerating(true);
      // ⏳ pequeña pausa para que se vea el estado visual
      await new Promise((r) => setTimeout(r, 300));
      generateDietPdf(diet, clientName);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Dieta guardada"
    >
      <div className="bg-[#111] rounded-2xl p-6 w-full max-w-md space-y-5 shadow-xl border border-white/10">

        {/* HEADER */}
        <h2 className="text-xl font-semibold text-white">
          ✅ Dieta guardada correctamente
        </h2>

        <p className="text-sm text-white/70">
          La dieta se ha guardado para
          <br />
          <span className="text-white font-medium">
            {clientName}
          </span>
        </p>

        {/* ACTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* PDF */}
          <button
            onClick={handlePdf}
            disabled={generating}
            aria-label="Descargar PDF"
            className={`
              border border-white/20 rounded-lg py-2 text-sm text-white
              transition focus:outline-none focus:ring-2 focus:ring-white/30
              ${
                generating
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-white/5"
              }
            `}
          >
            {generating ? "⏳ Generando…" : "📄 Descargar PDF"}
          </button>

          {/* EMAIL (futuro) */}
          <button
            disabled
            title="Próximamente"
            className="border border-white/10 rounded-lg py-2 text-sm text-white/40 cursor-not-allowed"
          >
            📧 Email
          </button>

          {/* WHATSAPP (futuro) */}
          <button
            disabled
            title="Próximamente"
            className="border border-white/10 rounded-lg py-2 text-sm text-white/40 cursor-not-allowed"
          >
            📲 WhatsApp
          </button>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end items-center pt-3 border-t border-white/10">
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-sm text-white/60 hover:text-white transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
