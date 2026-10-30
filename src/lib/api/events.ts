import "server-only";

import { serverFetchJson } from "@/lib/api/server-fetch";

export async function fetchJoinedEventsRaw(options?: { cacheable?: boolean }) {
  return serverFetchJson<unknown>("events/joined/", {}, options);
}

export async function fetchCommunityPastEventsRaw(communityId: string, days?: number) {
  const qs = days != null ? `?days=${days}` : "";
  return serverFetchJson<unknown>(`community/${communityId}/events/past/${qs}`);
}

export async function fetchEventDetailRaw(
  eventId: string,
  options?: { cacheable?: boolean },
) {
  return serverFetchJson<unknown>(`events/${eventId}/`, {}, options);
}

export async function stagingCreateEventRaw(communityId: string, body: FormData) {
  return serverFetchJson<unknown>(`community/${communityId}/event/`, {
    method: "POST",
    body,
  });
}

export async function stagingPatchEventRaw(eventId: string, body: FormData) {
  return serverFetchJson<unknown>(`events/${eventId}/`, {
    method: "PATCH",
    body,
  });
}

export async function stagingDeleteEventRaw(eventId: string) {
  return serverFetchJson<unknown>(`events/${eventId}/`, {
    method: "DELETE",
  });
}

export async function fetchEventStatisticsRaw(eventId: string) {
  return serverFetchJson<unknown>(`events/${eventId}/statistics/`);
}

export async function fetchEventAttendeesRaw(eventId: string) {
  return serverFetchJson<unknown>(`events/${eventId}/attendees/`);
}

export async function stagingQrCheckInRaw(qr_data: string) {
  return serverFetchJson<unknown>("events/payments/qr-check-in/", {
    method: "POST",
    body: JSON.stringify({ qr_data }),
  });
}

export async function stagingManualCheckInRaw(event_id: string, email: string) {
  return serverFetchJson<unknown>("events/payments/manual-check-in/", {
    method: "POST",
    body: JSON.stringify({ event_id, email }),
  });
}
