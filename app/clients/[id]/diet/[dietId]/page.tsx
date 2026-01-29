"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { use } from "react";
import { getDietDetail, DietDetail } from "@/lib/dietsApi";
import MacroDonut from "@/app/components/MacroDonut";

type Totals = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export default function DietDetailPage({
  params,
}: {
  params: Promise<{ id: string; dietId: string }>;
}) {
  const { id: clientId, dietId } = use(params);

  const [diet, setDiet] = useState<DietDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dietId) return;

    getDietDetail(dietId)
      .then(setDiet)
      .finally(() => setLoading(false));
  }, [dietId]);

  if (loading) {
    return <p className="text-white p-6">Cargando dieta…</p>;
  }

  if (!diet) {
    return <p className="text-white p-6">Dieta no encontrada</p>;
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] p-6 space-y-8">

      {/* HEADER */}
      <header>
        <Link
          href={`/clients/${clientId}`}
          className="text-sm text-[var(--color-accent)]"
        >
          ← Volver al cliente
        </Link>

        <h1 className="text-2xl font-semibold text-white mt-2">
          {diet.name}
        </h1>

        <p className="text-sm text-white/60">
          {new Date(diet.created_at).toLocaleDateString()}
        </p>
      </header>

      {/* =========================
          🍽️ COMIDAS
      ========================= */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {diet.meals
          .sort((a, b) => a.meal_index - b.meal_index)
          .map((meal) => {
            const mealTotals: Totals = meal.items.reduce(
              (acc, item) => {
                const factor = item.grams / 100;
                const f = item.food;

                acc.kcal += f.kcal_100 * factor;
                acc.protein += f.protein_100 * factor;
                acc.carbs += f.carbs_100 * factor;
                acc.fat += f.fat_100 * factor;

                return acc;
              },
              { kcal: 0, protein: 0, carbs: 0, fat: 0 }
            );

            return (
              <section key={meal.id} className="card space-y-3">
                <h3 className="text-white font-medium">
                  🍽️ Comida {meal.meal_index + 1}
                </h3>

                <ul className="text-sm text-white/80 space-y-1">
                  {meal.items.map((item) => (
                    <li key={item.id}>
                      {item.food.name} — {item.grams} g
                    </li>
                  ))}
                </ul>

                <div className="grid grid-cols-2 gap-2 text-xs text-white/70 pt-2 border-t border-white/10">
                  <p>🔥 {mealTotals.kcal.toFixed(0)} kcal</p>
                  <p>🥩 {mealTotals.protein.toFixed(1)} g</p>
                  <p>🍚 {mealTotals.carbs.toFixed(1)} g</p>
                  <p>🥑 {mealTotals.fat.toFixed(1)} g</p>
                </div>
              </section>
            );
          })}
      </section>

      {/* =========================
          📊 RESUMEN VISUAL
      ========================= */}
      <section className="card space-y-4">
        <h3 className="text-white font-medium text-lg">
          Distribución de macronutrientes
        </h3>

        <div className="flex justify-center">
          <MacroDonut
            protein={diet.totals.protein}
            carbs={diet.totals.carbs}
            fat={diet.totals.fat}
            kcal={diet.totals.kcal}
          />
        </div>
      </section>

      {/* =========================
          TOTAL DIARIO
      ========================= */}
      <section className="card">
        <h3 className="text-white font-medium mb-3">
          Total diario
        </h3>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <p>🔥 {diet.totals.kcal} kcal</p>
          <p>🥩 {diet.totals.protein} g</p>
          <p>🍚 {diet.totals.carbs} g</p>
          <p>🥑 {diet.totals.fat} g</p>
        </div>
      </section>
    </div>
  );
}
