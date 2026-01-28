import { supabase } from "./supabaseClient";

/* =========================
   TIPOS BASE
========================= */

export type Client = {
  id: string;
  name: string;
  email?: string | null;
  notes?: string | null;
  created_at: string;
};

export type DietTotals = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type CurrentDiet = {
  id: string;
  name: string;
  created_at: string;
  totals: DietTotals;
};

export type ClientWithDiet = Client & {
  currentDiet: CurrentDiet | null;
};

/* =========================
   CLIENTES
========================= */

export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/* =========================
   CLIENTES + DIETA ACTIVA + TOTALES
========================= */

export async function getClientsWithCurrentDiet(): Promise<ClientWithDiet[]> {
  const { data, error } = await supabase
    .from("clients")
    .select(`
      id,
      name,
      email,
      notes,
      created_at,
      diets (
        id,
        name,
        created_at,
        is_active,
        diet_meals (
          id,
          diet_items (
            grams,
            foods (
              kcal_100,
              protein_100,
              carbs_100,
              fat_100
            )
          )
        )
      )
    `);

  if (error) throw error;

  return (data ?? []).map((client: any) => {
    const activeDiet = client.diets?.find(
      (d: any) => d.is_active
    );

    if (!activeDiet) {
      return {
        id: client.id,
        name: client.name,
        email: client.email,
        notes: client.notes,
        created_at: client.created_at,
        currentDiet: null,
      };
    }

    // 🔢 CALCULAR TOTALES
    const totals = activeDiet.diet_meals.reduce(
      (acc: DietTotals, meal: any) => {
        meal.diet_items.forEach((item: any) => {
          const f = item.foods;
          const factor = item.grams / 100;

          acc.kcal += f.kcal_100 * factor;
          acc.protein += f.protein_100 * factor;
          acc.carbs += f.carbs_100 * factor;
          acc.fat += f.fat_100 * factor;
        });
        return acc;
      },
      { kcal: 0, protein: 0, carbs: 0, fat: 0 }
    );

    return {
      id: client.id,
      name: client.name,
      email: client.email,
      notes: client.notes,
      created_at: client.created_at,
      currentDiet: {
        id: activeDiet.id,
        name: activeDiet.name,
        created_at: activeDiet.created_at,
        totals: {
          kcal: Math.round(totals.kcal),
          protein: Number(totals.protein.toFixed(1)),
          carbs: Number(totals.carbs.toFixed(1)),
          fat: Number(totals.fat.toFixed(1)),
        },
      },
    };
  });
}

/* =========================
   CLIENTE INDIVIDUAL
========================= */

export async function getClient(id: string): Promise<Client> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

/* =========================
   CREAR / ACTUALIZAR
========================= */

export async function createClient(payload: {
  name: string;
  email?: string;
  notes?: string;
}) {
  const { error } = await supabase.from("clients").insert(payload);
  if (error) throw error;
}

export async function updateClient(
  id: string,
  payload: {
    name: string;
    email?: string;
    notes?: string;
  }
) {
  const { error } = await supabase
    .from("clients")
    .update(payload)
    .eq("id", id);

  if (error) throw error;
}
