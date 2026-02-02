"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DietDetail } from "@/lib/dietsApi";

type Totals = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export function generateDietPdf(
  diet: DietDetail,
  clientName: string
) {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  /* =========================
     🎨 COLORES CORPORATIVOS
  ========================= */
  const ACCENT: [number, number, number] = [30, 144, 255]; // #1e90ff
  const DARK: [number, number, number] = [15, 15, 15];
  const MUTED: [number, number, number] = [120, 130, 150];
  const CARD_BG: [number, number, number] = [245, 247, 250];

  let y = 20;

  /* =========================
     🔵 PORTADA / HERO
  ========================= */
  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, pageWidth, 50, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("PLAN NUTRICIONAL", 20, 24);

  doc.setFontSize(15);
  doc.text(clientName, 20, 34);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    diet.name,
    20,
    42
  );

  doc.text(
    `Fecha: ${new Date().toLocaleDateString()}`,
    pageWidth - 20,
    42,
    { align: "right" }
  );

  y = 65;

  /* =========================
     🔢 CÁLCULO TOTALES
  ========================= */
  const totals: Totals = diet.meals.reduce(
    (acc, meal) => {
      meal.items.forEach((item) => {
        const factor = item.grams / 100;
        const f = item.food;
        acc.kcal += f.kcal_100 * factor;
        acc.protein += f.protein_100 * factor;
        acc.carbs += f.carbs_100 * factor;
        acc.fat += f.fat_100 * factor;
      });
      return acc;
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  /* =========================
     📊 RESUMEN DIARIO
  ========================= */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...DARK);
  doc.text("Resumen diario", 14, y);
  y += 6;

  doc.setFillColor(...CARD_BG);
  doc.roundedRect(14, y, pageWidth - 28, 36, 10, 10, "F");

  const cols = [22, 70, 118, 160];
  const labels = ["Energía", "Proteína", "Carbohidratos", "Grasas"];
  const values = [
    `${totals.kcal.toFixed(0)} kcal`,
    `${totals.protein.toFixed(1)} g`,
    `${totals.carbs.toFixed(1)} g`,
    `${totals.fat.toFixed(1)} g`,
  ];

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  labels.forEach((label, i) => {
    doc.setTextColor(...MUTED);
    doc.text(label, cols[i], y + 14);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...ACCENT);
    doc.text(values[i], cols[i], y + 24);
  });

  y += 50;

  /* =========================
     🍽️ COMIDAS
  ========================= */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...DARK);
  doc.text("Distribución de comidas", 14, y);
  y += 6;

  diet.meals
    .sort((a, b) => a.meal_index - b.meal_index)
    .forEach((meal, index) => {
      autoTable(doc, {
        startY: y,
        theme: "plain",
        styles: {
          fontSize: 10,
          textColor: DARK,
          cellPadding: 6,
        },
        head: [[`🍽️ Comida ${index + 1}`, "Cantidad"]],
        body: meal.items.map((item) => [
          item.food.name,
          `${item.grams} g`,
        ]),
        headStyles: {
          fillColor: CARD_BG,
          textColor: ACCENT,
          fontStyle: "bold",
        },
        margin: { left: 14, right: 14 },
      });

      const last = (doc as any).lastAutoTable;
      y = last ? last.finalY + 10 : y + 10;

      if (y > pageHeight - 50) {
        doc.addPage();
        y = 20;
      }
    });

  /* =========================
     📝 NOTAS
  ========================= */
  if (diet.notes?.trim()) {
    if (y + 50 > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...DARK);
    doc.text("Notas y recomendaciones", 14, y);
    y += 6;

    doc.setFillColor(...CARD_BG);
    doc.roundedRect(14, y, pageWidth - 28, 12, 8, 8, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...DARK);

    const text = doc.splitTextToSize(
      diet.notes,
      pageWidth - 36
    );
    doc.text(text, 18, y + 10);

    y += text.length * 6 + 16;
  }

  /* =========================
     FOOTER
  ========================= */
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(
      "Plan nutricional generado con JuanjoFitness",
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }

  /* =========================
     DESCARGA
  ========================= */
  const today = new Date().toISOString().slice(0, 10);
  doc.save(
    `Dieta_${clientName.replace(/\s+/g, "_")}_${today}.pdf`
  );
}
