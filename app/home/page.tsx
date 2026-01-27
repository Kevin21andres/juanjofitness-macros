"use client";

import { useEffect, useState } from "react";

type Meal = {
  id: number;
  name: string;
};

export default function HomePage() {
  // número de comidas diarias
  const [mealsCount, setMealsCount] = useState<number>(4);

  // función para generar comidas
  const createMeals = (count: number): Meal[] =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      name: `Comida ${i + 1}`,
    }));

  // estado de comidas
  const [meals, setMeals] = useState<Meal[]>(createMeals(mealsCount));

  // regenerar comidas cuando cambia el número
  useEffect(() => {
    setMeals(createMeals(mealsCount));
  }, [mealsCount]);

  return (
    <div className="min-h-screen bg-[#0B0B0B] p-6 space-y-8">

      {/* HEADER */}
      <header>
        <h1 className="text-2xl font-semibold text-white">
          Panel de control
        </h1>
        <p className="text-sm text-white/60">
          Juanjo Fitness · Dietas y Clientes
        </p>
      </header>

      {/* SELECTOR DE COMIDAS */}
      <section className="bg-[#111111] rounded-2xl p-4 border border-white/10 space-y-2">
        <label className="block text-sm text-white/70">
          Número de comidas diarias
        </label>

        <select
          className="input"
          value={mealsCount}
          onChange={(e) => setMealsCount(Number(e.target.value))}
        >
          {[3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>
              {n} comidas
            </option>
          ))}
        </select>
      </section>

      {/* BLOQUES DE COMIDAS */}
      <section className="space-y-4">
        {meals.map((meal) => (
          <div
            key={meal.id}
            className="bg-[#111111] rounded-2xl p-4 border border-white/10"
          >
            <h3 className="text-white font-medium">
              {meal.name}
            </h3>

            <p className="text-sm text-white/50 mt-1">
              Sin alimentos añadidos
            </p>
          </div>
        ))}
      </section>

    </div>
  );
}
