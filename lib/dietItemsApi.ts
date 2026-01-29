import { supabase } from "./supabaseClient";

export type DietItemInsert = {
  mealId: string;
  foodId: string;
  grams: number;
};

export async function createDietItem(
  mealId: string,
  foodId: string,
  grams: number
): Promise<void> {
  if (grams <= 0) {
    throw new Error("La cantidad de gramos debe ser mayor que 0");
  }

  const { error } = await supabase
    .from("diet_items")
    .insert({
      meal_id: mealId,
      food_id: foodId,
      grams,
    });

  if (error) {
    console.error("Error creando diet_item", {
      mealId,
      foodId,
      grams,
      error,
    });
    throw error;
  }
}
