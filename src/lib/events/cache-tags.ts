export const EVENTS_LIST_CACHE_TAG = "gradpad-events-list";

export function eventDetailCacheTag(eventId: string) {
  return `gradpad-event-${eventId}`;
}
