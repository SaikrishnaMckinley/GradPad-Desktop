"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { formatEventFeedLabels } from "@/lib/events/format-event-datetime";
import { cn } from "@/lib/utils/cn";
import type { EventBadgeTone, EventListItem } from "@/types/events";

const FALLBACK_IMAGE = "/images/event-thumb.jpg";

function badgeClass(tone: EventBadgeTone) {
  if (tone === "primary") return "bg-primary-light text-primary";
  if (tone === "success") return "bg-success-bg text-success";
  return "bg-page-secondary text-muted-foreground";
}

function EventThumb({ event }: { event: EventListItem }) {
  const [src, setSrc] = useState(event.imageUrl ?? FALLBACK_IMAGE);
  const remote = src.startsWith("http");

  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-[200px] shrink-0 overflow-hidden rounded-2xl sm:mx-0 sm:h-[132px] sm:w-[176px] sm:max-w-none">
      <Image
        src={src}
        alt=""
        fill
        className="object-cover"
        sizes="176px"
        unoptimized={remote}
        onError={() => {
          if (src !== FALLBACK_IMAGE) setSrc(FALLBACK_IMAGE);
        }}
      />
    </div>
  );
}

type Props = {
  events: EventListItem[];
  emptyMessage?: string;
};

export function EventFeedList({
  events,
  emptyMessage = "No upcoming events yet. Join communities or create an event to see it here.",
}: Props) {
  if (events.length === 0) {
    return (
      <Card className="p-8 text-center shadow-card">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {events.map((event) => {
        const { timeLabel, dayLabel } = formatEventFeedLabels(event.startAt);

        return (
          <Card key={event.id} className="overflow-hidden shadow-card">
            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch sm:gap-5 sm:p-5">
              <div className="flex shrink-0 items-start gap-4 sm:w-[72px] sm:flex-col sm:gap-0 sm:pt-1 sm:text-right lg:w-[80px]">
                <div>
                  <p className="text-[15px] font-semibold leading-tight text-foreground">
                    {timeLabel}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{dayLabel}</p>
                </div>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-stretch">
                <EventThumb event={event} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    {event.communityName}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold leading-snug text-foreground">
                    <Link href={`/events/${event.id}`} prefetch className="hover:text-primary">
                      {event.title}
                    </Link>
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {event.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {event.badges.map((b) => (
                      <span
                        key={`${event.id}-${b.label}`}
                        className={cn(
                          "rounded-lg px-2.5 py-1 text-xs font-medium",
                          badgeClass(b.tone),
                        )}
                      >
                        {b.label}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto flex items-center justify-end gap-3 pt-4">
                    {event.isOwner ? (
                      <div className="flex shrink-0 flex-wrap justify-end gap-2">
                        <Link
                          href={`/events/${event.id}/edit`}
                          prefetch
                          className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-page-secondary"
                        >
                          Update
                        </Link>
                        <Link
                          href={`/events/${event.id}/manage`}
                          prefetch
                          className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90"
                        >
                          Manage
                        </Link>
                      </div>
                    ) : (
                      <Link
                        href={`/events/${event.id}`}
                        prefetch
                        className="shrink-0 rounded-lg bg-page-secondary px-3 py-1.5 text-sm font-medium text-foreground hover:bg-border"
                      >
                        {event.actionLabel}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
