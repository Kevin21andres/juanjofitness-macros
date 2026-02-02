"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
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
    <div className="min-h-screen bg-gradient-to-br from-[#0B0B0B] via-[#0E1622] to-[#0B0B0B] px-6 py-10 space-y-10">

      {/* HEADER / HERO */}
      <header className="space-y-2">
        <Link
          href={`/clients/${clientId}`}
          className="text-sm text-[var(--color-accent)] hover:underline"
        >
          ← Volver al cliente
        </Link>

        <h1 className="text-3xl font-semibold text-white tracking-tight">
          {diet.name}
        </h1>

        <p className="text-sm text-white/50">
          Creada el {new Date(diet.created_at).toLocaleDateString()}
        </p>
      </header>

      {/* RESUMEN GLOBAL */}
      <section className="rounded-2xl border border-white/10 bg-[#111]/70 backdrop-blur-xl shadow-xl p-6 space-y-6">

        <h2 className="text-white font-medium text-lg">
          📊 Resumen diario
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="grid grid-cols-2 gap-3 text-sm text-white/80">
            <p>🔥 {diet.totals.kcal} kcal</p>
            <p>🥩 {diet.totals.protein} g proteína</p>
            <p>🍚 {diet.totals.carbs} g hidratos</p>
            <p>🥑 {diet.totals.fat} g grasas</p>
          </div>

          <div className="flex justify-center">
            <MacroDonut
              protein={diet.totals.protein}
              carbs={diet.totals.carbs}
              fat={diet.totals.fat}
              kcal={diet.totals.kcal}
            />
          </div>
        </div>
      </section>

      {/* 📝 NOTAS */}
      {diet.notes && diet.notes.trim().length > 0 && (
        <section className="rounded-2xl border border-white/10 bg-[#111]/70 backdrop-blur-xl shadow-xl p-6 space-y-2">
          <h3 className="text-white font-medium text-lg">
            📝 Notas y recomendaciones
          </h3>

          <p className="text-sm text-white/80 whitespace-pre-line">
            {diet.notes}
          </p>
        </section>
      )}

      {/* 🍽️ COMIDAS */}
      <section className="space-y-4">
        <h2 className="text-white font-medium text-lg">
          🍽️ Distribución por comidas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                <div
                  key={meal.id}
                  className="rounded-2xl border border-white/10 bg-[#111]/70 backdrop-blur-xl shadow-xl p-5 space-y-3"
                >
                  <h3 className="text-white font-medium">
                    🍽️ Comida {meal.meal_index + 1}
                  </h3>

                  <ul className="text-sm text-white/80 space-y-1">
                    {meal.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex justify-between gap-3"
                      >
                        <span>{item.food.name}</span>
                        <span className="text-white/50">
                          {item.grams} g
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="grid grid-cols-2 gap-2 text-xs text-white/60 pt-2 border-t border-white/10">
                    <p>🔥 {mealTotals.kcal.toFixed(0)} kcal</p>
                    <p>🥩 {mealTotals.protein.toFixed(1)} g</p>
                    <p>🍚 {mealTotals.carbs.toFixed(1)} g</p>
                    <p>🥑 {mealTotals.fat.toFixed(1)} g</p>
                  </div>
                </div>
              );
            })}
        </div>
      </section>
    </div>
  );
}
