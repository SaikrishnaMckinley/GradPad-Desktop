"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, ChevronLeft, MapPin, Tag, Users } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { CalendarFlipButton } from "@/components/events/CalendarFlipButton";
import { EventShareLinkButton } from "@/components/events/EventShareLinkButton";
import { Avatar } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { writeEventDetailCache } from "@/lib/events/events-cache";
import { requestEventJoin } from "@/lib/events/actions";
import { formatEventFeedLabels } from "@/lib/events/format-event-datetime";
import type { EventDetailViewModel } from "@/lib/events/map-event-detail";
import { cn } from "@/lib/utils/cn";

const FALLBACK = "/images/event-thumb.jpg";

type Props = {
  event: EventDetailViewModel;
  viewerName: string;
  viewerEmail: string;
};

export function EventDetailClient({ event, viewerName, viewerEmail }: Props) {
  const [state, formAction, pending] = useActionState(
    requestEventJoin.bind(null, event.id),
    null,
  );
  const [heroSrc, setHeroSrc] = useState(event.imageUrl ?? FALLBACK);
  const { timeLabel, dayLabel } = formatEventFeedLabels(event.startAt);
  const price =
    event.tickets.find((t) => !t.isFree)?.cost ??
    (event.priceLabel?.startsWith("$")
      ? Number(event.priceLabel.replace("$", ""))
      : 0);
  const isPaid = price > 0;
  const spots =
    event.spotsRemaining != null
      ? `${event.spotsRemaining} spots open`
      : event.capacity
        ? `${Math.max(event.capacity - event.attendeeCount, 0)} spots open`
        : "Open capacity";

  const calendarEvent = {
    id: event.id,
    title: event.title,
    description: event.description,
    location: event.locationLabel ?? "",
    start_date: event.startDate,
    start_time: event.startTime,
    end_date: event.endDate,
    end_time: event.endTime,
    startAt: event.startAt,
    endAt: event.endAt,
  };

  useEffect(() => {
    setHeroSrc(event.imageUrl ?? FALLBACK);
  }, [event.imageUrl]);

  useEffect(() => {
    writeEventDetailCache(event);
  }, [event]);

  useEffect(() => {
    if (state?.error) toast.error(state.error);
    if (state?.success) toast.success(state.success);
  }, [state]);

  return (
    <div className="space-y-6">
      <Link
        href="/events"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1 px-0")}
      >
        <ChevronLeft className="h-4 w-4" />
        Back to events
      </Link>

      <div className="relative aspect-[21/9] overflow-hidden rounded-2xl bg-page-secondary">
        <Image
          src={heroSrc}
          alt=""
          fill
          className="object-cover"
          priority
          unoptimized={heroSrc.startsWith("http")}
          onError={() => {
            if (heroSrc !== FALLBACK) setHeroSrc(FALLBACK);
          }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card className="p-6 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              {event.isPublic ? "Public event" : "Private event"}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">{event.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{event.communityName}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <InfoTile icon={Calendar} label={`${dayLabel}, ${timeLabel}`} />
              <InfoTile icon={MapPin} label={event.locationLabel ?? "Location TBD"} />
              <InfoTile icon={Tag} label={isPaid ? `$${price} ticket price` : "Free"} />
              <InfoTile
                icon={Users}
                label={`${spots}, ${event.capacity ? "Limited capacity" : "Open registration"}`}
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <CalendarFlipButton event={calendarEvent} />
              <EventShareLinkButton eventId={event.id} title={event.title} />
            </div>
          </Card>

          <Card className="p-6 shadow-card">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              About the event
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground">{event.description}</p>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5 shadow-card">
            {event.isOwner ? (
              <>
                <span className="inline-block rounded-lg bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary">
                  You’re hosting
                </span>
                <p className="mt-3 text-sm text-muted-foreground">
                  Update details, run check-in, and view live statistics for this event.
                </p>
                <div className="mt-5 flex flex-col gap-2">
                  <Link
                    href={`/events/${event.id}/edit`}
                    className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                  >
                    Update event
                  </Link>
                  <Link
                    href={`/events/${event.id}/manage`}
                    className={cn(buttonVariants(), "w-full")}
                  >
                    Manage event
                  </Link>
                </div>
              </>
            ) : (
              <>
                {event.requiresApproval ? (
                  <span className="inline-block rounded-lg bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary">
                    Requires host approval
                  </span>
                ) : null}
                <p className="mt-3 text-sm text-muted-foreground">
                  {isPaid
                    ? "Choose your ticket and complete secure checkout with Stripe (test mode on staging)."
                    : event.requiresApproval
                      ? "Welcome! To join the event, please request approval below."
                      : "Register to attend this event."}
                </p>

                {isPaid ? (
                  <>
                    <p className="mt-4 text-3xl font-bold">${price.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Ticket price</p>
                    <Link
                      href={`/events/${event.id}/register`}
                      className={cn(buttonVariants(), "mt-5 w-full")}
                    >
                      Register & pay
                    </Link>
                  </>
                ) : (
                  <form action={formAction} className="mt-5 space-y-4">
                    <div className="rounded-xl bg-page-secondary/80 p-3 text-sm">
                      <p className="font-medium">{viewerName}</p>
                      <p className="text-muted-foreground">{viewerEmail}</p>
                    </div>
                    <Button type="submit" className="w-full" disabled={pending || event.isAttendee}>
                      {event.isAttendee
                        ? "You’re registered"
                        : event.hasRequested
                          ? "Request pending"
                          : event.requiresApproval
                            ? "Request to join"
                            : "Register"}
                    </Button>
                  </form>
                )}
              </>
            )}
          </Card>

          <Card className="p-5 shadow-card">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Hosted by
            </h3>
            <div className="mt-4 flex items-center gap-3">
              <Avatar
                src={event.hostAvatarUrl}
                alt={event.hostName}
                fallback={event.hostName}
                size="md"
              />
              <div>
                <p className="font-semibold">{event.hostName}</p>
                <p className="text-xs text-muted-foreground">Community organizer</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
}: {
  icon: typeof Calendar;
  label: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-page-secondary/30 p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <p className="text-sm font-medium leading-snug">{label}</p>
    </div>
  );
}
