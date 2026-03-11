import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function buildClient(): SupabaseClient<Database> | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "[Athenaeum] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing. " +
        "The app will run on mock data. Copy .env.example to .env.local and fill in your Supabase credentials.",
    );
    return null;
  }
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}

export const supabase = buildClient();
