// lib/dietsApi.ts

import { supabase } from "./supabaseClient";
import type { DietSupplement } from "./dietSupplementsApi";

/* =========================
   TIPOS BASE
========================= */

export type Diet = {
  id: string;
  client_id: string;
  name: string;
  meals_count: number;
  is_active: boolean;
  created_at: string;
  notes: string | null;
};

export type Food = {
  id: string;
  name: string;
  kcal_100: number;
  protein_100: number;
  carbs_100: number;
  fat_100: number;
};

export type DietItem = {
  id: string;
  grams: number;
  role: "main" | "substitute";
  parent_item_id: string | null;
  food: Food;
};

export type DietMeal = {
  id: string;
  meal_index: number;
  notes: string | null;
  items: DietItem[];
  supplements: DietSupplement[];
};

export type DietTotals = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type DietDetail = Diet & {
  meals: DietMeal[];
  totals: DietTotals;
};

/* =========================
   CREACIÓN ATÓMICA DE DIETA
========================= */

export type CreateDietVersionItem = {
  /*
   * Identificador temporal generado por el frontend.
   *
   * Solo es necesario para alimentos principales y permite
   * relacionar posteriormente las sustituciones con el UUID
   * real creado en PostgreSQL.
   */
  local_id?: string;

  food_id: string;
  grams: number;
  role: "main" | "substitute";

  /*
   * Para sustituciones contiene el local_id del alimento
   * principal al que pertenece.
   */
  parent_local_id?: string | null;
};

export type CreateDietVersionSupplement = {
  name: string;
  amount: number | null;
  unit: string | null;
  timing: string | null;
  notes: string | null;
};

export type CreateDietVersionMeal = {
  meal_index: number;
  notes: string | null;
  items: CreateDietVersionItem[];
  supplements: CreateDietVersionSupplement[];
};

export type CreateDietVersionParams = {
  clientId: string;
  name: string;
  mealsCount: number;
  notes?: string | null;
  meals: CreateDietVersionMeal[];
};

/* =========================
   SHARE
   MODELO PÚBLICO
========================= */

export type SharedDiet = {
  id: string;
  name: string;
  meals: DietMeal[];
  totals: DietTotals;
  notes: string | null;
};

/*
 * Estructura devuelta por la RPC segura get_shared_diet().
 *
 * Este tipo únicamente representa la respuesta interna
 * de Supabase antes de convertirla al modelo SharedDiet.
 */
type SharedDietRpcResult = {
  id: string;
  name: string;
  notes: string | null;

  meals: {
    id: string;
    meal_index: number;
    notes: string | null;

    items: {
      id: string;
      grams: number;
      role: "main" | "substitute";
      parent_item_id: string | null;
      food: Food;
    }[];

    supplements: DietSupplement[];
  }[];
};

/* =========================
   UTILIDAD: CALCULAR MACROS
   → SOLO ITEMS PRINCIPALES
========================= */

export function calculateDietTotals(
  meals: DietMeal[]
): DietTotals {
  return meals.reduce(
    (acc, meal) => {
      meal.items.forEach((item) => {
        if (item.role === "substitute") {
          return;
        }

        const factor = item.grams / 100;
        const food = item.food;

        acc.kcal +=
          food.kcal_100 * factor;

        acc.protein +=
          food.protein_100 * factor;

        acc.carbs +=
          food.carbs_100 * factor;

        acc.fat +=
          food.fat_100 * factor;
      });

      return acc;
    },
    {
      kcal: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    }
  );
}

/* =========================
   CREAR DIETA VERSIONADA
   → RPC ATÓMICA
   → UNA ÚNICA TRANSACCIÓN
========================= */

export async function createDietVersion(
  params: CreateDietVersionParams
): Promise<Diet> {
  /*
   * Validaciones básicas en frontend.
   *
   * PostgreSQL vuelve a validar todos estos datos,
   * por lo que estas comprobaciones no constituyen
   * la barrera de seguridad.
   */
  if (!params.clientId.trim()) {
    throw new Error(
      "clientId es obligatorio"
    );
  }

  const cleanName =
    params.name.trim();

  if (!cleanName) {
    throw new Error(
      "El nombre de la dieta es obligatorio"
    );
  }

  if (cleanName.length > 200) {
    throw new Error(
      "El nombre de la dieta es demasiado largo"
    );
  }

  if (
    !Number.isInteger(
      params.mealsCount
    ) ||
    params.mealsCount < 1 ||
    params.mealsCount > 12
  ) {
    throw new Error(
      "Número de comidas no válido"
    );
  }

  if (
    !Array.isArray(params.meals) ||
    params.meals.length !==
      params.mealsCount
  ) {
    throw new Error(
      "El número de comidas no coincide con mealsCount"
    );
  }

  /*
   * Toda la dieta se envía en una única operación.
   *
   * La función PostgreSQL:
   *
   * - valida auth.uid();
   * - valida propiedad del cliente;
   * - bloquea el cliente con FOR UPDATE;
   * - desactiva versiones anteriores;
   * - crea la dieta;
   * - crea comidas;
   * - crea alimentos;
   * - resuelve sustituciones;
   * - crea suplementos;
   * - hace rollback completo ante cualquier error.
   */
  const { data, error } =
    await supabase.rpc(
      "create_diet_version",
      {
        p_client_id:
          params.clientId,

        p_name:
          cleanName,

        p_meals_count:
          params.mealsCount,

        p_notes:
          params.notes?.trim() ||
          null,

        p_meals:
          params.meals,
      }
    );

  if (error) {
    console.error(
      "createDietVersion RPC error:",
      error
    );

    throw error;
  }

  /*
   * La RPC devuelve la nueva fila de diets
   * serializada como JSON.
   */
  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    throw new Error(
      "La base de datos no devolvió una dieta válida"
    );
  }

  const diet =
    data as Partial<Diet>;

  /*
   * Validación defensiva de la respuesta.
   */
  if (
    typeof diet.id !== "string" ||
    typeof diet.client_id !==
      "string" ||
    typeof diet.name !== "string" ||
    typeof diet.meals_count !==
      "number" ||
    typeof diet.is_active !==
      "boolean" ||
    typeof diet.created_at !==
      "string"
  ) {
    throw new Error(
      "Respuesta inválida al crear la dieta"
    );
  }

  return {
    id: diet.id,
    client_id: diet.client_id,
    name: diet.name,
    meals_count:
      diet.meals_count,
    is_active:
      diet.is_active,
    created_at:
      diet.created_at,
    notes:
      typeof diet.notes ===
        "string"
        ? diet.notes
        : null,
  };
}

/* =========================
   OBTENER DIETA ACTIVA
========================= */

export async function getActiveDiet(
  clientId: string
): Promise<Diet | null> {
  const { data, error } =
    await supabase
      .from("diets")
      .select("*")
      .eq(
        "client_id",
        clientId
      )
      .eq(
        "is_active",
        true
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      )
      .limit(1);

  if (error) {
    throw error;
  }

  return data?.[0] ?? null;
}

/* =========================
   HISTÓRICO DE DIETAS
========================= */

export async function getDietHistory(
  clientId: string
): Promise<Diet[]> {
  const { data, error } =
    await supabase
      .from("diets")
      .select("*")
      .eq(
        "client_id",
        clientId
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      );

  if (error) {
    throw error;
  }

  return data ?? [];
}

/* =========================
   DETALLE COMPLETO DE DIETA
========================= */

export async function getDietDetail(
  dietId: string
): Promise<DietDetail | null> {
  const { data, error } =
    await supabase
      .from("diets")
      .select(`
        id,
        client_id,
        name,
        meals_count,
        is_active,
        created_at,
        notes,
        diet_meals (
          id,
          meal_index,
          notes,
          diet_items (
            id,
            grams,
            role,
            parent_item_id,
            foods (
              id,
              name,
              kcal_100,
              protein_100,
              carbs_100,
              fat_100
            )
          ),
          diet_supplements (
            id,
            meal_id,
            name,
            amount,
            unit,
            timing,
            notes,
            created_at
          )
        )
      `)
      .eq(
        "id",
        dietId
      )
      .maybeSingle();

  if (error || !data) {
    return null;
  }

  const meals: DietMeal[] =
    data.diet_meals.map(
      (meal) => ({
        id:
          meal.id,

        meal_index:
          meal.meal_index,

        notes:
          meal.notes ?? null,

        items:
          meal.diet_items.map(
            (item) => {
              /*
               * Dependiendo de cómo infiera Supabase
               * la relación, foods puede llegar como
               * objeto o como array.
               */
              const food =
                Array.isArray(
                  item.foods
                )
                  ? item.foods[0]
                  : item.foods;

              if (!food) {
                throw new Error(
                  `No se encontró el alimento asociado al item ${item.id}`
                );
              }

              return {
                id:
                  item.id,

                grams:
                  item.grams,

                role:
                  item.role,

                parent_item_id:
                  item.parent_item_id,

                food,
              };
            }
          ),

        supplements:
          meal.diet_supplements ??
          [],
      })
    );

  const totals =
    calculateDietTotals(
      meals
    );

  return {
    ...data,

    meals,

    totals: {
      kcal:
        Math.round(
          totals.kcal
        ),

      protein:
        Number(
          totals.protein.toFixed(
            1
          )
        ),

      carbs:
        Number(
          totals.carbs.toFixed(
            1
          )
        ),

      fat:
        Number(
          totals.fat.toFixed(
            1
          )
        ),
    },
  };
}

/* =========================
   SHARE: DIETA POR TOKEN
   → RPC SEGURA
   → SIN SELECT DIRECTO
========================= */

export async function getSharedDietByToken(
  token: string
): Promise<{
  diet: SharedDiet;
} | null> {
  const cleanToken =
    token.trim();

  /*
   * Los tokens generados actualmente son UUID.
   *
   * El límite evita enviar valores absurdos
   * a la RPC sin acoplar estrictamente la
   * aplicación al formato UUID.
   */
  if (
    cleanToken.length < 20 ||
    cleanToken.length > 200
  ) {
    return null;
  }

  const { data, error } =
    await supabase.rpc(
      "get_shared_diet",
      {
        p_token:
          cleanToken,
      }
    );

  if (error) {
    console.error(
      "getSharedDietByToken error:",
      error
    );

    return null;
  }

  /*
   * La RPC devuelve NULL cuando:
   *
   * - el token no existe;
   * - está desactivado;
   * - ha expirado.
   */
  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    return null;
  }

  const rawDiet =
    data as SharedDietRpcResult;

  /*
   * Validación básica defensiva.
   */
  if (
    typeof rawDiet.id !==
      "string" ||
    typeof rawDiet.name !==
      "string" ||
    !Array.isArray(
      rawDiet.meals
    )
  ) {
    return null;
  }

  const meals: DietMeal[] =
    rawDiet.meals.map(
      (meal) => ({
        id:
          meal.id,

        meal_index:
          meal.meal_index,

        notes:
          meal.notes ?? null,

        items:
          (
            meal.items ?? []
          ).map(
            (item) => ({
              id:
                item.id,

              grams:
                item.grams,

              role:
                item.role,

              parent_item_id:
                item.parent_item_id ??
                null,

              food:
                item.food,
            })
          ),

        supplements:
          meal.supplements ??
          [],
      })
    );

  const totals =
    calculateDietTotals(
      meals
    );

  return {
    diet: {
      id:
        rawDiet.id,

      name:
        rawDiet.name,

      notes:
        rawDiet.notes ??
        null,

      meals,

      totals: {
        kcal:
          Math.round(
            totals.kcal
          ),

        protein:
          Number(
            totals.protein.toFixed(
              1
            )
          ),

        carbs:
          Number(
            totals.carbs.toFixed(
              1
            )
          ),

        fat:
          Number(
            totals.fat.toFixed(
              1
            )
          ),
      },
    },
  };
}

/* =========================
   CLONAR DIETA
========================= */

export async function getDietCloneData(
  dietId: string
): Promise<{
  name: string;
  notes: string | null;

  meals: {
    meal_index: number;
    notes: string | null;

    items: {
      id: string;
      food_id: string;
      grams: number;
      role:
        | "main"
        | "substitute";
      parent_item_id:
        | string
        | null;
    }[];

    supplements: {
      name: string;
      amount:
        | number
        | null;
      unit:
        | string
        | null;
      timing:
        | string
        | null;
      notes:
        | string
        | null;
    }[];
  }[];
} | null> {
  const diet =
    await getDietDetail(
      dietId
    );

  if (!diet) {
    return null;
  }

  return {
    name:
      diet.name,

    notes:
      diet.notes,

    meals:
      diet.meals.map(
        (meal) => ({
          meal_index:
            meal.meal_index,

          notes:
            meal.notes ??
            null,

          items:
            meal.items.map(
              (item) => ({
                id:
                  item.id,

                food_id:
                  item.food.id,

                grams:
                  item.grams,

                role:
                  item.role,

                parent_item_id:
                  item.parent_item_id,
              })
            ),

          supplements:
            meal.supplements.map(
              (
                supplement
              ) => ({
                name:
                  supplement.name,

                amount:
                  supplement.amount,

                unit:
                  supplement.unit,

                timing:
                  supplement.timing,

                notes:
                  supplement.notes,
              })
            ),
        })
      ),
  };
}