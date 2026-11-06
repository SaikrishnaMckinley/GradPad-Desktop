"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronLeft, ChevronRight, MapPin, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  EventFreeTicketBreakdown,
  EventPaymentBreakdown,
} from "@/components/events/EventPaymentBreakdown";
import { loadEventRegistrationStatus } from "@/lib/events/actions";
import { formatEventFeedLabels } from "@/lib/events/format-event-datetime";
import { getConfirmedPaymentDisplayPricing } from "@/lib/events/event-pricing";
import type { EventRegistrationTicketView, EventTicketHolder } from "@/lib/events/map-event-tickets";
import type { EventDetailViewModel } from "@/lib/events/map-event-detail";
import { eventQrCodeDataUrl } from "@/lib/events/public-guest-registration";
import { writeRegistrationStatusCache } from "@/lib/events/registration-status-cache";
import { cn } from "@/lib/utils/cn";

const FALLBACK = "/images/event-thumb.jpg";

const thinScrollClass =
  "[scrollbar-width:4px] [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/45";

type Props = {
  open: boolean;
  event: EventDetailViewModel;
  viewerName: string;
  viewerEmail: string;
  registration: EventRegistrationTicketView | null;
  onRegistrationUpdate: (next: EventRegistrationTicketView | null) => void;
  onClose: () => void;
};

export function EventViewTicketModal({
  open,
  event,
  viewerName,
  viewerEmail,
  registration,
  onRegistrationUpdate,
  onClose,
}: Props) {
  const titleId = useId();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [ticketIndex, setTicketIndex] = useState(0);
  const [heroFailed, setHeroFailed] = useState(false);
  const refreshInFlight = useRef(false);
  const hadRegistrationOnOpen = useRef(false);

  const { timeLabel, dayLabel } = formatEventFeedLabels(event.startAt);
  const paidTicket = event.tickets.find((t) => !t.isFree && t.cost > 0);
  const priceLabel = paidTicket ? `$${paidTicket.cost.toFixed(2)}` : "Free";

  const freeTicketName =
    registration?.ticketName ??
    event.tickets.find((t) => t.isFree)?.name ??
    "General Admission";

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setTicketIndex(0);
      setLoadError(null);
      hadRegistrationOnOpen.current = false;
      return;
    }

    hadRegistrationOnOpen.current = Boolean(registration);
    if (refreshInFlight.current) return;
    refreshInFlight.current = true;

    void (async () => {
      const result = await loadEventRegistrationStatus(event.id);
      refreshInFlight.current = false;
      if (result.error) {
        if (!hadRegistrationOnOpen.current) setLoadError(result.error);
        return;
      }
      setLoadError(null);
      if (result.registration) {
        onRegistrationUpdate(result.registration);
        writeRegistrationStatusCache(event.id, result.registration);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh once per open
  }, [open, event.id, onRegistrationUpdate]);

  const tickets: EventTicketHolder[] =
    registration?.tickets && registration.tickets.length > 0
      ? registration.tickets
      : [
          {
            id: "fallback",
            full_name: viewerName,
            email: viewerEmail,
            qr_code: registration?.qrCode ?? "",
            is_checked_in: false,
            check_in_date: null,
            has_plus_one: false,
            ticket_type: "primary",
          },
        ];

  const current = tickets[ticketIndex] ?? tickets[0];
  const qrSrc = eventQrCodeDataUrl(current?.qr_code);
  const hasQr = Boolean(qrSrc);

  const paymentBreakdown = registration?.payment
    ? getConfirmedPaymentDisplayPricing(registration.payment, {
        ticketUnitCost: registration.ticketUnitCost,
        ticketQuantity: tickets.length || 1,
      })
    : null;

  const showFreeBreakdown =
    !paymentBreakdown &&
    (registration?.ticketIsFree ?? !event.tickets.some((t) => !t.isFree && t.cost > 0));

  const showShell = Boolean(registration) || Boolean(loadError);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end justify-center overscroll-none sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/50"
        aria-label="Close ticket"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(92dvh,720px)] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-card shadow-card sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 id={titleId} className="text-lg font-semibold">
            Event ticket
          </h2>
          <button
            type="button"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-page-secondary"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className={cn("min-h-0 flex-1 overflow-y-auto px-5 py-4", thinScrollClass)}>
          {loadError && !showShell ? (
            <p className="rounded-lg border border-error/30 bg-error/5 px-3 py-2 text-sm text-error">
              {loadError}
            </p>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl bg-page-secondary/50 p-3">
                <div className="flex gap-3">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-page-secondary">
                    {!heroFailed && (event.imageUrl ?? FALLBACK) ? (
                      <Image
                        src={event.imageUrl ?? FALLBACK}
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized={(event.imageUrl ?? "").startsWith("http")}
                        onError={() => setHeroFailed(true)}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-lg font-bold text-primary">
                        {event.title.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <p className="font-semibold leading-snug">{event.title}</p>
                    <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <span>
                        {dayLabel}, {timeLabel}
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="line-clamp-2">
                        {event.locationLabel ?? "Location TBD"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      <Tag className="h-3.5 w-3.5 text-primary" />
                      {registration?.ticketIsFree !== false ? "Free" : priceLabel}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-success to-success/85 px-4 py-6 text-center text-white">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-2xl">
                  ✓
                </div>
                <p className="text-lg font-bold">You&apos;re going!</p>
                <p className="mt-1 text-sm text-white/90">We&apos;ve confirmed your attendance</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {tickets.length > 1
                    ? `Ticket ${ticketIndex + 1} of ${tickets.length}`
                    : "Ticket holder"}
                </p>
                <div className="rounded-xl border border-border p-3">
                  <p className="font-medium">{current?.full_name || viewerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {current?.email || viewerEmail}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">{freeTicketName}</p>
                </div>
              </div>

              {paymentBreakdown ? (
                <EventPaymentBreakdown pricing={paymentBreakdown} />
              ) : showFreeBreakdown ? (
                <EventFreeTicketBreakdown ticketName={freeTicketName} />
              ) : null}

              {loadError ? (
                <p className="text-xs text-error">{loadError}</p>
              ) : null}

              <div className="space-y-3">
                {tickets.length > 1 ? (
                  <div className="flex items-center justify-between gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={ticketIndex <= 0}
                      onClick={() => setTicketIndex((i) => Math.max(0, i - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground">Check-in QR</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={ticketIndex >= tickets.length - 1}
                      onClick={() =>
                        setTicketIndex((i) => Math.min(tickets.length - 1, i + 1))
                      }
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Check-in QR code
                  </p>
                )}

                <div className="flex justify-center rounded-xl border border-border bg-white p-3">
                  {hasQr ? (
                    // eslint-disable-next-line @next/next/no-img-element -- base64 QR from API
                    <img
                      src={qrSrc!}
                      alt="Event check-in QR code"
                      className="h-auto w-full max-w-[220px] object-contain"
                    />
                  ) : (
                    <div className="flex max-w-[220px] flex-col items-center gap-2 py-4 text-center">
                      <div className="h-8 w-8 animate-pulse rounded-lg bg-page-secondary" />
                      <p className="text-xs text-muted-foreground">Loading QR…</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border px-5 py-4">
          <Button type="button" className="w-full" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
