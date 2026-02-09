// app/lib/dietSupplementsApi.ts
import { supabase } from "./supabaseClient";

/* =========================
   TIPOS
========================= */

export type DietSupplement = {
  id: string;
  meal_id: string;
  name: string;
  amount: number | null;
  unit: string | null;   // g, mg, caps, scoop, units, ml…
  timing: string | null; // pre, post, intra, noche…
  notes: string | null;
  created_at: string;
};

export type DietSupplementInsert = {
  mealId: string;
  name: string;
  amount?: number;
  unit?: string;
  timing?: string;
  notes?: string;
};

/* =========================
   CREAR SUPLEMENTO
========================= */
export async function createDietSupplement(
  data: DietSupplementInsert
): Promise<DietSupplement> {
  const { data: result, error } = await supabase
    .from("diet_supplements")
    .insert({
      meal_id: data.mealId,
      name: data.name.trim(),
      amount: data.amount ?? null,
      unit: data.unit ?? null,
      timing: data.timing ?? null,
      notes: data.notes ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("createDietSupplement error:", error);
    throw error;
  }

  return result;
}

/* =========================
   OBTENER SUPLEMENTOS DE UNA COMIDA
========================= */
export async function getSupplementsByMeal(
  mealId: string
): Promise<DietSupplement[]> {
  const { data, error } = await supabase
    .from("diet_supplements")
    .select("*")
    .eq("meal_id", mealId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getSupplementsByMeal error:", error);
    throw error;
  }

  return data ?? [];
}

/* =========================
   BORRAR SUPLEMENTOS DE UNA COMIDA
   (útil para duplicar dietas)
========================= */
export async function deleteSupplementsByMeal(
  mealId: string
) {
  const { error } = await supabase
    .from("diet_supplements")
    .delete()
    .eq("meal_id", mealId);

  if (error) {
    console.error("deleteSupplementsByMeal error:", error);
    throw error;
  }
}
