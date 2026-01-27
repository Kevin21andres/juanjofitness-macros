"use client";

import { useEffect, useState } from "react";
import { getFoods, Food } from "@/lib/foodsApi";

export type Item = {
  id: string;
  foodId: string;
  grams: number;
};

type Props = {
  title: string;
  onChange: (items: Item[]) => void;
};

export default function FoodCalculator({ title, onChange }: Props) {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);

  // 🔹 Cargar alimentos (una sola vez)
  useEffect(() => {
    let mounted = true;

    const loadFoods = async () => {
      try {
        const data = await getFoods();
        if (mounted) setFoods(data);
      } catch (e) {
        console.error("Error cargando alimentos:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadFoods();
    return () => {
      mounted = false;
    };
  }, []);

  // ✅ Notificar cambios al padre (SIN LOOP)
  useEffect(() => {
    onChange(items);
  }, [items]); // ⚠️ NO incluir onChange

  const addItem = () => {
    if (foods.length === 0) return;

    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        foodId: foods[0].id,
        grams: 0,
      },
    ]);
  };

  const updateItem = (
    id: string,
    field: "foodId" | "grams",
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  // 🔹 Totales SOLO para mostrar
  const totals = items.reduce(
    (acc, item) => {
      const food = foods.find((f) => f.id === item.foodId);
      if (!food) return acc;

      const factor = item.grams / 100;

      acc.kcal += food.kcal_100 * factor;
      acc.protein += food.protein_100 * factor;
      acc.carbs += food.carbs_100 * factor;
      acc.fat += food.fat_100 * factor;

      return acc;
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <section className="card space-y-4">
      <h3 className="text-white font-medium">{title}</h3>

      {loading && (
        <p className="text-sm text-white/60">Cargando alimentos…</p>
      )}

      {!loading &&
        items.map((item) => (
          <div key={item.id} className="grid grid-cols-2 gap-3">
            <select
              className="input"
              value={item.foodId}
              onChange={(e) =>
                updateItem(item.id, "foodId", e.target.value)
              }
            >
              {foods.map((food) => (
                <option key={food.id} value={food.id}>
                  {food.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="0"
              className="input"
              placeholder="Gramos"
              value={item.grams}
              onChange={(e) =>
                updateItem(item.id, "grams", Number(e.target.value))
              }
            />
          </div>
        ))}

      <button
        onClick={addItem}
        disabled={loading || foods.length === 0}
        className="text-sm text-[var(--color-accent)] disabled:opacity-40"
      >
        + Añadir alimento
      </button>

      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-3 text-sm pt-3 border-t border-white/10">
          <p className="text-white">Kcal: {totals.kcal.toFixed(0)}</p>
          <p className="text-white">
            Proteína: {totals.protein.toFixed(1)} g
          </p>
          <p className="text-white">
            Carbs: {totals.carbs.toFixed(1)} g
          </p>
          <p className="text-white">
            Grasas: {totals.fat.toFixed(1)} g
          </p>
        </div>
      )}
    </section>
  );
}
