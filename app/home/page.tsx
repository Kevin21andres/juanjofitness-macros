"use client";

import { useEffect, useState } from "react";
import { FOODS } from "@/lib/foods";

type FoodItem = {
  foodId: string;
  grams: number;
};

type Meal = {
  id: number;
  name: string;
  items: FoodItem[];
};

export default function HomePage() {
  const [mealsCount, setMealsCount] = useState<number>(4);

  const createMeals = (count: number): Meal[] =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      name: `Comida ${i + 1}`,
      items: [],
    }));

  const [meals, setMeals] = useState<Meal[]>(createMeals(mealsCount));

  useEffect(() => {
    setMeals(createMeals(mealsCount));
  }, [mealsCount]);

  const addFoodToMeal = (mealIndex: number) => {
    const copy = [...meals];
    copy[mealIndex].items.push({
      foodId: FOODS[0].id,
      grams: 0,
    });
    setMeals(copy);
  };

  const updateFood = (
    mealIndex: number,
    itemIndex: number,
    field: "foodId" | "grams",
    value: string | number
  ) => {
    const copy = [...meals];
    // @ts-ignore
    copy[mealIndex].items[itemIndex][field] = value;
    setMeals(copy);
  };

  const calculateMealTotals = (meal: Meal) => {
    return meal.items.reduce(
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
  };

  const totalDay = meals.reduce(
    (acc, meal) => {
      const totals = calculateMealTotals(meal);
      acc.kcal += totals.kcal;
      acc.protein += totals.protein;
      acc.carbs += totals.carbs;
      acc.fat += totals.fat;
      return acc;
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <div className="min-h-screen bg-[#0B0B0B] p-6 space-y-8">

      {/* HEADER */}
      <header>
        <h1 className="text-2xl font-semibold text-white">
          Plan diario de dieta
        </h1>
        <p className="text-sm text-white/60">
          Juanjo Fitness · Comidas y macros
        </p>
      </header>

      {/* SELECTOR COMIDAS */}
      <section className="card space-y-2">
        <label className="text-sm text-white/70">
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

      {/* COMIDAS */}
      <section className="space-y-6">
        {meals.map((meal, mealIndex) => {
          const totals = calculateMealTotals(meal);

          return (
            <div key={meal.id} className="card space-y-4">
              <h3 className="text-white font-medium">{meal.name}</h3>

              {meal.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className="grid grid-cols-2 gap-3"
                >
                  <select
                    className="input"
                    value={item.foodId}
                    onChange={(e) =>
                      updateFood(mealIndex, itemIndex, "foodId", e.target.value)
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
                    className="input"
                    placeholder="Gramos"
                    value={item.grams}
                    onChange={(e) =>
                      updateFood(
                        mealIndex,
                        itemIndex,
                        "grams",
                        Number(e.target.value)
                      )
                    }
                  />
                </div>
              ))}

              <button
                onClick={() => addFoodToMeal(mealIndex)}
                className="text-sm text-[var(--color-accent)]"
              >
                + Añadir alimento
              </button>

              {meal.items.length > 0 && (
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
            </div>
          );
        })}
      </section>

      {/* TOTAL DIARIO */}
      <section className="card">
        <h3 className="text-white font-medium mb-2">
          Total diario
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <p className="text-white">Kcal: {totalDay.kcal.toFixed(0)}</p>
          <p className="text-white">
            Proteína: {totalDay.protein.toFixed(1)} g
          </p>
          <p className="text-white">
            Carbs: {totalDay.carbs.toFixed(1)} g
          </p>
          <p className="text-white">
            Grasas: {totalDay.fat.toFixed(1)} g
          </p>
        </div>
      </section>

    </div>
  );
}
