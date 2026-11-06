import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { fetchEventAttendeesRaw, fetchEventDetailRaw, fetchJoinedEventsRaw } from "@/lib/api/events";
import { fetchPublicEventAttendeesRaw } from "@/lib/api/public-events";
import { unwrapList } from "@/lib/api/parse-list";
import { isDemoStaticUi } from "@/lib/demo-mode";
import {
  EVENTS_LIST_CACHE_TAG,
  eventDetailCacheTag,
} from "@/lib/events/cache-tags";
import { parseEventRegistrationDonationFromDetail } from "@/lib/events/event-donation";
import type { EventRegistrationDonationContext } from "@/lib/events/event-donation";
import { mapEventAttendeeRoster } from "@/lib/events/map-event-attendees";
import type { EventAttendeeRosterItem } from "@/lib/events/map-event-attendees";
import { mapEventDetail } from "@/lib/events/map-event-detail";
import { mapEventRow, sortEventsByStart } from "@/lib/events/map-event";
import type { EventListItem } from "@/types/events";

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

export async function getEventRegistrationDonationContext(
  eventId: string,
): Promise<EventRegistrationDonationContext> {
  "use cache: private";
  cacheLife("minutes");
  cacheTag(eventDetailCacheTag(eventId));

  if (isDemoStaticUi()) {
    return { available: false, settings: null, funds: [], defaultFundId: null };
  }

  const result = await fetchEventDetailRaw(eventId, { cacheable: true });
  return parseEventRegistrationDonationFromDetail(result.ok ? result.data : null);
}

export async function getEventAttendeeRoster(
  eventId: string,
  options: { isPublic: boolean },
): Promise<EventAttendeeRosterItem[]> {
  if (isDemoStaticUi()) return [];

  if (options.isPublic) {
    const open = await fetchPublicEventAttendeesRaw(eventId);
    if (open.ok && open.data) {
      const roster = mapEventAttendeeRoster(open.data);
      if (roster.length > 0) return roster;
    }
  }

  const authed = await fetchEventAttendeesRaw(eventId);
  if (!authed.ok || !authed.data) return [];
  return mapEventAttendeeRoster(authed.data);
}
