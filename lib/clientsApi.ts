import { supabase } from "./supabaseClient";

export type Client = {
  id: string;
  name: string;
  email?: string | null;
  notes?: string | null;
  created_at: string;
};

export type ClientWithDiet = Client & {
  currentDiet?: {
    id: string;
    name: string;
    created_at: string;
  } | null;
};

export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

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
        is_active
      )
    `)
    .order("created_at", {
      foreignTable: "diets",
      ascending: false,
    });

  if (error) throw error;

  return (data ?? []).map((client: any) => ({
    id: client.id,
    name: client.name,
    email: client.email,
    notes: client.notes,
    created_at: client.created_at,
    currentDiet:
      client.diets?.find((d: any) => d.is_active) ?? null,
  }));
}

export async function getClient(id: string): Promise<Client> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

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
