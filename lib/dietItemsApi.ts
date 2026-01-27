import { supabase } from "./supabaseClient";

export async function createDietItem(
  mealId: string,
  foodId: string,
  grams: number
) {
  const { error } = await supabase
    .from("diet_items")
    .insert({
      meal_id: mealId,
      food_id: foodId,
      grams,
    });

  if (error) throw error;
}
