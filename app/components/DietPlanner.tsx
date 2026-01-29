"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import FoodCalculator, { Item } from "./FoodCalculator";
import { getFoods, Food } from "@/lib/foodsApi";
import { createDietVersion } from "@/lib/dietsApi";
import { createMeal } from "@/lib/dietMealsApi";
import { createDietItem } from "@/lib/dietItemsApi";

type Totals = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

type Props = {
  clientId: string;
  clientName: string;
  onSaved?: (dietId: string) => void;
};

function generateDietName(clientName: string) {
  const today = new Date().toISOString().slice(0, 10);
  return `${clientName} - ${today}`;
}

export default function DietPlanner({
  clientId,
  clientName,
  onSaved,
}: Props) {
  const [mealsCount, setMealsCount] = useState(5);
  const [mealsItems, setMealsItems] =
    useState<Record<number, Item[]>>({});
  const [foods, setFoods] = useState<Food[]>([]);
  const [loadingFoods, setLoadingFoods] = useState(true);
  const [saving, setSaving] = useState(false);

  /* =============================
     CARGAR ALIMENTOS
  ============================== */
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await getFoods();
        if (mounted) {
          setFoods(data);
          setLoadingFoods(false);
        }
      } catch (e) {
        console.error(e);
        if (mounted) {
          setLoadingFoods(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  /* =============================
     CALLBACK COMIDAS
  ============================== */
  const handleMealChange = useCallback(
    (mealIndex: number, items: Item[]) => {
      setMealsItems((prev) => ({
        ...prev,
        [mealIndex]: items,
      }));
    },
    []
  );

  /* =============================
     TOTAL DIARIO (MEMO)
  ============================== */
  const totalDay: Totals = useMemo(() => {
    return Object.values(mealsItems).reduce(
      (acc, items) => {
        items.forEach((item) => {
          if (item.grams <= 0) return;

          const food = foods.find(
            (f) => f.id === item.foodId
          );
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
  }, [mealsItems, foods]);

  /* =============================
     GUARDAR DIETA
  ============================== */
  const saveDiet = async () => {
    if (!clientId || saving) return;

    // 🛑 No guardar dietas vacías
    const hasAnyFood = Object.values(mealsItems).some(
      (items) => items.some((i) => i.grams > 0)
    );
    if (!hasAnyFood) {
      alert("Añade al menos un alimento antes de guardar la dieta");
      return;
    }

    try {
      setSaving(true);

      const diet = await createDietVersion({
        clientId,
        name: generateDietName(clientName),
        mealsCount,
      });

      for (let i = 0; i < mealsCount; i++) {
        const meal = await createMeal(diet.id, i);
        const items = mealsItems[i] || [];

        for (const item of items) {
          if (item.grams <= 0) continue;
          await createDietItem(
            meal.id,
            item.foodId,
            item.grams
          );
        }
      }

      onSaved?.(diet.id);
    } catch (e) {
      console.error(e);
      alert("Error al guardar la dieta");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Nº comidas */}
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
          {[3, 4, 5, 6, 7, 8].map((n) => (
            <option key={n} value={n}>
              {n} comidas
            </option>
          ))}
        </select>
      </section>

      {/* Comidas */}
      {!loadingFoods && (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: mealsCount }).map((_, i) => (
            <FoodCalculator
              key={i}
              title={`Comida ${i + 1}`}
              foods={foods}
              onChange={(items) =>
                handleMealChange(i, items)
              }
            />
          ))}
        </section>
      )}

      {/* Total */}
      <section className="card">
        <h3 className="text-white font-medium mb-3">
          Total diario
        </h3>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <p>🔥 {totalDay.kcal.toFixed(0)} kcal</p>
          <p>🥩 {totalDay.protein.toFixed(1)} g</p>
          <p>🍚 {totalDay.carbs.toFixed(1)} g</p>
          <p>🥑 {totalDay.fat.toFixed(1)} g</p>
        </div>
      </section>

      {/* Guardar */}
      <button
        type="button"
        onClick={saveDiet}
        disabled={saving}
        className="bg-[var(--color-accent)] px-6 py-3 rounded-lg text-white font-medium disabled:opacity-50"
      >
        {saving ? "Guardando dieta…" : "Guardar dieta"}
      </button>
    </div>
  );
}
