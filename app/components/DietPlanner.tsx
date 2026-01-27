"use client";

import { useCallback, useEffect, useState } from "react";
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
};

function generateDietName(clientName: string) {
  const today = new Date().toISOString().slice(0, 10);
  return `${clientName} - ${today}`;
}

export default function DietPlanner({
  clientId,
  clientName,
}: Props) {
  const [mealsCount, setMealsCount] = useState<number>(5);
  const [mealsItems, setMealsItems] = useState<Record<number, Item[]>>({});
  const [foods, setFoods] = useState<Food[]>([]);
  const [loadingFoods, setLoadingFoods] = useState(true);
  const [saving, setSaving] = useState(false);

  /* =============================
     CARGAR ALIMENTOS (UNA VEZ)
  ============================== */
  useEffect(() => {
    let mounted = true;

    const loadFoods = async () => {
      try {
        const data = await getFoods();
        if (mounted) {
          setFoods(data);
          setLoadingFoods(false);
        }
      } catch (e) {
        console.error("❌ Error cargando foods:", e);
      }
    };

    loadFoods();
    return () => {
      mounted = false;
    };
  }, []);

  /* =============================
     CALLBACK ESTABLE POR COMIDA
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
     TOTAL DIARIO (DERIVADO)
  ============================== */
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

  /* =============================
     GUARDAR DIETA (BLINDADO)
  ============================== */
  const saveDiet = async () => {
    console.log("🟡 CLICK GUARDAR DIETA");
    console.log("clientId:", clientId);
    console.log("clientName:", clientName);
    console.log("mealsItems:", mealsItems);

    if (!clientId) {
      alert("❌ clientId no existe");
      return;
    }

    if (saving) {
      console.warn("⏳ Ya se está guardando");
      return;
    }

    try {
      setSaving(true);

      // 1️⃣ Crear dieta
      const diet = await createDietVersion({
        clientId,
        name: generateDietName(clientName),
        mealsCount,
      });

      console.log("✅ Dieta creada:", diet);

      // 2️⃣ Crear comidas + alimentos
      for (let i = 0; i < mealsCount; i++) {
        const meal = await createMeal(diet.id, i);
        console.log(`🍽️ Meal ${i} creada:`, meal);

        const items = mealsItems[i] || [];
        for (const item of items) {
          await createDietItem(
            meal.id,
            item.foodId,
            item.grams
          );
        }
      }

      alert("✅ Dieta guardada correctamente");
    } catch (e) {
      console.error("❌ Error guardando dieta:", e);
      alert("Error al guardar la dieta (ver consola)");
    } finally {
      setSaving(false);
    }
  };

  /* =============================
     UI
  ============================== */
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
              onChange={(items) => handleMealChange(i, items)}
            />
          ))}
        </section>
      )}

      {/* Total diario */}
      <section className="card">
        <h3 className="text-white font-medium mb-3">
          Total diario
        </h3>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <p className="text-white">
            🔥 Kcal: {totalDay.kcal.toFixed(0)}
          </p>
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

      {/* Guardar */}
      <button
        onClick={saveDiet}
        disabled={saving}
        className="bg-[var(--color-accent)] px-6 py-3 rounded-lg text-white font-medium disabled:opacity-50"
      >
        {saving ? "Guardando dieta…" : "Guardar dieta"}
      </button>

    </div>
  );
}
