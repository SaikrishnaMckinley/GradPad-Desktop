import "server-only";

import { publicFetchJson } from "@/lib/api/public-fetch";

export async function fetchPublicEventRaw(eventId: string) {
  return publicFetchJson<Record<string, unknown>>(`events/open/${eventId}/`);
}

export async function fetchPublicEventAttendeesRaw(eventId: string) {
  return publicFetchJson<unknown>(`events/open/${eventId}/attendees/`);
}
