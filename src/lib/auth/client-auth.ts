"use client";

import { clearTokens, persistTokens } from "@/lib/auth/token-storage";

async function postAuthJson<T extends Record<string, unknown>>(
  path: string,
  body: Record<string, unknown>,
): Promise<{ ok: true; data: T } | { error: string }> {
  try {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await response.json()) as T & { error?: string };
    if (!response.ok) {
      return { error: data.error ?? "Request failed. Please try again." };
    }
    return { ok: true, data };
  } catch {
    return { error: "Network error. Please try again." };
  }
}

function applySessionFromResponse(data: {
  access?: string | null;
  refresh?: string | null;
}) {
  if (data.access) {
    persistTokens(data.access, data.refresh ?? undefined);
  }
}

export async function signInWithEmail(input: { email: string; password: string }) {
  const result = await postAuthJson<{
    ok?: boolean;
    access?: string;
    refresh?: string | null;
    error?: string;
  }>("/api/auth/login", input);

  if ("error" in result) {
    return { error: result.error };
  }

  applySessionFromResponse(result.data);
  return { success: true as const };
}

export async function signUpWithEmail(input: {
  fullName: string;
  email: string;
  password: string;
}) {
  const parts = input.fullName.trim().split(/\s+/);
  const first_name = parts[0] ?? "";
  const last_name = parts.slice(1).join(" ") || first_name;

  const result = await postAuthJson<{ error?: string }>("/api/auth/signup", {
    first_name,
    last_name,
    email: input.email,
    password: input.password,
  });

  if ("error" in result) {
    return { error: result.error };
  }

  return { success: true as const, needsOtp: true as const, email: input.email };
}

export async function verifySignupOtp(input: { email: string; otp: string }) {
  const result = await postAuthJson<{
    access?: string | null;
    refresh?: string | null;
    error?: string;
  }>("/api/auth/verify-otp", {
    email: input.email,
    otp: input.otp,
  });

  if ("error" in result) {
    return { error: result.error };
  }

  applySessionFromResponse(result.data);
  return { success: true as const };
}

export async function resendSignupOtp(input: {
  email: string;
  password: string;
  fullName: string;
}) {
  const parts = input.fullName.trim().split(/\s+/);
  const first_name = parts[0] ?? "";
  const last_name = parts.slice(1).join(" ") || first_name;

  const result = await postAuthJson<{ error?: string }>("/api/auth/resend-otp", {
    email: input.email,
    password: input.password,
    first_name,
    last_name,
  });

  if ("error" in result) {
    return { error: result.error };
  }

  return { success: true as const };
}

export async function signOutClient() {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    /* ignore */
  }
  clearTokens();
}

export async function requestPasswordResetEmail(email: string) {
  const result = await postAuthJson<{ error?: string }>("/api/auth/password/reset", {
    email,
  });

  if ("error" in result) {
    return { error: result.error };
  }

  return { success: true as const };
}

export async function updatePassword(newPassword: string) {
  const result = await postAuthJson<{ error?: string }>("/api/auth/password/change", {
    new_password: newPassword,
    password: newPassword,
  });

  if ("error" in result) {
    return { error: result.error };
  }

  return { success: true as const };
}
