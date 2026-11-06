import type { EventRegistrationTicketView } from "@/lib/events/map-event-tickets";

const key = (eventId: string) => `gradpad_event_reg_status_${eventId}`;

export function readRegistrationStatusCache(
  eventId: string,
): EventRegistrationTicketView | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(key(eventId));
    if (!raw) return null;
    return JSON.parse(raw) as EventRegistrationTicketView;
  } catch {
    return null;
  }
}

export function writeRegistrationStatusCache(
  eventId: string,
  data: EventRegistrationTicketView | null,
): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    if (!data) {
      sessionStorage.removeItem(key(eventId));
      return;
    }
    sessionStorage.setItem(key(eventId), JSON.stringify(data));
  } catch {
    /* quota / private mode */
  }
}
