// app/components/DietPlanner.tsx

"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import FoodCalculator, {
  Item,
} from "./FoodCalculator";

import {
  getFoods,
  type Food,
} from "@/lib/foodsApi";

import {
  createDietVersion,
} from "@/lib/dietsApi";

import type {
  SupplementItem,
} from "@/app/types/supplement";

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
    notes: string | null;

    items: {
      id?: string;
      food_id: string;
      grams: number;
      role: "main" | "substitute";
      parent_item_id: string | null;
    }[];

    supplements?: {
      name: string;
      amount: number | null;
      unit: string | null;
      timing: string | null;
      notes: string | null;
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

function generateDietName(
  clientName: string
) {
  const today = new Date()
    .toISOString()
    .slice(0, 10);

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
  const [
    mealsCount,
    setMealsCount,
  ] = useState(5);

  const [
    mealsItems,
    setMealsItems,
  ] = useState<
    Record<number, Item[]>
  >({});

  const [
    mealsSupplements,
    setMealsSupplements,
  ] = useState<
    Record<number, SupplementItem[]>
  >({});

  const [
    mealsNotes,
    setMealsNotes,
  ] = useState<
    Record<number, string>
  >({});

  const [
    foods,
    setFoods,
  ] = useState<Food[]>([]);

  const [
    loadingFoods,
    setLoadingFoods,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    notes,
    setNotes,
  ] = useState("");

  /* =============================
     CARGAR ALIMENTOS
  ============================== */

  useEffect(() => {
    let mounted = true;

    getFoods()
      .then((data) => {
        if (mounted) {
          setFoods(data);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoadingFoods(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  /* =============================
     PRECARGAR DIETA (CLON)
  ============================== */

  useEffect(() => {
    if (!initialDiet) {
      return;
    }

    setMealsCount(
      initialDiet.meals.length
    );

    setNotes(
      initialDiet.notes ?? ""
    );

    const items: Record<
      number,
      Item[]
    > = {};

    const supplements: Record<
      number,
      SupplementItem[]
    > = {};

    const notesByMeal: Record<
      number,
      string
    > = {};

    initialDiet.meals.forEach(
      (meal) => {
        /*
         * Mapa:
         *
         * UUID del item antiguo
         *      ↓
         * UUID temporal del frontend
         *
         * Esto permite mantener correctamente
         * la relación principal → sustitución
         * al clonar una dieta.
         */
        const idMap =
          new Map<
            string,
            string
          >();

        meal.items.forEach(
          (item) => {
            if (item.id) {
              idMap.set(
                item.id,
                crypto.randomUUID()
              );
            }
          }
        );

        items[
          meal.meal_index
        ] = meal.items.map(
          (item) => ({
            id:
              item.id
                ? idMap.get(
                    item.id
                  )!
                : crypto.randomUUID(),

            foodId:
              item.food_id,

            grams:
              item.grams,

            role:
              item.role,

            parentItemId:
              item.parent_item_id
                ? idMap.get(
                    item.parent_item_id
                  )
                : undefined,
          })
        );

        notesByMeal[
          meal.meal_index
        ] =
          meal.notes ?? "";

        supplements[
          meal.meal_index
        ] =
          meal.supplements?.map(
            (supplement) => ({
              id:
                crypto.randomUUID(),

              name:
                supplement.name,

              amount:
                supplement.amount ??
                undefined,

              unit:
                supplement.unit ??
                undefined,

              timing:
                supplement.timing ??
                undefined,

              notes:
                supplement.notes ??
                undefined,
            })
          ) ?? [];
      }
    );

    setMealsItems(items);

    setMealsSupplements(
      supplements
    );

    setMealsNotes(
      notesByMeal
    );
  }, [initialDiet]);

  /* =============================
     CALLBACK DESDE FoodCalculator
  ============================== */

  const handleMealChange =
    useCallback(
      (
        mealIndex: number,
        items: Item[],
        supplements: SupplementItem[],
        mealNotes: string
      ) => {
        setMealsItems(
          (previous) => ({
            ...previous,
            [mealIndex]:
              items,
          })
        );

        setMealsSupplements(
          (previous) => ({
            ...previous,
            [mealIndex]:
              supplements,
          })
        );

        setMealsNotes(
          (previous) => ({
            ...previous,
            [mealIndex]:
              mealNotes,
          })
        );
      },
      []
    );

  /* =============================
     TOTAL DIARIO
  ============================== */

  const totalDay: Totals =
    useMemo(() => {
      return Object.values(
        mealsItems
      ).reduce(
        (
          accumulated,
          items
        ) => {
          items.forEach(
            (item) => {
              /*
               * Las sustituciones no se suman
               * al total diario.
               */
              if (
                item.role ===
                "substitute"
              ) {
                return;
              }

              if (
                item.grams <= 0
              ) {
                return;
              }

              const food =
                foods.find(
                  (candidate) =>
                    candidate.id ===
                    item.foodId
                );

              if (!food) {
                return;
              }

              const factor =
                item.grams /
                100;

              accumulated.kcal +=
                food.kcal_100 *
                factor;

              accumulated.protein +=
                food.protein_100 *
                factor;

              accumulated.carbs +=
                food.carbs_100 *
                factor;

              accumulated.fat +=
                food.fat_100 *
                factor;
            }
          );

          return accumulated;
        },
        {
          kcal: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        }
      );
    }, [
      mealsItems,
      foods,
    ]);

  /* =============================
     GUARDAR DIETA
     → UNA ÚNICA RPC
     → TRANSACCIÓN ATÓMICA
  ============================== */

  const saveDiet =
    async () => {
      if (
        !clientId ||
        saving
      ) {
        return;
      }

      /*
       * No permitimos guardar una dieta
       * completamente vacía.
       */
      const hasAnyMainFood =
        Object.values(
          mealsItems
        ).some((items) =>
          items.some(
            (item) =>
              item.grams >
                0 &&
              item.role ===
                "main"
          )
        );

      if (!hasAnyMainFood) {
        alert(
          "Añade al menos un alimento principal antes de guardar la dieta"
        );

        return;
      }

      try {
        setSaving(true);

        /*
         * Construimos el modelo completo
         * que recibirá PostgreSQL.
         *
         * Ya no hacemos INSERT individuales
         * desde el navegador.
         */
        const meals =
          Array.from(
            {
              length:
                mealsCount,
            },
            (
              _,
              mealIndex
            ) => {
              const items =
                mealsItems[
                  mealIndex
                ] ?? [];

              const supplements =
                mealsSupplements[
                  mealIndex
                ] ?? [];

              /* =========================
                 ITEMS PRINCIPALES
              ========================= */

              const mainItems =
                items
                  .filter(
                    (
                      item
                    ) =>
                      item.role ===
                        "main" &&
                      item.grams >
                        0
                  )
                  .map(
                    (
                      item
                    ) => ({
                      /*
                       * Este ID existe únicamente
                       * en el frontend.
                       *
                       * PostgreSQL lo utilizará
                       * para enlazar sustituciones
                       * con el UUID definitivo.
                       */
                      local_id:
                        item.id,

                      food_id:
                        item.foodId,

                      grams:
                        item.grams,

                      role:
                        "main" as const,

                      parent_local_id:
                        null,
                    })
                  );

              /*
               * IDs de principales que
               * realmente vamos a guardar.
               */
              const validMainIds =
                new Set(
                  mainItems.map(
                    (
                      item
                    ) =>
                      item.local_id
                  )
                );

              /* =========================
                 SUSTITUCIONES
              ========================= */

              const substituteItems =
                items
                  .filter(
                    (
                      item
                    ) => {
                      if (
                        item.role !==
                        "substitute"
                      ) {
                        return false;
                      }

                      if (
                        item.grams <=
                        0
                      ) {
                        return false;
                      }

                      if (
                        !item.parentItemId
                      ) {
                        return false;
                      }

                      return validMainIds.has(
                        item.parentItemId
                      );
                    }
                  )
                  .map(
                    (
                      item
                    ) => ({
                      food_id:
                        item.foodId,

                      grams:
                        item.grams,

                      role:
                        "substitute" as const,

                      /*
                       * El filtro anterior garantiza
                       * que parentItemId existe.
                       */
                      parent_local_id:
                        item.parentItemId!,
                    })
                  );

              /* =========================
                 SUPLEMENTOS
              ========================= */

              const validSupplements =
                supplements
                  .filter(
                    (
                      supplement
                    ) =>
                      supplement.name
                        .trim()
                        .length >
                      0
                  )
                  .map(
                    (
                      supplement
                    ) => ({
                      name:
                        supplement.name.trim(),

                      amount:
                        supplement.amount ??
                        null,

                      unit:
                        supplement.unit
                          ?.trim() ||
                        null,

                      timing:
                        supplement.timing
                          ?.trim() ||
                        null,

                      notes:
                        supplement.notes
                          ?.trim() ||
                        null,
                    })
                  );

              return {
                meal_index:
                  mealIndex,

                notes:
                  mealsNotes[
                    mealIndex
                  ]?.trim() ||
                  null,

                items: [
                  ...mainItems,
                  ...substituteItems,
                ],

                supplements:
                  validSupplements,
              };
            }
          );

        /*
         * UNA ÚNICA llamada a Supabase.
         *
         * A partir de aquí PostgreSQL
         * realiza toda la operación dentro
         * de una única transacción.
         */
        const diet =
          await createDietVersion(
            {
              clientId,

              name:
                generateDietName(
                  clientName
                ),

              mealsCount,

              notes:
                notes.trim() ||
                null,

              meals,
            }
          );

        onSaved?.(
          diet.id
        );
      } catch (error) {
        console.error(
          "Error guardando dieta:",
          error
        );

        alert(
          "Error al guardar la dieta"
        );
      } finally {
        setSaving(false);
      }
    };

  /* =============================
     UI
  ============================== */

  return (
    <div className="space-y-6">
      {/* =========================
          NÚMERO DE COMIDAS
      ========================= */}

      <section className="card">
        <label className="text-sm text-white/70">
          Número de comidas diarias
        </label>

        <select
          className="input mt-2"
          value={
            mealsCount
          }
          onChange={(
            event
          ) => {
            const count =
              Number(
                event.target
                  .value
              );

            setMealsCount(
              count
            );
          }}
        >
          {[
            3,
            4,
            5,
            6,
            7,
            8,
          ].map(
            (count) => (
              <option
                key={
                  count
                }
                value={
                  count
                }
              >
                {count}{" "}
                comidas
              </option>
            )
          )}
        </select>
      </section>

      {/* =========================
          NOTAS GENERALES
      ========================= */}

      <section className="card">
        <label className="text-sm text-white/70">
          Notas y recomendaciones
        </label>

        <textarea
          value={
            notes
          }
          onChange={(
            event
          ) =>
            setNotes(
              event.target
                .value
            )
          }
          rows={4}
          className="input mt-2 resize-none"
        />
      </section>

      {/* =========================
          COMIDAS
      ========================= */}

      {!loadingFoods && (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from(
            {
              length:
                mealsCount,
            }
          ).map(
            (
              _,
              mealIndex
            ) => (
              <FoodCalculator
                key={
                  mealIndex
                }
                title={`Comida ${
                  mealIndex +
                  1
                }`}
                foods={
                  foods
                }
                initialItems={
                  mealsItems[
                    mealIndex
                  ] ?? []
                }
                initialSupplements={
                  mealsSupplements[
                    mealIndex
                  ] ?? []
                }
                initialNotes={
                  mealsNotes[
                    mealIndex
                  ] ?? ""
                }
                onChange={(
                  items,
                  supplements,
                  mealNotes
                ) =>
                  handleMealChange(
                    mealIndex,
                    items,
                    supplements,
                    mealNotes
                  )
                }
              />
            )
          )}
        </section>
      )}

      {/* =========================
          TOTAL DIARIO
      ========================= */}

      <section className="card">
        <h3 className="text-white font-medium mb-3">
          Total diario
        </h3>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <p>
            🔥{" "}
            {totalDay.kcal.toFixed(
              0
            )}{" "}
            kcal
          </p>

          <p>
            🥩{" "}
            {totalDay.protein.toFixed(
              1
            )}{" "}
            g
          </p>

          <p>
            🍚{" "}
            {totalDay.carbs.toFixed(
              1
            )}{" "}
            g
          </p>

          <p>
            🥑{" "}
            {totalDay.fat.toFixed(
              1
            )}{" "}
            g
          </p>
        </div>
      </section>

      {/* =========================
          GUARDAR
      ========================= */}

      <button
        type="button"
        onClick={
          saveDiet
        }
        disabled={
          saving
        }
        className="bg-[var(--color-accent)] px-6 py-3 rounded-lg text-white font-medium disabled:opacity-50"
      >
        {saving
          ? "Guardando dieta…"
          : "Guardar dieta"}
      </button>
    </div>
  );
}