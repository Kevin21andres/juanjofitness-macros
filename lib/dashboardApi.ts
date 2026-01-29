import { supabase } from "./supabaseClient";

type DashboardStats = {
  clientsCount: number;
  dietsCount: number;
  lastActivity: string | null;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    { count: clientsCount, error: clientsError },
    { count: dietsCount, error: dietsError },
    { data: lastDiet, error: lastDietError },
  ] = await Promise.all([
    supabase
      .from("clients")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("diets")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("diets")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (clientsError || dietsError || lastDietError) {
    console.error("Error loading dashboard stats", {
      clientsError,
      dietsError,
      lastDietError,
    });
  }

  return {
    clientsCount: clientsCount ?? 0,
    dietsCount: dietsCount ?? 0,
    lastActivity: lastDiet?.created_at ?? null,
  };
}
