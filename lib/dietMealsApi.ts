import { supabase } from "./supabaseClient";

/* =========================
   TIPOS
========================= */

export type DietMeal = {
  id: string;
  diet_id: string;
  meal_index: number;
};

/* =========================
   CREAR COMIDA
========================= */
export async function createMeal(
  dietId: string,
  mealIndex: number
): Promise<DietMeal> {
  if (mealIndex < 0) {
    throw new Error("mealIndex debe ser mayor o igual a 0");
  }

  const { data, error } = await supabase
    .from("diet_meals")
    .insert({
      diet_id: dietId,
      meal_index: mealIndex,
    })
    .select()
    .single();

  if (error || !data) {
    console.error("Error creando diet_meal", {
      dietId,
      mealIndex,
      error,
    });
    throw error ?? new Error("No se pudo crear la comida");
  }

  return data as DietMeal;
}

/* =========================
   BORRAR COMIDA (CASCADE LÓGICO)
   - elimina suplementos
   - elimina items
   - elimina la comida
========================= */
export async function deleteMeal(
  mealId: string
): Promise<void> {
  // 1️⃣ suplementos
  const { error: supplementsError } = await supabase
    .from("diet_supplements")
    .delete()
    .eq("meal_id", mealId);

  if (supplementsError) {
    console.error(
      "Error borrando suplementos de la comida",
      { mealId, supplementsError }
    );
    throw supplementsError;
  }

  // 2️⃣ items (principales + sustituciones)
  const { error: itemsError } = await supabase
    .from("diet_items")
    .delete()
    .eq("meal_id", mealId);

  if (itemsError) {
    console.error(
      "Error borrando items de la comida",
      { mealId, itemsError }
    );
    throw itemsError;
  }

  // 3️⃣ comida
  const { error: mealError } = await supabase
    .from("diet_meals")
    .delete()
    .eq("id", mealId);

  if (mealError) {
    console.error(
      "Error borrando la comida",
      { mealId, mealError }
    );
    throw mealError;
  }
}

/* =========================
   OBTENER COMIDAS DE UNA DIETA
   (sin joins pesados)
========================= */
export async function getMealsByDiet(
  dietId: string
): Promise<DietMeal[]> {
  const { data, error } = await supabase
    .from("diet_meals")
    .select("*")
    .eq("diet_id", dietId)
    .order("meal_index", { ascending: true });

  if (error) {
    console.error(
      "Error obteniendo comidas de la dieta",
      { dietId, error }
    );
    throw error;
  }

  return data ?? [];
}
