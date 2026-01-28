import { supabase } from "./supabaseClient";

/* =========================
   TIPOS
========================= */

export type Diet = {
  id: string;
  client_id: string;
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

export type DietDetail = Diet & {
  meals: DietMeal[];
};

/* =========================
   CREAR DIETA VERSIONADA
========================= */

export async function createDietVersion(params: {
  clientId: string;
  name: string;
  mealsCount: number;
}) {
  // 🔒 Desactivar SOLO dietas activas anteriores
  await supabase
    .from("diets")
    .update({ is_active: false })
    .eq("client_id", params.clientId)
    .eq("is_active", true);

  // ➕ Crear nueva dieta activa
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
   (ROBUSTO: evita error PGRST116)
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
   DETALLE COMPLETO DE UNA DIETA
   (COMIDAS + ITEMS + ALIMENTOS)
========================= */

export async function getDietDetail(
  dietId: string
): Promise<DietDetail> {
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
    .single();

  if (error) throw error;

  return {
    id: data.id,
    client_id: data.client_id,
    name: data.name,
    meals_count: data.meals_count,
    is_active: data.is_active,
    created_at: data.created_at,
    meals: data.diet_meals.map((meal: any) => ({
      id: meal.id,
      meal_index: meal.meal_index,
      items: meal.diet_items.map((item: any) => ({
        id: item.id,
        grams: item.grams,
        food: item.foods,
      })),
    })),
  };
}
