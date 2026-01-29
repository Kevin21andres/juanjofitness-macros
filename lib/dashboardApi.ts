import { supabase } from "./supabaseClient";

export async function getDashboardStats() {
  // Clientes
  const { count: clientsCount } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true });

  // Dietas
  const { count: dietsCount } = await supabase
    .from("diets")
    .select("*", { count: "exact", head: true });

  // Última dieta creada
  const { data: lastDiet } = await supabase
    .from("diets")
    .select("created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    clientsCount: clientsCount ?? 0,
    dietsCount: dietsCount ?? 0,
    lastActivity: lastDiet?.created_at ?? null,
  };
}
