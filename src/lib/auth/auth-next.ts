"use client";

const AUTH_NEXT_KEY = "gradpad_auth_next";

export function storeAuthNextPath(path: string) {
  if (typeof window === "undefined") return;
  if (!path.startsWith("/")) return;
  sessionStorage.setItem(AUTH_NEXT_KEY, path);
}

export function readAuthNextPath(): string | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(AUTH_NEXT_KEY);
  if (!raw || !raw.startsWith("/")) return null;
  return raw;
}

export function clearAuthNextPath() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(AUTH_NEXT_KEY);
}
