import { siteOrigin } from "@/lib/events/site-url";

export function buildEventInviteUrl(eventId: string, origin = siteOrigin()): string {
  return `${origin.replace(/\/$/, "")}/events/${eventId}`;
}

async function writeTextToClipboard(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      /* fallback */
    }
  }
  if (typeof document === "undefined") return;
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export async function copyEventLinkToClipboard(eventId: string): Promise<string> {
  const url = buildEventInviteUrl(eventId);
  await writeTextToClipboard(url);
  return url;
}

export async function shareEventLink(eventId: string, title?: string): Promise<"shared" | "copied"> {
  const url = buildEventInviteUrl(eventId);
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ url, title: title?.trim() || "Grad Pad event" });
      return "shared";
    } catch (err) {
      if ((err as Error)?.name === "AbortError") throw err;
    }
  }
  await writeTextToClipboard(url);
  return "copied";
}
