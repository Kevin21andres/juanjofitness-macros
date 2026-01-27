"use client";

import { useState } from "react";
import { FOODS } from "/lib/foods";

type Item = {
  foodId: string;
  grams: number;
};

export default function FoodCalculator() {
  const [items, setItems] = useState<Item[]>([]);

  const addItem = () => {
    setItems([...items, { foodId: FOODS[0].id, grams: 0 }]);
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

  return (
    <section className="bg-[#111111] rounded-2xl p-6 border border-white/10 space-y-4">
      <h2 className="text-lg font-medium text-white">
        Calculadora de comida
      </h2>

      {items.map((item, i) => (
        <div key={i} className="grid grid-cols-2 gap-3">
          <select
            className="input"
            value={item.foodId}
            onChange={(e) => {
              const copy = [...items];
              copy[i].foodId = e.target.value;
              setItems(copy);
            }}
          >
            {FOODS.map((food) => (
              <option key={food.id} value={food.id}>
                {food.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            className="input"
            placeholder="Gramos"
            value={item.grams}
            onChange={(e) => {
              const copy = [...items];
              copy[i].grams = Number(e.target.value);
              setItems(copy);
            }}
          />
        </div>
      ))}

      <button
        onClick={addItem}
        className="bg-[var(--color-accent)] px-4 py-2 rounded-lg text-white font-medium hover:brightness-110 transition"
      >
        + Añadir alimento
      </button>

      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-white/10">
          <div className="card">
            <p className="text-white/60">Calorías</p>
            <p className="text-xl font-semibold text-white">
              {totals.kcal.toFixed(0)} kcal
            </p>
          </div>
          <div className="card">
            <p className="text-white/60">Proteínas</p>
            <p className="text-xl font-semibold text-white">
              {totals.protein.toFixed(1)} g
            </p>
          </div>
          <div className="card">
            <p className="text-white/60">Carbohidratos</p>
            <p className="text-xl font-semibold text-white">
              {totals.carbs.toFixed(1)} g
            </p>
          </div>
          <div className="card">
            <p className="text-white/60">Grasas</p>
            <p className="text-xl font-semibold text-white">
              {totals.fat.toFixed(1)} g
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
