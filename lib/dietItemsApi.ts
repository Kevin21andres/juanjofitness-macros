import { supabase } from "./supabaseClient";

/* =========================
   TIPOS
========================= */

export type DietItem = {
  id: string;
  meal_id: string;
  food_id: string;
  grams: number;
  role: "main" | "substitute";
  parent_item_id: string | null;
};

/* =========================
   CREAR ITEM DE DIETA
   → DEVUELVE EL ITEM CREADO
========================= */

export async function createDietItem(
  mealId: string,
  foodId: string,
  grams: number,
  role: "main" | "substitute" = "main",
  parentItemId: string | null = null
): Promise<DietItem> {
  if (grams <= 0) {
    throw new Error("La cantidad de gramos debe ser mayor que 0");
  }

  const { data, error } = await supabase
    .from("diet_items")
    .insert({
      meal_id: mealId,
      food_id: foodId,
      grams,
      role,
      parent_item_id: parentItemId,
    })
    .select()
    .single();

  if (error || !data) {
    console.error("Error creando diet_item", {
      mealId,
      foodId,
      grams,
      role,
      parentItemId,
      error,
    });
    throw error ?? new Error("No se pudo crear diet_item");
  }

  return data as DietItem;
}
