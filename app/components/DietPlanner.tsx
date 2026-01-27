"use client";

import { useState } from "react";
import FoodCalculator from "./FoodCalculator";

type Totals = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export default function DietPlanner() {
  const [mealsCount, setMealsCount] = useState(4);
  const [mealsTotals, setMealsTotals] = useState<Record<number, Totals>>({});

  const totalDay = Object.values(mealsTotals).reduce(
    (acc, t) => ({
      kcal: acc.kcal + t.kcal,
      protein: acc.protein + t.protein,
      carbs: acc.carbs + t.carbs,
      fat: acc.fat + t.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <div className="space-y-6">

      {/* Selector nº comidas */}
      <section className="card">
        <label className="text-sm text-white/70">
          Número de comidas diarias
        </label>
        <select
          className="input mt-2"
          value={mealsCount}
          onChange={(e) => {
            setMealsCount(Number(e.target.value));
            setMealsTotals({});
          }}
        >
          {[3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>
              {n} comidas
            </option>
          ))}
        </select>
      </section>

      {/* Comidas */}
      {Array.from({ length: mealsCount }).map((_, i) => (
        <FoodCalculator
          key={i}
          title={`Comida ${i + 1}`}
          onTotalsChange={(totals) =>
            setMealsTotals((prev) => ({
              ...prev,
              [i]: totals,
            }))
          }
        />
      ))}

      {/* Total diario */}
      <section className="card">
        <h3 className="text-white font-medium mb-2">
          Total diario
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <p className="text-white">Kcal: {totalDay.kcal.toFixed(0)}</p>
          <p className="text-white">
            Proteína: {totalDay.protein.toFixed(1)} g
          </p>
          <p className="text-white">
            Carbs: {totalDay.carbs.toFixed(1)} g
          </p>
          <p className="text-white">
            Grasas: {totalDay.fat.toFixed(1)} g
          </p>
        </div>
      </section>

    </div>
  );
}
