// lib/foodsApi.ts
import { supabase } from "./supabaseClient";

export type Food = {
  id: string;
  name: string;
  kcal_100: number;
  protein_100: number;
  carbs_100: number;
  fat_100: number;
};

export async function getFoods(): Promise<Food[]> {
  const { data, error } = await supabase
    .from("foods")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching foods", error);
    throw error;
  }

  return data ?? [];
}
