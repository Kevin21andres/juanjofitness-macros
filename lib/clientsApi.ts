import { supabase } from "./supabaseClient";

/* =========================
   TIPOS BASE (ALINEADOS BD)
========================= */

export type Client = {
  id: string;
  user_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
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
   UTILIDAD: CALCULAR TOTALES
========================= */

function calculateDietTotals(dietDays: any[]): DietTotals {
  return dietDays.reduce(
    (acc: DietTotals, day: any) => {
      day.meals?.forEach((meal: any) => {
        meal.meal_foods?.forEach((item: any) => {
          const food = item.foods;
          if (!food) return;

          const factor = item.grams / 100;

          acc.kcal += food.kcal_100 * factor;
          acc.protein += food.protein_100 * factor;
          acc.carbs += food.carbs_100 * factor;
          acc.fat += food.fat_100 * factor;
        });
      });
      return acc;
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

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
      user_id,
      name,
      email,
      phone,
      notes,
      created_at,
      updated_at,
      diets (
        id,
        name,
        created_at,
        is_active,
        diet_days (
          meals (
            meal_foods (
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
      )
    `);

  if (error) throw error;

  return (data ?? []).map((client: any) => {
    const activeDiet = client.diets?.find(
      (d: any) => d.is_active === true
    );

    if (!activeDiet) {
      return {
        ...client,
        currentDiet: null,
      };
    }

    const totals = calculateDietTotals(activeDiet.diet_days ?? []);

    return {
      ...client,
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
   CREAR CLIENTE
========================= */

export async function createClient(payload: {
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
}) {
  const { error } = await supabase.from("clients").insert({
    name: payload.name,
    email: payload.email ?? null,
    phone: payload.phone ?? null,
    notes: payload.notes ?? null,
  });

  if (error) throw error;
}

/* =========================
   ACTUALIZAR CLIENTE
========================= */

export async function updateClient(
  id: string,
  payload: {
    name: string;
    email: string | null;
    phone: string | null;
    notes: string | null;
  }
) {
  const { error } = await supabase
    .from("clients")
    .update({
      name: payload.name,
      email: payload.email ?? null,
      phone: payload.phone ?? null,
      notes: payload.notes ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}
