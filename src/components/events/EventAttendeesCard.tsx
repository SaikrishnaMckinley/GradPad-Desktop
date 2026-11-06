"use client";

import { useState } from "react";
import { ChevronDown, UserPlus } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import type { EventAttendeeRosterItem } from "@/lib/events/map-event-attendees";
import { cn } from "@/lib/utils/cn";

type Props = {
  attendees?: EventAttendeeRosterItem[];
  attendeeCount: number;
  capacity: number | null;
  spotsLabel: string;
};

const COLLAPSED_LIMIT = 8;

export function EventAttendeesCard({
  attendees = [],
  attendeeCount,
  capacity,
  spotsLabel,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const count = attendeeCount > 0 ? attendeeCount : attendees.length;
  const visible =
    expanded || attendees.length <= COLLAPSED_LIMIT
      ? attendees
      : attendees.slice(0, COLLAPSED_LIMIT);
  const hiddenCount = attendees.length - visible.length;

  return (
    <Card className="p-6 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Attendees
          </h2>
          <p className="mt-1 text-sm text-foreground">
            {count > 0 ? (
              <>
                <span className="font-semibold">{count}</span> attending
                {capacity ? (
                  <span className="text-muted-foreground"> · {spotsLabel}</span>
                ) : null}
              </>
            ) : (
              "Be the first to register"
            )}
          </p>
        </div>
        {capacity != null && capacity > 0 ? (
          <CapacityBar registered={count} capacity={capacity} />
        ) : null}
      </div>

      {attendees.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Attendee names will appear here as people register.
        </p>
      ) : (
        <>
          <ul className="mt-5 divide-y divide-border">
            {visible.map((person) => (
              <li key={person.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <Avatar
                  src={person.avatarUrl}
                  alt={person.name}
                  fallback={person.name}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{person.name}</p>
                  {person.subtitle ? (
                    <p className="truncate text-xs text-muted-foreground">{person.subtitle}</p>
                  ) : null}
                </div>
                {person.plusOneLabel ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-page-secondary px-2 py-0.5 text-xs text-muted-foreground">
                    <UserPlus className="h-3 w-3" aria-hidden />
                    +1
                  </span>
                ) : null}
              </li>
            ))}
          </ul>

          {hiddenCount > 0 || (expanded && attendees.length > COLLAPSED_LIMIT) ? (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-4 flex w-full items-center justify-center gap-1 rounded-lg py-2 text-sm font-medium text-primary hover:bg-primary-light/50"
            >
              {expanded ? "Show fewer" : `Show all ${attendees.length} attendees`}
              <ChevronDown
                className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")}
                aria-hidden
              />
            </button>
          ) : null}
        </>
      )}
    </Card>
  );
}

function CapacityBar({ registered, capacity }: { registered: number; capacity: number }) {
  const pct = Math.min(100, Math.round((registered / capacity) * 100));
  return (
    <div className="w-full min-w-[140px] max-w-[200px] sm:w-auto">
      <div className="h-1.5 overflow-hidden rounded-full bg-page-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-right text-xs text-muted-foreground">{pct}% full</p>
    </div>
  );
}
