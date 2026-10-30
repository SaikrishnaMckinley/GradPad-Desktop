"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  EVENTS_INVALIDATE_EVENT,
  invalidateEventsCache,
  writeEventsListCache,
} from "@/lib/events/events-cache";
import { EventCalendarDemo } from "@/components/events/EventCalendarDemo";
import { EventCalendarView } from "@/components/events/EventCalendarView";
import { EventFeedDemo } from "@/components/events/EventFeedDemo";
import { EventFeedList } from "@/components/events/EventFeedList";
import { EventsViewToggle } from "@/components/events/EventsViewToggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { EventListItem } from "@/types/events";

type Props = {
  stagingApi: boolean;
  initialEvents: EventListItem[];
};

export function EventsPageClient({ stagingApi, initialEvents }: Props) {
  const [view, setView] = useState<"feed" | "calendar">("feed");

  const upcomingEvents = useMemo(() => {
    if (!stagingApi) return [];
    const now = Date.now() - 86_400_000;
    return initialEvents.filter((e) => new Date(e.startAt).getTime() >= now);
  }, [initialEvents, stagingApi]);

  const railPreview = useMemo(
    () =>
      initialEvents.slice(0, 3).map((e) => ({
        id: e.id,
        title: e.title,
        startAt: e.startAt,
      })),
    [initialEvents],
  );

  useEffect(() => {
    if (!stagingApi) return;
    writeEventsListCache(initialEvents, railPreview);
  }, [stagingApi, initialEvents, railPreview]);

  useEffect(() => {
    const onInvalidate = (event: Event) => {
      const eventId = (event as CustomEvent<{ eventId?: string }>).detail?.eventId;
      invalidateEventsCache(eventId);
    };
    window.addEventListener(EVENTS_INVALIDATE_EVENT, onInvalidate);
    return () => window.removeEventListener(EVENTS_INVALIDATE_EVENT, onInvalidate);
  }, []);

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your events</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep up with everything happening across your communities.
          </p>
        </div>
        <Link
          href="/create?tab=event"
          className={cn(buttonVariants(), "shrink-0")}
        >
          + Create
        </Link>
      </div>

      <EventsViewToggle view={view} onChange={setView} />

      {view === "feed" ? (
        stagingApi ? (
          <EventFeedList events={upcomingEvents} />
        ) : (
          <EventFeedDemo />
        )
      ) : stagingApi ? (
        <EventCalendarView events={initialEvents} />
      ) : (
        <EventCalendarDemo />
      )}
    </>
  );
}
