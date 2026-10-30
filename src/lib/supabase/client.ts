import { createBrowserClient } from "@supabase/ssr";
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured as isConfigured,
} from "@/lib/supabase/env";

export function createClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();

  if (!url || !key) {
    throw new Error(
      "Missing Supabase env vars. Copy .env.example to .env.local and set NEXT_PUBLIC_SUPABASE_URL plus NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return createBrowserClient(url, key);
}

export { isConfigured as isSupabaseConfigured };
