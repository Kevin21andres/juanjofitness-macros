"use client";

import { useEffect, useState } from "react";
import { Food } from "@/lib/foodsApi";

export type Item = {
  id: string;
  foodId: string;
  grams: number;
};

type Props = {
  title: string;
  foods: Food[];
  onChange: (items: Item[]) => void;
};

export default function FoodCalculator({
  title,
  foods,
  onChange,
}: Props) {
  const [items, setItems] = useState<Item[]>([]);

  // 🔹 Notificar cambios al padre
  useEffect(() => {
    onChange(items);
  }, [items]);

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

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
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

  // 🔹 Totales de esta comida
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
    <section className="card space-y-5 h-full">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium">{title}</h3>
        <span className="text-xs text-white/50">
          {items.length} alimentos
        </span>
      </div>

      {/* Alimentos */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-[1fr_90px_28px] gap-3 items-center"
          >
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
              className="input text-right"
              placeholder="g"
              value={item.grams}
              onChange={(e) =>
                updateItem(
                  item.id,
                  "grams",
                  Number(e.target.value)
                )
              }
            />

            <button
              onClick={() => removeItem(item.id)}
              className="text-white/40 hover:text-red-400 transition"
              title="Eliminar alimento"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Acción */}
      <button
        onClick={addItem}
        disabled={foods.length === 0}
        className="text-sm text-[var(--color-accent)] hover:underline disabled:opacity-40"
      >
        + Añadir alimento
      </button>

      {/* Totales */}
      {items.length > 0 && (
        <div className="bg-[#0B0B0B] rounded-xl p-4 border border-white/10">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <p className="text-white">
              🔥 {totals.kcal.toFixed(0)} kcal
            </p>
            <p className="text-white">
              🥩 {totals.protein.toFixed(1)} g
            </p>
            <p className="text-white">
              🍚 {totals.carbs.toFixed(1)} g
            </p>
            <p className="text-white">
              🥑 {totals.fat.toFixed(1)} g
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
