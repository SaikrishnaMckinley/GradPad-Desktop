const ACCESS_KEY = "gradpad_access_token";
const REFRESH_KEY = "gradpad_refresh_token";
const COOKIE_NAME = "gradpad_access_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function persistTokens(access: string, refresh?: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(access)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

export function hasSessionToken(): boolean {
  return Boolean(getAccessToken());
}
