"use client";

import { useState } from "react";
import { EventCalendarDemo } from "@/components/events/EventCalendarDemo";
import { EventFeedDemo } from "@/components/events/EventFeedDemo";
import { EventsViewToggle } from "@/components/events/EventsViewToggle";
import { Button } from "@/components/ui/button";

export function EventsPageClient() {
  const [view, setView] = useState<"feed" | "calendar">("feed");

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your events</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep up with everything happening across your communities.
          </p>
        </div>
        <Button className="shrink-0">+ Create</Button>
      </div>

      <EventsViewToggle view={view} onChange={setView} />

      {view === "feed" ? <EventFeedDemo /> : <EventCalendarDemo />}
    </>
  );
}
