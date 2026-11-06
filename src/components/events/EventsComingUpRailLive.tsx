"use client";

import { useMemo } from "react";
import { EventsComingUpRail } from "@/components/events/EventsComingUpRail";
import { buildEventsRailPreview } from "@/lib/events/events-rail-preview";
import type { EventListItem } from "@/types/events";

type Props = {
  events: Pick<EventListItem, "id" | "title" | "startAt">[];
  limit?: number;
};

/** Client-only: uses current time for “this week” / upcoming filters. */
export function EventsComingUpRailLive({ events, limit = 3 }: Props) {
  const preview = useMemo(() => buildEventsRailPreview(events, limit), [events, limit]);
  return <EventsComingUpRail preview={preview} />;
}
