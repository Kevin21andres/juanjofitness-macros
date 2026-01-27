import { supabase } from "./supabaseClient";

export async function createDietVersion(params: {
  clientId: string;
  name: string;
  mealsCount: number;
}) {
  // 1️⃣ desactivar dietas anteriores
  await supabase
    .from("diets")
    .update({ is_active: false })
    .eq("client_id", params.clientId);

  // 2️⃣ crear nueva dieta
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
  return data;
}
