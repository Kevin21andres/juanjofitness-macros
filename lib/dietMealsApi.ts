import { supabase } from "./supabaseClient";

export async function createMeal(
  dietId: string,
  mealIndex: number
) {
  const { data, error } = await supabase
    .from("diet_meals")
    .insert({
      diet_id: dietId,
      meal_index: mealIndex,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
