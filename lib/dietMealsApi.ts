// lib/dietMealsApi.ts
import { supabase } from "./supabaseClient";

export type DietMeal = {
  id: string;
  diet_id: string;
  meal_index: number;
};

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
