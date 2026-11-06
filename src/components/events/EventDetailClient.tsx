"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, CheckCircle2, ChevronLeft, MapPin, Tag, Users } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarFlipButton } from "@/components/events/CalendarFlipButton";
import { EventAttendeesCard } from "@/components/events/EventAttendeesCard";
import { EventFreeRegistrationModal } from "@/components/events/EventFreeRegistrationModal";
import { EventViewTicketModal } from "@/components/events/EventViewTicketModal";
import { EventShareLinkButton } from "@/components/events/EventShareLinkButton";
import { ProfileAvatarLink } from "@/components/profile/ProfileAvatarLink";
import { ProfileNameLink } from "@/components/profile/ProfileNameLink";
import { resolveStagingMediaUrl } from "@/lib/api/media-url";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { writeEventDetailCache } from "@/lib/events/events-cache";
import { registerFreeEventAction } from "@/lib/events/actions";
import { formatEventFeedLabels } from "@/lib/events/format-event-datetime";
import { loadEventRegistrationStatus } from "@/lib/events/actions";
import type { EventAttendeeRosterItem } from "@/lib/events/map-event-attendees";
import type { EventRegistrationTicketView } from "@/lib/events/map-event-tickets";
import type { EventDetailViewModel } from "@/lib/events/map-event-detail";
import {
  readRegistrationStatusCache,
  writeRegistrationStatusCache,
} from "@/lib/events/registration-status-cache";
import { cn } from "@/lib/utils/cn";

const FALLBACK = "/images/event-thumb.jpg";

type Props = {
  event: EventDetailViewModel;
  attendees?: EventAttendeeRosterItem[];
  viewerName: string;
  viewerEmail: string;
  initialRegistration?: EventRegistrationTicketView | null;
};

function splitViewerName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "Guest", lastName: "" };
  return { firstName: parts[0] ?? "Guest", lastName: parts.slice(1).join(" ") };
}

export function EventDetailClient({
  event,
  attendees = [],
  viewerName,
  viewerEmail,
  initialRegistration = null,
}: Props) {
  const router = useRouter();
  const [registration, setRegistration] = useState<EventRegistrationTicketView | null>(
    () => initialRegistration ?? readRegistrationStatusCache(event.id),
  );
  const freeTicketId =
    event.tickets.find((t) => t.isFree)?.id ?? event.tickets[0]?.id ?? "";
  const { firstName, lastName } = splitViewerName(viewerName);

  const [registerOpen, setRegisterOpen] = useState(false);
  const [viewTicketOpen, setViewTicketOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    registerFreeEventAction.bind(null, event.id, event.isPublic),
    null,
  );
  const [heroSrc, setHeroSrc] = useState(event.imageUrl ?? FALLBACK);
  const [heroFailed, setHeroFailed] = useState(false);
  const { timeLabel, dayLabel } = formatEventFeedLabels(event.startAt);
  const endMs = new Date(event.endAt).getTime();
  const eventHasEnded = !Number.isNaN(endMs) && endMs < Date.now();
  const price =
    event.tickets.find((t) => !t.isFree)?.cost ??
    (event.priceLabel?.startsWith("$")
      ? Number(event.priceLabel.replace("$", ""))
      : 0);
  const isPaid = price > 0;
  const attendingCount =
    event.attendeeCount > 0 ? event.attendeeCount : attendees.length;
  const spotsOpen =
    event.spotsRemaining ??
    (event.capacity != null ? Math.max(event.capacity - attendingCount, 0) : null);
  const spots =
    spotsOpen != null
      ? `${spotsOpen} spots open`
      : event.capacity
        ? `${Math.max(event.capacity - attendingCount, 0)} spots open`
        : "Open capacity";
  const attendanceTile =
    attendingCount > 0
      ? `${attendingCount} attending · ${spots}`
      : `${spots}, ${event.capacity ? "Limited capacity" : "Open registration"}`;

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
    setHeroFailed(false);
  }, [event.imageUrl]);

  useEffect(() => {
    writeEventDetailCache(event);
  }, [event]);

  useEffect(() => {
    if (initialRegistration) {
      setRegistration(initialRegistration);
      writeRegistrationStatusCache(event.id, initialRegistration);
    }
  }, [event.id, initialRegistration]);

  useEffect(() => {
    if (!event.isAttendee) return;
    let cancelled = false;
    void loadEventRegistrationStatus(event.id).then((result) => {
      if (cancelled || !result.registration) return;
      setRegistration(result.registration);
      writeRegistrationStatusCache(event.id, result.registration);
    });
    return () => {
      cancelled = true;
    };
  }, [event.id, event.isAttendee]);

  useEffect(() => {
    if (state?.error) toast.error(state.error);
    if (state?.success) {
      toast.success(state.success);
      setRegisterOpen(false);
      router.refresh();
      setViewTicketOpen(true);
    }
  }, [state, router]);

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
        {heroFailed ? (
          <div className="flex h-full min-h-[160px] w-full flex-col items-center justify-center gap-1 px-6 text-center">
            <p className="text-lg font-semibold text-foreground">{event.title}</p>
            <p className="text-sm text-muted-foreground">{event.communityName}</p>
          </div>
        ) : (
          <Image
            src={heroSrc}
            alt={event.title}
            fill
            className="object-cover"
            priority
            unoptimized={heroSrc.startsWith("http")}
            onError={() => {
              if (heroSrc !== FALLBACK) setHeroSrc(FALLBACK);
              else setHeroFailed(true);
            }}
          />
        )}
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
              <InfoTile icon={Users} label={attendanceTile} />
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

          <EventAttendeesCard
            attendees={attendees}
            attendeeCount={event.attendeeCount}
            capacity={event.capacity}
            spotsLabel={spots}
          />
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
            ) : eventHasEnded ? (
              <>
                <span className="inline-block rounded-lg bg-page-secondary px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                  Event ended
                </span>
                {event.isAttendee ? (
                  <div className="mt-5 space-y-3">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                      Registered
                    </span>
                    <p className="text-sm text-muted-foreground">
                      This event is over. You can still open your ticket details if you need them.
                    </p>
                    <Button type="button" className="w-full" onClick={() => setViewTicketOpen(true)}>
                      View ticket
                    </Button>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Registration is closed — this event has already ended.
                  </p>
                )}
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
                    ? "Choose your ticket and confirm your details on the next step. Payment is processed through secure checkout."
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
                ) : event.isAttendee ? (
                  <div className="mt-5 space-y-3">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                      Registered
                    </span>
                    <p className="text-sm text-muted-foreground">
                      You&apos;re on the guest list. Show your registration QR at check-in.
                    </p>
                    <Button type="button" className="w-full" onClick={() => setViewTicketOpen(true)}>
                      View ticket
                    </Button>
                  </div>
                ) : !event.isPublic && event.hasRequested ? (
                  <div className="mt-5 space-y-3">
                    <span className="inline-block rounded-lg bg-page-secondary px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                      Request pending
                    </span>
                    <p className="text-sm text-muted-foreground">
                      The host will review your request. You&apos;ll be notified when it&apos;s
                      approved.
                    </p>
                    <Button type="button" className="w-full" disabled>
                      Request pending
                    </Button>
                  </div>
                ) : (
                  <>
                    {event.isPublic && event.hasRequested ? (
                      <p className="mt-3 text-xs text-muted-foreground">
                        Complete registration below to confirm your spot for this public event.
                      </p>
                    ) : null}
                    <div className="mt-5 rounded-xl border border-border bg-page-secondary/50 p-3 text-sm">
                      <p className="font-medium text-foreground">{viewerName}</p>
                      <p className="text-muted-foreground">{viewerEmail}</p>
                    </div>
                    <Button
                      type="button"
                      className="mt-4 w-full"
                      onClick={() => setRegisterOpen(true)}
                      disabled={!freeTicketId && event.isPublic}
                    >
                      Register
                    </Button>
                  </>
                )}
              </>
            )}
          </Card>

          <Card className="p-5 shadow-card">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Hosted by
            </h3>
            <div className="mt-4 flex items-center gap-3">
              <ProfileAvatarLink
                userId={event.hostUserId}
                src={resolveStagingMediaUrl(event.hostAvatarUrl)}
                alt={event.hostName}
                fallback={event.hostName}
                size="md"
              />
              <div>
                <ProfileNameLink userId={event.hostUserId} className="font-semibold">
                  {event.hostName}
                </ProfileNameLink>
                <p className="text-xs text-muted-foreground">Community organizer</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <EventFreeRegistrationModal
        open={registerOpen}
        event={event}
        viewerName={viewerName}
        viewerEmail={viewerEmail}
        firstName={firstName}
        lastName={lastName}
        freeTicketId={freeTicketId}
        formAction={formAction}
        pending={pending}
        onClose={() => setRegisterOpen(false)}
      />

      <EventViewTicketModal
        open={viewTicketOpen}
        event={event}
        viewerName={viewerName}
        viewerEmail={viewerEmail}
        registration={registration}
        onRegistrationUpdate={setRegistration}
        onClose={() => setViewTicketOpen(false)}
      />
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
