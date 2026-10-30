"use server";

import { redirect } from "next/navigation";
import { mapAuthErrorMessage } from "@/lib/auth/errors";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { signUpSchema } from "@/lib/validations/auth";

export type RegisterState = { error?: string } | null;

/**
 * Creates the user in Supabase Auth with email already confirmed (no verification email),
 * then opens a session via sign-in. Requires SUPABASE_SERVICE_ROLE_KEY on the server.
 */
export async function registerAccount(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  if (!isSupabaseAdminConfigured()) {
    return {
      error:
        "Server signup is not configured. Add SUPABASE_SERVICE_ROLE_KEY to .env.local (Supabase → Project Settings → API → service_role), then restart the dev server.",
    };
  }

  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const admin = createAdminClient();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { full_name: parsed.data.fullName },
  });

  if (createError) {
    const msg = createError.message.toLowerCase();
    if (msg.includes("already") || msg.includes("registered")) {
      return { error: "An account with this email already exists. Try signing in." };
    }
    return { error: mapAuthErrorMessage(createError.message, createError.code) };
  }

  if (!created.user) {
    return { error: "Account could not be created. Please try again." };
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (signInError) {
    return {
      error:
        "Account was created but sign-in failed. Try logging in with your email and password.",
    };
  }

  redirect("/home");
}
