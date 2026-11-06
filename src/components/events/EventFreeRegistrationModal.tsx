"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  publicEventNeedsAffiliation,
  resolveAttendeeIdentity,
  type AttendeeIdentityKind,
  validateAttendeeIdentityValue,
} from "@/lib/events/attendee-identity";
import { formatEventFeedLabels } from "@/lib/events/format-event-datetime";
import type { EventDetailViewModel } from "@/lib/events/map-event-detail";
import { cn } from "@/lib/utils/cn";

type Props = {
  open: boolean;
  event: EventDetailViewModel;
  viewerName: string;
  viewerEmail: string;
  firstName: string;
  lastName: string;
  freeTicketId: string;
  formAction: (payload: FormData) => void;
  pending: boolean;
  onClose: () => void;
};

const selectClassName =
  "flex h-11 w-full rounded-xl border border-input-border bg-card px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

export function EventFreeRegistrationModal({
  open,
  event,
  viewerName,
  viewerEmail,
  firstName,
  lastName,
  freeTicketId,
  formAction,
  pending,
  onClose,
}: Props) {
  const titleId = useId();
  const [identityKind, setIdentityKind] = useState<AttendeeIdentityKind>("class_year");
  const [classYearInput, setClassYearInput] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);

  const needsAffiliation = event.isPublic && publicEventNeedsAffiliation(event.communityName);
  const { timeLabel, dayLabel } = formatEventFeedLabels(event.startAt);
  const freeTicket = event.tickets.find((t) => t.id === freeTicketId) ?? event.tickets[0];

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !pending) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, pending, onClose]);

  useEffect(() => {
    if (!open) {
      setClientError(null);
    }
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const affiliationErrorMessage =
    "Enter a 4-digit class year, Guest, or BLS Parent.";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    setClientError(null);
    if (needsAffiliation) {
      if (identityKind === "class_year" && !classYearInput.trim()) {
        e.preventDefault();
        setClientError(affiliationErrorMessage);
        return;
      }
      const identity = resolveAttendeeIdentity(identityKind, classYearInput);
      if (!validateAttendeeIdentityValue(identity)) {
        e.preventDefault();
        setClientError(affiliationErrorMessage);
        return;
      }
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end justify-center overscroll-none sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/45"
        aria-label="Close registration"
        onClick={() => {
          if (!pending) onClose();
        }}
      />
      <div
        role="dialog"
        aria-modal
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(92dvh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-card shadow-card sm:rounded-2xl"
      >
        <div className="border-b border-primary-border/40 bg-primary px-5 py-4 text-white sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
                Event registration
              </p>
              <h2 id={titleId} className="mt-1 text-lg font-semibold leading-snug">
                {event.title}
              </h2>
              <p className="mt-1 text-sm text-white/90">
                {dayLabel}, {timeLabel}
              </p>
            </div>
            <button
              type="button"
              className="rounded-lg p-1.5 text-white/90 hover:bg-white/15"
              onClick={() => {
                if (!pending) onClose();
              }}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form
          action={formAction}
          noValidate
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto"
        >
          <input type="hidden" name="ticketId" value={freeTicketId} />
          <input type="hidden" name="email" value={viewerEmail} />
          <input type="hidden" name="firstName" value={firstName} />
          <input type="hidden" name="lastName" value={lastName} />
          <input type="hidden" name="communityName" value={event.communityName} />

          <div className="space-y-5 px-5 py-5 sm:px-6">
            <div className="rounded-xl border border-primary-border/50 bg-primary-light/35 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Your info</p>
              <p className="mt-2 font-medium text-foreground">{viewerName}</p>
              <p className="text-sm text-muted-foreground">{viewerEmail}</p>
            </div>

            {freeTicket ? (
              <div className="rounded-xl border border-primary ring-2 ring-primary/15 bg-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{freeTicket.name}</p>
                    {freeTicket.description ? (
                      <p className="text-xs text-muted-foreground">{freeTicket.description}</p>
                    ) : null}
                  </div>
                  <p className="font-semibold text-primary">Free</p>
                </div>
              </div>
            ) : null}

            {needsAffiliation ? (
              <div className="space-y-3 rounded-xl border border-border bg-page-secondary/30 p-4">
                <p className="text-sm font-semibold text-foreground">Class year or affiliation</p>
                <select
                  id="event-affiliation-kind"
                  name="attendeeIdentityKind"
                  value={identityKind}
                  onChange={(e) => {
                    setIdentityKind(e.target.value as AttendeeIdentityKind);
                    setClientError(null);
                  }}
                  className={selectClassName}
                >
                  <option value="class_year">Class year</option>
                  <option value="guest">Guest</option>
                  <option value="bls_parent">BLS Parent</option>
                </select>
                {identityKind === "class_year" ? (
                  <div className="space-y-1.5">
                    <Input
                      name="classYearInput"
                      inputMode="numeric"
                      placeholder="e.g. 2010"
                      maxLength={4}
                      value={classYearInput}
                      onChange={(e) => {
                        setClassYearInput(e.target.value.replace(/\D/g, "").slice(0, 4));
                        setClientError(null);
                      }}
                      aria-label="Class year"
                      aria-invalid={clientError ? true : undefined}
                      className={cn(
                        "bg-card",
                        clientError && "border-error focus-visible:ring-error/30",
                      )}
                    />
                    {clientError ? (
                      <p className="text-sm text-error" role="alert">
                        {clientError}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Use a 4-digit graduation year, or choose Guest / BLS Parent above.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {identityKind === "guest"
                      ? "Registering as a guest of the community."
                      : "Registering as a BLS parent."}
                  </p>
                )}
              </div>
            ) : null}

            {clientError && identityKind !== "class_year" ? (
              <p className="text-sm text-error" role="alert">
                {clientError}
              </p>
            ) : null}

            {event.isPublic ? (
              <p className="text-xs leading-relaxed text-muted-foreground">
                Public event — your registration is confirmed immediately after you submit.
              </p>
            ) : (
              <p className="text-xs leading-relaxed text-muted-foreground">
                The host will review your request and notify you when approved.
              </p>
            )}
          </div>

          <div className="mt-auto border-t border-border bg-card px-5 py-4 sm:px-6">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="sm:min-w-[7rem]"
                disabled={pending}
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className={cn("sm:min-w-[9rem]", "flex-1 sm:flex-none")}
                disabled={pending || !freeTicketId}
              >
                {pending
                  ? "Registering…"
                  : event.requiresApproval
                    ? "Request to join"
                    : "Complete registration"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
