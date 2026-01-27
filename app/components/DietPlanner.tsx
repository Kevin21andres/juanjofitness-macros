"use client";

import { useCallback, useState } from "react";
import FoodCalculator, { Item } from "./FoodCalculator";

export default function DietPlanner() {
  const [mealsCount, setMealsCount] = useState<number>(4);

  // items por comida (clave = índice de comida)
  const [mealsItems, setMealsItems] = useState<Record<number, Item[]>>({});

  // 🔒 Callback estable para evitar loops
  const handleMealChange = useCallback(
    (mealIndex: number, items: Item[]) => {
      setMealsItems((prev) => ({
        ...prev,
        [mealIndex]: items,
      }));
    },
    []
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
            setMealsItems({});
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
          onChange={(items) => handleMealChange(i, items)}
        />
      ))}

      {/* Total diario (lo calcularemos más adelante) */}
      <section className="card">
        <h3 className="text-white font-medium mb-2">
          Total diario
        </h3>
        <p className="text-sm text-white/50">
          (Se calculará cuando guardemos la dieta)
        </p>
      </section>

    </div>
  );
}
