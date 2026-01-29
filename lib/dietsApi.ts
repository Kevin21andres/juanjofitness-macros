import { supabase } from "./supabaseClient";

/* =========================
   TIPOS BASE (MODELO REAL)
========================= */

export type Diet = {
  id: string;
  client_id: string | null;
  name: string;
  meals_count: number;
  is_active: boolean;
  created_at: string;
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
  food: Food;
};

export type DietMeal = {
  id: string;
  meal_index: number;
  items: DietItem[];
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
   SHARE (MODELO PÚBLICO)
========================= */

export type SharedDiet = {
  id: string;
  name: string;
  meals: DietMeal[];
  totals: DietTotals;
};

/* =========================
   UTILIDAD: CALCULAR MACROS
========================= */

export function calculateDietTotals(
  meals: DietMeal[]
): DietTotals {
  return meals.reduce(
    (acc, meal) => {
      meal.items.forEach((item) => {
        const factor = item.grams / 100;
        const f = item.food;

        acc.kcal += f.kcal_100 * factor;
        acc.protein += f.protein_100 * factor;
        acc.carbs += f.carbs_100 * factor;
        acc.fat += f.fat_100 * factor;
      });
      return acc;
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

/* =========================
   CREAR DIETA VERSIONADA
========================= */

export async function createDietVersion(params: {
  clientId: string;
  name: string;
  mealsCount: number;
}) {
  await supabase
    .from("diets")
    .update({ is_active: false })
    .eq("client_id", params.clientId)
    .eq("is_active", true);

  const { data, error } = await supabase
    .from("diets")
    .insert({
      client_id: params.clientId,
      name: params.name,
      meals_count: params.mealsCount,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Diet;
}

/* =========================
   OBTENER DIETA ACTIVA
========================= */

export async function getActiveDiet(
  clientId: string
): Promise<Diet | null> {
  const { data, error } = await supabase
    .from("diets")
    .select("*")
    .eq("client_id", clientId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) throw error;
  return data?.[0] ?? null;
}

/* =========================
   HISTÓRICO DE DIETAS
========================= */

export async function getDietHistory(
  clientId: string
): Promise<Diet[]> {
  const { data, error } = await supabase
    .from("diets")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/* =========================
   DETALLE COMPLETO DE DIETA
========================= */

export async function getDietDetail(
  dietId: string
): Promise<DietDetail | null> {
  const { data, error } = await supabase
    .from("diets")
    .select(`
      id,
      client_id,
      name,
      meals_count,
      is_active,
      created_at,
      diet_meals (
        id,
        meal_index,
        diet_items (
          id,
          grams,
          foods (
            id,
            name,
            kcal_100,
            protein_100,
            carbs_100,
            fat_100
          )
        )
      )
    `)
    .eq("id", dietId)
    .maybeSingle();

  if (error || !data) return null;

  const meals: DietMeal[] = data.diet_meals.map((meal: any) => ({
    id: meal.id,
    meal_index: meal.meal_index,
    items: meal.diet_items.map((item: any) => ({
      id: item.id,
      grams: item.grams,
      food: item.foods,
    })),
  }));

  const totals = calculateDietTotals(meals);

  return {
    id: data.id,
    client_id: data.client_id,
    name: data.name,
    meals_count: data.meals_count,
    is_active: data.is_active,
    created_at: data.created_at,
    meals,
    totals: {
      kcal: Math.round(totals.kcal),
      protein: Number(totals.protein.toFixed(1)),
      carbs: Number(totals.carbs.toFixed(1)),
      fat: Number(totals.fat.toFixed(1)),
    },
  };
}

/* =========================
   SHARE: DIETA POR TOKEN
========================= */

export async function getSharedDietByToken(
  token: string
): Promise<{ diet: SharedDiet } | null> {
  const { data, error } = await supabase
    .from("diet_shares")
    .select(`
      diet_id,
      is_active,
      expires_at,
      diet:diets!diet_shares_diet_id_fkey (
        id,
        name,
        diet_meals (
          id,
          meal_index,
          diet_items (
            id,
            grams,
            foods (
              id,
              name,
              kcal_100,
              protein_100,
              carbs_100,
              fat_100
            )
          )
        )
      )
    `)
    .eq("token", token)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) return null;

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return null;
  }

  // ✅ AHORA SÍ: OBJETO, NO ARRAY
const diet = Array.isArray(data.diet) ? data.diet[0] : data.diet;
  if (!diet) return null;

  const meals: DietMeal[] = diet.diet_meals.map((meal: any) => ({
    id: meal.id,
    meal_index: meal.meal_index,
    items: meal.diet_items.map((item: any) => ({
      id: item.id,
      grams: item.grams,
      food: item.foods,
    })),
  }));

  const totals = calculateDietTotals(meals);

  return {
    diet: {
      id: diet.id,
      name: diet.name,
      meals,
      totals: {
        kcal: Math.round(totals.kcal),
        protein: Number(totals.protein.toFixed(1)),
        carbs: Number(totals.carbs.toFixed(1)),
        fat: Number(totals.fat.toFixed(1)),
      },
    },
  };
}
