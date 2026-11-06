import { API_BASE_URL } from "@/lib/api/config";

/** Turn API-relative media paths into absolute URLs for Next/Image. */
export function resolveStagingMediaUrl(url: string | null | undefined): string | null {
  if (url == null) return null;
  const value = url.trim();
  if (!value || value === "null" || value === "undefined") return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("//")) return `https:${value}`;
  try {
    const origin = new URL(API_BASE_URL).origin;
    if (value.startsWith("/")) return `${origin}${value}`;
    return `${origin}/${value}`;
  } catch {
    return value;
  }
}
