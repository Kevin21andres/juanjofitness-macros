// lib/supabaseClient.ts

import { createBrowserClient } from "@supabase/ssr";
import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL no está definida"
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY no está definida"
  );
}

/*
 * Cliente Supabase compartido.
 *
 * Navegador:
 * - createBrowserClient()
 * - utiliza la sesión almacenada en cookies
 * - las peticiones autenticadas incluyen la sesión de Juanjo
 *
 * Servidor:
 * - createClient() con la anon key
 * - sin persistencia de sesión
 * - válido para recursos públicos como get_shared_diet()
 */
function createSupabaseClient(): SupabaseClient {
  if (typeof window !== "undefined") {
    return createBrowserClient(
      supabaseUrl,
      supabaseAnonKey
    );
  }

  return createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}

export const supabase =
  createSupabaseClient();