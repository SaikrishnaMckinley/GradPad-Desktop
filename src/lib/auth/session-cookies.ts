import "server-only";

import { cookies } from "next/headers";

export const ACCESS_COOKIE = "gradpad_access_token";
export const REFRESH_COOKIE = "gradpad_refresh_token";

const ACCESS_MAX_AGE = 60 * 60 * 24 * 7;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;

export async function getSessionTokens(): Promise<{
  access: string | null;
  refresh: string | null;
}> {
  const store = await cookies();
  const accessRaw = store.get(ACCESS_COOKIE)?.value;
  const refreshRaw = store.get(REFRESH_COOKIE)?.value;
  return {
    access: accessRaw ? decodeURIComponent(accessRaw) : null,
    refresh: refreshRaw ? decodeURIComponent(refreshRaw) : null,
  };
}

export async function setSessionTokens(access: string, refresh?: string) {
  const store = await cookies();
  store.set(ACCESS_COOKIE, encodeURIComponent(access), {
    path: "/",
    maxAge: ACCESS_MAX_AGE,
    sameSite: "lax",
    httpOnly: false,
  });
  if (refresh) {
    store.set(REFRESH_COOKIE, encodeURIComponent(refresh), {
      path: "/",
      maxAge: REFRESH_MAX_AGE,
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
  }
}

export async function clearSessionTokens() {
  const store = await cookies();
  store.set(ACCESS_COOKIE, "", { path: "/", maxAge: 0 });
  store.set(REFRESH_COOKIE, "", { path: "/", maxAge: 0, httpOnly: true });
}
