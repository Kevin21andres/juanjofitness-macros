// app/components/FoodCalculator.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Food } from "@/lib/foodsApi";

/* =========================
   TIPOS
========================= */

export type Item = {
  id: string;
  foodId: string;
  grams: number;
  role: "main" | "substitute";
  parentItemId?: string;
};

type Props = {
  title: string;
  foods: Food[];
  onChange: (items: Item[]) => void;
  initialItems?: Item[];
};

/* =========================
   NORMALIZAR ITEMS (CLON)
   → FIX DEFINITIVO
========================= */
function normalizeItems(items: Item[]): Item[] {
  const idMap = new Map<string, string>();

  // 1️⃣ asignar nuevos IDs a TODOS
  const withIds = items.map((item) => {
    const newId = crypto.randomUUID();
    idMap.set(item.id, newId);

    return {
      ...item,
      id: newId,
    };
  });

  // 2️⃣ reparar parentItemId
  return withIds.map((item) => ({
    ...item,
    parentItemId: item.parentItemId
      ? idMap.get(item.parentItemId)
      : undefined,
  }));
}

/* =========================
   COMPONENTE
========================= */

export default function FoodCalculator({
  title,
  foods,
  onChange,
  initialItems = [],
}: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const initializedRef = useRef(false);

  /* =========================
     INICIALIZAR SOLO 1 VEZ
     + NORMALIZAR CLON
  ========================= */
  useEffect(() => {
    if (initializedRef.current) return;

    const normalized = normalizeItems(initialItems);
    setItems(normalized);
    onChange(normalized);

    initializedRef.current = true;
  }, [initialItems, onChange]);

  const notify = (next: Item[]) => {
    setItems(next);
    onChange(next);
  };

  /* =========================
     PRINCIPALES
  ========================= */
  const mainItems = items.filter((i) => i.role === "main");

  const getSubstitutions = (parentId: string) =>
    items.filter(
      (i) => i.role === "substitute" && i.parentItemId === parentId
    );

  const addMainItem = () => {
    if (!foods.length) return;

    notify([
      ...items,
      {
        id: crypto.randomUUID(),
        foodId: foods[0].id,
        grams: 0,
        role: "main",
      },
    ]);
  };

  const removeMainItem = (id: string) => {
    notify(items.filter((i) => i.id !== id && i.parentItemId !== id));
  };

  const updateItem = (
    id: string,
    field: "foodId" | "grams",
    value: string | number
  ) => {
    notify(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  /* =========================
     SUSTITUCIONES
  ========================= */
  const addSubstitution = (parentId: string) => {
    notify([
      ...items,
      {
        id: crypto.randomUUID(),
        foodId: foods[0].id,
        grams: 0,
        role: "substitute",
        parentItemId: parentId,
      },
    ]);
  };

  const removeSubstitution = (id: string) => {
    notify(items.filter((i) => i.id !== id));
  };

  /* =========================
     TOTALES
  ========================= */
  const totals = mainItems.reduce(
    (acc, item) => {
      if (item.grams <= 0) return acc;
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
          {mainItems.length} alimentos
        </span>
      </div>

      {/* PRINCIPALES */}
      {mainItems.map((item) => {
        const subs = getSubstitutions(item.id);

        return (
          <div
            key={`main-${item.id}`}
            className="space-y-2 border-b border-white/10 pb-3"
          >
            {/* Principal */}
            <div className="grid grid-cols-[1fr_90px_28px] gap-3 items-center">
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
                value={item.grams}
                onChange={(e) =>
                  updateItem(item.id, "grams", Number(e.target.value))
                }
              />

              <button
                onClick={() => removeMainItem(item.id)}
                className="text-white/40 hover:text-red-400"
              >
                ✕
              </button>
            </div>

            {/* Sustituciones */}
            {subs.length > 0 && (
              <div className="ml-4 space-y-2">
                {subs.map((sub) => (
                  <div
                    key={`sub-${sub.id}`}
                    className="grid grid-cols-[1fr_90px_28px] gap-3 items-center"
                  >
                    <select
                      className="input"
                      value={sub.foodId}
                      onChange={(e) =>
                        updateItem(sub.id, "foodId", e.target.value)
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
                      value={sub.grams}
                      onChange={(e) =>
                        updateItem(sub.id, "grams", Number(e.target.value))
                      }
                    />

                    <button
                      onClick={() => removeSubstitution(sub.id)}
                      className="text-white/40 hover:text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => addSubstitution(item.id)}
              className="ml-4 text-xs text-[var(--color-accent)] hover:underline"
            >
              + Añadir sustitución
            </button>
          </div>
        );
      })}

      {/* Acción */}
      <button
        onClick={addMainItem}
        disabled={!foods.length}
        className="text-sm text-[var(--color-accent)] hover:underline disabled:opacity-40"
      >
        + Añadir alimento
      </button>

      {/* Totales */}
      {totals.kcal > 0 && (
        <div className="bg-[#0B0B0B] rounded-xl p-4 border border-white/10">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <p>🔥 {totals.kcal.toFixed(0)} kcal</p>
            <p>🥩 {totals.protein.toFixed(1)} g</p>
            <p>🍚 {totals.carbs.toFixed(1)} g</p>
            <p>🥑 {totals.fat.toFixed(1)} g</p>
          </div>
        </div>
      )}
    </section>
  );
}
