import { API_BASE_URL } from "@/lib/api/config";

function mediaOrigin(): string {
  const base = API_BASE_URL.replace(/\/?$/, "");
  return base.replace(/\/api\/?$/i, "");
}

export function resolveEventImageUrl(source: Record<string, unknown> | null | undefined): string | null {
  if (!source) return null;
  const candidates = [source.image, source.event_image, source.image_url, source.banner, source.cover];
  for (const raw of candidates) {
    if (typeof raw !== "string") continue;
    const trimmed = raw.trim();
    if (!trimmed || trimmed === "null" || trimmed === "undefined") continue;
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
    const origin = mediaOrigin();
    if (trimmed.startsWith("/")) return `${origin}${trimmed}`;
    return `${origin}/${trimmed}`;
  }
  return null;
}
