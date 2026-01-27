"use client";

import { useState, useEffect } from "react";
import { FOODS } from "@/lib/foods";

type Item = {
  id: string;
  foodId: string;
  grams: number;
};

type Totals = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

type Props = {
  title: string;
  onTotalsChange?: (totals: Totals) => void;
};

export default function FoodCalculator({ title, onTotalsChange }: Props) {
  const [items, setItems] = useState<Item[]>([]);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        foodId: FOODS[0].id,
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

  const totals = items.reduce(
    (acc, item) => {
      const food = FOODS.find((f) => f.id === item.foodId);
      if (!food) return acc;

      const factor = item.grams / 100;

      acc.kcal += food.kcal * factor;
      acc.protein += food.protein * factor;
      acc.carbs += food.carbs * factor;
      acc.fat += food.fat * factor;

      return acc;
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  useEffect(() => {
    onTotalsChange?.(totals);
  }, [totals, onTotalsChange]);

  return (
    <section className="card space-y-4">
      <h3 className="text-white font-medium">{title}</h3>

      {items.map((item) => (
        <div key={item.id} className="grid grid-cols-2 gap-3">
          <select
            className="input"
            value={item.foodId}
            onChange={(e) =>
              updateItem(item.id, "foodId", e.target.value)
            }
          >
            {FOODS.map((food) => (
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
        className="text-sm text-[var(--color-accent)]"
      >
        + Añadir alimento
      </button>

      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-3 text-sm pt-3 border-t border-white/10">
          <p className="text-white">Kcal: {totals.kcal.toFixed(0)}</p>
          <p className="text-white">Prot: {totals.protein.toFixed(1)} g</p>
          <p className="text-white">Carbs: {totals.carbs.toFixed(1)} g</p>
          <p className="text-white">Grasas: {totals.fat.toFixed(1)} g</p>
        </div>
      )}
    </section>
  );
}
