"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DietDetail } from "@/lib/dietsApi";

export function generateDietPdf(
  diet: DietDetail,
  clientName: string
) {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  /* =========================
     🎨 COLORES
  ========================= */
const MUTED: [number, number, number] = [100, 116, 139];
const DARK: [number, number, number] = [30, 30, 30];
const BLUE: [number, number, number] = [37, 99, 235];
const BG: [number, number, number] = [245, 247, 250];


  /* =========================
     🧾 PORTADA LIMPIA
  ========================= */

  // Fondo azul superior
  doc.setFillColor(BLUE[0], BLUE[1], BLUE[2]);
  doc.rect(0, 0, pageWidth, 70, "F");

  // Título
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.text("PLAN NUTRICIONAL", pageWidth / 2, 35, { align: "center" });

  // Nombre cliente
  doc.setFontSize(18);
  doc.text(clientName, pageWidth / 2, 48, { align: "center" });

  // Fecha actual
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(
    `Fecha: ${new Date().toLocaleDateString()}`,
    pageWidth / 2,
    60,
    { align: "center" }
  );

  /* =========================
     👉 CONTENIDO
  ========================= */
  doc.addPage();
  let y = 20;

  /* =========================
     🔢 TOTALES
  ========================= */
  const totals = diet.meals.reduce(
    (acc, meal) => {
      meal.items.forEach((item) => {
        const f = item.food;
        const factor = item.grams / 100;
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
  doc.setFillColor(BG[0], BG[1], BG[2]);
  doc.roundedRect(14, y, pageWidth - 28, 34, 8, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(DARK[0], DARK[1], DARK[2]);
  doc.text("Resumen diario", 20, y + 12);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  const cols = [22, 65, 108, 150];
  const labels = ["Kcal", "Proteína", "Carbohidratos", "Grasas"];
  const values = [
    totals.kcal.toFixed(0),
    `${totals.protein.toFixed(1)} g`,
    `${totals.carbs.toFixed(1)} g`,
    `${totals.fat.toFixed(1)} g`,
  ];

  labels.forEach((label, i) => {
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.text(label, cols[i], y + 22);

    doc.setTextColor(DARK[0], DARK[1], DARK[2]);
    doc.setFont("helvetica", "bold");
    doc.text(values[i], cols[i], y + 30);
  });

  y += 50;

  /* =========================
     🍽️ COMIDAS
  ========================= */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(DARK[0], DARK[1], DARK[2]);
  doc.text("Distribución de comidas", 14, y);
  y += 8;

  diet.meals
    .sort((a, b) => a.meal_index - b.meal_index)
    .forEach((meal, index) => {
      autoTable(doc, {
        startY: y,
        theme: "plain",
        styles: {
          fontSize: 10,
          textColor: DARK,
          cellPadding: 5,
        },
        head: [[`Comida ${index + 1}`, "Cantidad (g)"]],
        body: meal.items.map((item) => [
          item.food.name,
          item.grams.toString(),
        ]),
        headStyles: {
          fillColor: BG,
          textColor: DARK,
          fontStyle: "bold",
        },
        margin: { left: 14, right: 14 },
      });

      y = (doc as any).lastAutoTable.finalY + 10;
    });

  /* =========================
     FOOTER
  ========================= */
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.text(
      "Plan nutricional generado automáticamente",
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }

  /* =========================
     📥 DESCARGA
  ========================= */
  const today = new Date().toISOString().slice(0, 10);

  doc.save(
    `Dieta_${clientName.replace(/\s+/g, "_")}_${today}.pdf`
  );
}
