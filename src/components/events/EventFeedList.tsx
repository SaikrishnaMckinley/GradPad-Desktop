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

function isPriceBadgeLabel(label: string): boolean {
  const t = label.trim();
  if (/^free$/i.test(t)) return true;
  return /^\$[\d,.]+$/.test(t);
}

/** Remove $/Free chips when a dedicated ticket line is shown to avoid duplication. */
function feedBadgesWithoutPriceRow(event: EventListItem, showTicketLine: boolean) {
  if (!showTicketLine) return event.badges;
  return event.badges.filter((b) => !isPriceBadgeLabel(b.label));
}

/** Raw price snippet from API or badges (may include "From $X"). */
function rawPriceValue(event: EventListItem): string | null {
  if (event.priceLabel?.trim()) return event.priceLabel.trim();

  const priceLabels = event.badges.map((b) => b.label.trim()).filter(isPriceBadgeLabel);
  if (priceLabels.length === 0) return null;
  if (priceLabels.length === 1) return priceLabels[0]!;

  const dollarValues: number[] = [];
  let hasFree = false;
  for (const label of priceLabels) {
    if (/^free$/i.test(label)) {
      hasFree = true;
      continue;
    }
    const m = label.match(/^\$([\d,.]+)/);
    if (m) {
      const n = Number.parseFloat(m[1]!.replace(/,/g, ""));
      if (!Number.isNaN(n)) dollarValues.push(n);
    }
  }

  if (dollarValues.length >= 2) {
    const min = Math.min(...dollarValues);
    const formatted = min % 1 === 0 ? min.toFixed(0) : min.toFixed(2);
    return `From $${formatted}`;
  }
  if (dollarValues.length === 1) {
    const n = dollarValues[0]!;
    const formatted = n % 1 === 0 ? n.toFixed(0) : n.toFixed(2);
    return hasFree ? `From $${formatted}` : `$${formatted}`;
  }
  return hasFree ? "Free" : priceLabels[0]!;
}

/** Display line for mobile + desktop: "Starting from …" for paid tiers, "Free" when free only. */
function ticketPriceLine(event: EventListItem): string | null {
  const raw = rawPriceValue(event);
  if (!raw) return null;
  if (/^free$/i.test(raw.trim())) return "Free";
  if (/^from\s+/i.test(raw.trim())) {
    return `Starting from ${raw.replace(/^from\s+/i, "").trim()}`;
  }
  if (raw.trim().startsWith("$")) {
    return `Starting from ${raw.trim()}`;
  }
  return `Starting from ${raw.trim()}`;
}

function EventThumb({ event }: { event: EventListItem }) {
  const [src, setSrc] = useState(event.imageUrl ?? FALLBACK_IMAGE);
  const [failed, setFailed] = useState(false);
  const remote = src.startsWith("http");

  if (failed) {
    return (
      <div className="relative flex aspect-[16/9] w-full shrink-0 items-center justify-center overflow-hidden bg-page-secondary px-3 py-6 text-center md:mx-0 md:aspect-auto md:h-[132px] md:w-[176px] md:max-w-[200px] md:shrink-0 md:rounded-2xl md:px-3 md:py-0 lg:max-w-none">
        <p className="line-clamp-3 text-xs font-semibold text-muted-foreground md:text-sm">
          {event.title}
        </p>
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-page-secondary md:mx-0 md:aspect-auto md:h-[132px] md:w-[176px] md:max-w-[200px] md:shrink-0 md:rounded-2xl lg:max-w-none">
      <Image
        src={src}
        alt={event.title}
        fill
        className="object-cover"
        sizes="(max-width: 767px) 100vw, 176px"
        unoptimized={remote}
        onError={() => {
          if (src !== FALLBACK_IMAGE) setSrc(FALLBACK_IMAGE);
          else setFailed(true);
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
    <div className="space-y-3 md:space-y-5">
      {events.map((event) => {
        const { timeLabel, dayLabel } = formatEventFeedLabels(event.startAt);
        const priceRow = ticketPriceLine(event);
        const badgesToShow = feedBadgesWithoutPriceRow(event, Boolean(priceRow));

        return (
          <Card key={event.id} className="overflow-hidden shadow-card">
            <div className="flex flex-col md:flex-row md:items-stretch md:gap-5 md:p-5">
              <div className="hidden shrink-0 md:flex md:w-[72px] md:flex-col md:gap-0 md:pt-1 md:text-right lg:w-[80px]">
                <div>
                  <p className="text-[15px] font-semibold leading-tight text-foreground">
                    {timeLabel}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{dayLabel}</p>
                </div>
              </div>
              <div className="flex min-w-0 flex-1 flex-col md:flex-row md:items-stretch md:gap-4">
                <div className="flex items-start justify-between gap-3 border-b border-border px-3 py-3 md:hidden">
                  <div>
                    <p className="text-sm font-semibold leading-tight text-foreground">
                      {timeLabel}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{dayLabel}</p>
                  </div>
                </div>
                <EventThumb event={event} />
                <div className="flex min-w-0 flex-1 flex-col px-3 pb-3 pt-3 md:px-0 md:pb-0 md:pt-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-primary md:text-xs">
                    {event.communityName}
                  </p>
                  <h2 className="mt-0.5 text-base font-semibold leading-snug text-foreground md:mt-1 md:text-lg">
                    <Link href={`/events/${event.id}`} prefetch className="hover:text-primary">
                      {event.title}
                    </Link>
                  </h2>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground md:text-sm">
                    {event.description}
                  </p>
                  {priceRow ? (
                    <p className="mt-2 text-xs font-semibold text-foreground md:text-sm">
                      {priceRow}
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-1.5 md:mt-3 md:gap-2">
                    <span className="flex flex-wrap gap-1.5 md:hidden">
                      {badgesToShow.map((b) => (
                        <span
                          key={`${event.id}-m-${b.label}`}
                          className={cn(
                            "rounded-md px-2 py-0.5 text-[11px] font-medium",
                            badgeClass(b.tone),
                          )}
                        >
                          {b.label}
                        </span>
                      ))}
                    </span>
                    <span className="hidden flex-wrap gap-2 md:flex">
                      {badgesToShow.map((b) => (
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
                    </span>
                  </div>
                  <div className="mt-auto flex items-center justify-end gap-2 pt-3 md:gap-3 md:pt-4">
                    {event.isOwner ? (
                      <div className="flex shrink-0 flex-wrap justify-end gap-1.5 md:gap-2">
                        <Link
                          href={`/events/${event.id}/edit`}
                          prefetch
                          className="rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-page-secondary md:rounded-lg md:px-3 md:py-1.5 md:text-sm"
                        >
                          Update
                        </Link>
                        <Link
                          href={`/events/${event.id}/manage`}
                          prefetch
                          className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-white hover:bg-primary/90 md:rounded-lg md:px-3 md:py-1.5 md:text-sm"
                        >
                          Manage
                        </Link>
                      </div>
                    ) : (
                      <Link
                        href={`/events/${event.id}`}
                        prefetch
                        className="shrink-0 rounded-md bg-page-secondary px-2.5 py-1 text-xs font-medium text-foreground hover:bg-border md:rounded-lg md:px-3 md:py-1.5 md:text-sm"
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
