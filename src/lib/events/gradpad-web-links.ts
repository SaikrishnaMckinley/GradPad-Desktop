/** Full web app URLs for flows not yet ported to desktop (manage / edit). */
export function gradpadWebOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_GRADPAD_WEB_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return "https://app.gradpad.io";
}

export function gradpadWebEventEditUrl(eventId: string): string {
  return `${gradpadWebOrigin()}/events/${eventId}/edit`;
}

export function gradpadWebEventManageUrl(eventId: string, communityId?: string | null): string {
  const base = `${gradpadWebOrigin()}/events/${eventId}/manage`;
  if (!communityId) return base;
  return `${base}?communityId=${encodeURIComponent(communityId)}`;
}
