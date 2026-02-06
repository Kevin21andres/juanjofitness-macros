"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import FoodCalculator, { Item } from "./FoodCalculator";
import { getFoods, Food } from "@/lib/foodsApi";
import { createDietVersion } from "@/lib/dietsApi";
import { createMeal } from "@/lib/dietMealsApi";
import { createDietItem } from "@/lib/dietItemsApi";

/* =========================
   TIPOS
========================= */

type Totals = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type CloneDietData = {
  name: string;
  notes: string | null;
  meals: {
    meal_index: number;
    items: {
      id?: string;
      food_id: string;
      grams: number;
      role: "main" | "substitute";
      parent_item_id: string | null;
    }[];
  }[];
};

type Props = {
  clientId: string;
  clientName: string;
  onSaved?: (dietId: string) => void;
  initialDiet?: CloneDietData | null;
};

/* =========================
   UTILIDAD
========================= */

function generateDietName(clientName: string) {
  const today = new Date().toISOString().slice(0, 10);
  return `${clientName} - ${today}`;
}

/* =========================
   COMPONENTE
========================= */

export default function DietPlanner({
  clientId,
  clientName,
  onSaved,
  initialDiet = null,
}: Props) {
  const [mealsCount, setMealsCount] = useState(5);
  const [mealsItems, setMealsItems] = useState<Record<number, Item[]>>({});
  const [foods, setFoods] = useState<Food[]>([]);
  const [loadingFoods, setLoadingFoods] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");

  /* =============================
     CARGAR ALIMENTOS
  ============================== */
  useEffect(() => {
    let mounted = true;

    getFoods()
      .then((data) => mounted && setFoods(data))
      .finally(() => mounted && setLoadingFoods(false));

    return () => {
      mounted = false;
    };
  }, []);

  /* =============================
     PRECARGAR DIETA (CLON)
     ✅ FIX DEFINITIVO SUSTITUCIONES
  ============================== */
  useEffect(() => {
    if (!initialDiet) return;

    setMealsCount(initialDiet.meals.length);
    setNotes(initialDiet.notes ?? "");

    const initialMeals: Record<number, Item[]> = {};

    initialDiet.meals.forEach((meal) => {
      const idMap = new Map<string, string>();

      // 1️⃣ mapear SOLO ids reales → nuevos ids
      meal.items.forEach((item) => {
        if (item.id) {
          idMap.set(item.id, crypto.randomUUID());
        }
      });

      // 2️⃣ reconstruir items manteniendo relaciones
      initialMeals[meal.meal_index] = meal.items.map((item) => ({
        id: item.id ? idMap.get(item.id)! : crypto.randomUUID(),
        foodId: item.food_id,
        grams: item.grams,
        role: item.role,
        parentItemId: item.parent_item_id
          ? idMap.get(item.parent_item_id)
          : undefined,
      }));
    });

    setMealsItems(initialMeals);
  }, [initialDiet]);

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
     TOTAL DIARIO (solo principales)
  ============================== */
  const totalDay: Totals = useMemo(() => {
    return Object.values(mealsItems).reduce(
      (acc, items) => {
        items.forEach((item) => {
          if (item.role === "substitute") return;
          if (item.grams <= 0) return;

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
  }, [mealsItems, foods]);

  /* =============================
     GUARDAR DIETA
     → principales primero
     → sustituciones con FK real
  ============================== */
  const saveDiet = async () => {
    if (!clientId || saving) return;

    const hasAnyMainFood = Object.values(mealsItems).some((items) =>
      items.some((i) => i.grams > 0 && i.role === "main")
    );

    if (!hasAnyMainFood) {
      alert("Añade al menos un alimento principal antes de guardar la dieta");
      return;
    }

    try {
      setSaving(true);

      const diet = await createDietVersion({
        clientId,
        name: generateDietName(clientName),
        mealsCount,
        notes: notes.trim() || null,
      });

      for (let i = 0; i < mealsCount; i++) {
        const meal = await createMeal(diet.id, i);
        const items = mealsItems[i] ?? [];

        const mainIdMap = new Map<string, string>();

        // 1️⃣ PRINCIPALES
        for (const item of items.filter((i) => i.role === "main")) {
          if (item.grams <= 0) continue;

          const created = await createDietItem(
            meal.id,
            item.foodId,
            item.grams,
            "main",
            null
          );

          mainIdMap.set(item.id, created.id);
        }

        // 2️⃣ SUSTITUCIONES
        for (const item of items.filter((i) => i.role === "substitute")) {
          if (item.grams <= 0) continue;
          if (!item.parentItemId) continue;

          const parentDbId = mainIdMap.get(item.parentItemId);
          if (!parentDbId) continue;

          await createDietItem(
            meal.id,
            item.foodId,
            item.grams,
            "substitute",
            parentDbId
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

  /* =============================
     UI
  ============================== */

  return (
    <div className="space-y-6">
      <section className="card">
        <label className="text-sm text-white/70">
          Número de comidas diarias
        </label>

        <select
          className="input mt-2"
          value={mealsCount}
          onChange={(e) => {
            const n = Number(e.target.value);
            setMealsCount(n);

            setMealsItems((prev) => {
              const next: Record<number, Item[]> = {};
              for (let i = 0; i < n; i++) next[i] = prev[i] ?? [];
              return next;
            });
          }}
        >
          {[3, 4, 5, 6, 7, 8].map((n) => (
            <option key={n} value={n}>
              {n} comidas
            </option>
          ))}
        </select>
      </section>

      <section className="card">
        <label className="text-sm text-white/70">
          Notas y recomendaciones
        </label>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="input mt-2 resize-none"
        />
      </section>

      {!loadingFoods && (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: mealsCount }).map((_, i) => (
            <FoodCalculator
              key={i}
              title={`Comida ${i + 1}`}
              foods={foods}
              initialItems={mealsItems[i] ?? []}
              onChange={(items) => handleMealChange(i, items)}
            />
          ))}
        </section>
      )}

      <section className="card">
        <h3 className="text-white font-medium mb-3">Total diario</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <p>🔥 {totalDay.kcal.toFixed(0)} kcal</p>
          <p>🥩 {totalDay.protein.toFixed(1)} g</p>
          <p>🍚 {totalDay.carbs.toFixed(1)} g</p>
          <p>🥑 {totalDay.fat.toFixed(1)} g</p>
        </div>
      </section>

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
