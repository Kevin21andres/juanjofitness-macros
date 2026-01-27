"use client";

import { useCallback, useEffect, useState } from "react";
import FoodCalculator, { Item } from "./FoodCalculator";
import { getFoods, Food } from "@/lib/foodsApi";

type Totals = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export default function DietPlanner() {
  const [mealsCount, setMealsCount] = useState<number>(4);
  const [mealsItems, setMealsItems] = useState<Record<number, Item[]>>({});
  const [foods, setFoods] = useState<Food[]>([]);
  const [loadingFoods, setLoadingFoods] = useState(true);

  // 🔹 cargar alimentos UNA vez
  useEffect(() => {
    const loadFoods = async () => {
      const data = await getFoods();
      setFoods(data);
      setLoadingFoods(false);
    };

    loadFoods();
  }, []);

  // 🔒 callback estable
  const handleMealChange = useCallback(
    (mealIndex: number, items: Item[]) => {
      setMealsItems((prev) => ({
        ...prev,
        [mealIndex]: items,
      }));
    },
    []
  );

  // 🔹 calcular total diario
  const totalDay: Totals = Object.values(mealsItems).reduce(
    (acc, items) => {
      items.forEach((item) => {
        const food = foods.find((f) => f.id === item.foodId);
        if (!food) return;

        const factor = item.grams / 100;
        acc.kcal += food.kcal_100 * factor;
        acc.protein += food.protein_100 * factor;
        acc.carbs += food.carbs_100 * factor;
        acc.fat += food.fat_100 * factor;
      });

      return acc;
    },
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
      {!loadingFoods &&
        Array.from({ length: mealsCount }).map((_, i) => (
          <FoodCalculator
            key={i}
            title={`Comida ${i + 1}`}
            foods={foods}
            onChange={(items) => handleMealChange(i, items)}
          />
        ))}

      {/* TOTAL DIARIO */}
      <section className="card">
        <h3 className="text-white font-medium mb-3">
          Total diario
        </h3>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <p className="text-white">🔥 Kcal: {totalDay.kcal.toFixed(0)}</p>
          <p className="text-white">
            🥩 Proteína: {totalDay.protein.toFixed(1)} g
          </p>
          <p className="text-white">
            🍚 Carbs: {totalDay.carbs.toFixed(1)} g
          </p>
          <p className="text-white">
            🥑 Grasas: {totalDay.fat.toFixed(1)} g
          </p>
        </div>
      </section>

    </div>
  );
}
