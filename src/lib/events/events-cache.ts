import type { EventDetailViewModel } from "@/lib/events/map-event-detail";
import type { EventListItem, EventRailItem } from "@/types/events";

const LIST_KEY = "gradpad:events:list:v1";
const DETAIL_PREFIX = "gradpad:events:detail:";
const MAX_AGE_MS = 1000 * 60 * 30;

export type EventsListCache = {
  savedAt: number;
  joinedEvents: EventListItem[];
  railPreview: EventRailItem[];
};

type StoredDetail = { savedAt: number; event: EventDetailViewModel };

const listMemory: { payload: EventsListCache | null } = { payload: null };
const detailMemory = new Map<string, EventDetailViewModel>();
let lastDetailId: string | null = null;

function detailStorageKey(eventId: string) {
  return `${DETAIL_PREFIX}${eventId}`;
}

export function readEventsListCache(): EventsListCache | null {
  const mem = listMemory.payload;
  if (mem && Date.now() - mem.savedAt <= MAX_AGE_MS) return mem;

  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(LIST_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as EventsListCache;
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      sessionStorage.removeItem(LIST_KEY);
      listMemory.payload = null;
      return null;
    }
    listMemory.payload = parsed;
    return parsed;
  } catch {
    return null;
  }
}

export function writeEventsListCache(
  joinedEvents: EventListItem[],
  railPreview: EventRailItem[],
) {
  const payload: EventsListCache = {
    savedAt: Date.now(),
    joinedEvents,
    railPreview,
  };
  listMemory.payload = payload;
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(LIST_KEY, JSON.stringify(payload));
  } catch {
    /* quota */
  }
}

export function readEventDetailCache(eventId: string): EventDetailViewModel | null {
  const mem = detailMemory.get(eventId);
  if (mem) return mem;

  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(detailStorageKey(eventId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredDetail;
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      sessionStorage.removeItem(detailStorageKey(eventId));
      return null;
    }
    detailMemory.set(eventId, parsed.event);
    return parsed.event;
  } catch {
    return null;
  }
}

export function writeEventDetailCache(event: EventDetailViewModel) {
  detailMemory.set(event.id, event);
  lastDetailId = event.id;
  if (typeof sessionStorage === "undefined") return;
  try {
    const stored: StoredDetail = { savedAt: Date.now(), event };
    sessionStorage.setItem(detailStorageKey(event.id), JSON.stringify(stored));
  } catch {
    /* quota */
  }
}

/** Detail cache for the event id in the URL while the server segment loads. */
export function resolveEventDetailFallback(eventId: string): EventDetailViewModel | null {
  const cached = readEventDetailCache(eventId);
  if (cached) return cached;
  if (lastDetailId === eventId) {
    return detailMemory.get(eventId) ?? null;
  }
  return null;
}

export function invalidateEventsCache(eventId?: string) {
  listMemory.payload = null;
  if (typeof sessionStorage !== "undefined") {
    try {
      sessionStorage.removeItem(LIST_KEY);
    } catch {
      /* ignore */
    }
  }

  if (eventId) {
    detailMemory.delete(eventId);
    if (typeof sessionStorage !== "undefined") {
      try {
        sessionStorage.removeItem(detailStorageKey(eventId));
      } catch {
        /* ignore */
      }
    }
    return;
  }

  detailMemory.clear();
  lastDetailId = null;
  if (typeof sessionStorage === "undefined") return;
  try {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(DETAIL_PREFIX)) keys.push(key);
    }
    for (const key of keys) sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export const EVENTS_INVALIDATE_EVENT = "gradpad:events-invalidate";

export function notifyEventsInvalidate(eventId?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(EVENTS_INVALIDATE_EVENT, { detail: { eventId } }),
  );
}
