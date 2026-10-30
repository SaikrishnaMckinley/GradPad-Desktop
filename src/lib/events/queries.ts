import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { fetchEventDetailRaw, fetchJoinedEventsRaw } from "@/lib/api/events";
import { unwrapList } from "@/lib/api/parse-list";
import { isDemoStaticUi } from "@/lib/demo-mode";
import {
  EVENTS_LIST_CACHE_TAG,
  eventDetailCacheTag,
} from "@/lib/events/cache-tags";
import { mapEventDetail } from "@/lib/events/map-event-detail";
import { mapEventRow, sortEventsByStart } from "@/lib/events/map-event";
import type { EventListItem, EventRailItem } from "@/types/events";

export async function getJoinedEvents(): Promise<EventListItem[]> {
  "use cache: private";
  cacheLife("minutes");
  cacheTag(EVENTS_LIST_CACHE_TAG);

  if (isDemoStaticUi()) return [];

  const result = await fetchJoinedEventsRaw({ cacheable: true });
  if (!result.ok || !result.data) return [];

  const mapped = unwrapList(result.data)
    .map(mapEventRow)
    .filter((e): e is EventListItem => e != null);

  return sortEventsByStart(mapped);
}

export async function getEventDetail(eventId: string) {
  "use cache: private";
  cacheLife("minutes");
  cacheTag(EVENTS_LIST_CACHE_TAG);
  cacheTag(eventDetailCacheTag(eventId));

  if (isDemoStaticUi()) return null;
  const result = await fetchEventDetailRaw(eventId, { cacheable: true });
  if (!result.ok || !result.data) return null;
  return mapEventDetail(result.data);
}

export async function getUpcomingEventsPreview(limit = 4): Promise<EventRailItem[]> {
  const joined = await getJoinedEvents();
  return joined.slice(0, limit).map((e) => ({
    id: e.id,
    title: e.title,
    startAt: e.startAt,
  }));
}
