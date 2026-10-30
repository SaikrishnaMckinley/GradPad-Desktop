import { createClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";
import { isServiceRoleJwt } from "@/lib/supabase/validate-service-key";

export function isSupabaseAdminConfigured(): boolean {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(getSupabaseUrl() && key && isServiceRoleJwt(key) && getSupabaseAnonKey());
}

/** Server-only Supabase client with service role — never import from client components. */
export function createAdminClient() {
  const url = getSupabaseUrl();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Add it to .env.local (server-only) for signup without verification emails.",
    );
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
