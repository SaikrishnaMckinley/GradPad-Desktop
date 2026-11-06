"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useActionState, useCallback, useEffect, useState, useTransition } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ProfileAvatarLink } from "@/components/profile/ProfileAvatarLink";
import { EventCheckInResultDialog } from "@/components/events/EventCheckInResultDialog";
import {
  loadEventAttendeesSummary,
  manualCheckInAction,
  submitQrCheckIn,
} from "@/lib/events/manage-actions";
import { formatPostHeaderTime } from "@/lib/events/format-event-datetime";
import {
  listCheckedInAttendees,
  type EventAttendeesSummary,
} from "@/lib/events/map-event-manage";
import { cn } from "@/lib/utils/cn";
import { CheckCircle2, ChevronLeft, RefreshCw } from "lucide-react";

const EventQrScannerPanel = dynamic(
  () =>
    import("@/components/events/EventQrScannerPanel").then((m) => m.EventQrScannerPanel),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-border bg-page-secondary text-sm text-muted-foreground">
        Loading scanner…
      </div>
    ),
  },
);

type Props = {
  eventId: string;
  title: string;
  initialSummary: EventAttendeesSummary | null;
};

type ResultDialogState = {
  open: boolean;
  variant: "loading" | "success" | "error";
  message: string;
};

export function EventCheckInClient({ eventId, title, initialSummary }: Props) {
  const [summary, setSummary] = useState(initialSummary);
  const [refreshing, startRefresh] = useTransition();
  const [resultDialog, setResultDialog] = useState<ResultDialogState>({
    open: false,
    variant: "loading",
    message: "",
  });
  const [manualState, manualAction, manualPending] = useActionState(
    manualCheckInAction.bind(null, eventId),
    null,
  );

  const refreshSummary = useCallback(() => {
    startRefresh(async () => {
      const result = await loadEventAttendeesSummary(eventId);
      if (result.summary) setSummary(result.summary);
    });
  }, [eventId]);

  const bumpCheckedInCounts = useCallback(() => {
    setSummary((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        checkedIn: prev.checkedIn + 1,
        notCheckedIn: Math.max(0, prev.notCheckedIn - 1),
      };
    });
  }, []);

  const handleQrScan = useCallback(
    async (decodedText: string) => {
      setResultDialog({
        open: true,
        variant: "loading",
        message: "Verifying guest QR code…",
      });
      const result = await submitQrCheckIn(eventId, decodedText);
      if (result.error) {
        setResultDialog({ open: true, variant: "error", message: result.error });
        return;
      }
      setResultDialog({
        open: true,
        variant: "success",
        message: result.success ?? "Guest checked in.",
      });
      bumpCheckedInCounts();
      refreshSummary();
    },
    [eventId, bumpCheckedInCounts, refreshSummary],
  );

  useEffect(() => {
    if (!manualPending) return;
    setResultDialog({
      open: true,
      variant: "loading",
      message: "Looking up registration…",
    });
  }, [manualPending]);

  useEffect(() => {
    if (manualState?.error) {
      setResultDialog({ open: true, variant: "error", message: manualState.error });
    }
    if (manualState?.success) {
      setResultDialog({ open: true, variant: "success", message: manualState.success });
      bumpCheckedInCounts();
      refreshSummary();
    }
  }, [manualState, bumpCheckedInCounts, refreshSummary]);

  const checkedInPeople = summary ? listCheckedInAttendees(summary.attendees) : [];

  return (
    <div className="w-full max-w-4xl space-y-6">
      <Link
        href={`/events/${eventId}/manage`}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1 px-0")}
      >
        <ChevronLeft className="h-4 w-4" />
        Manage event
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Check-in</h1>
        <p className="mt-1 text-sm text-muted-foreground">{title}</p>
      </div>

      {summary ? (
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 text-center shadow-card">
            <p className="text-2xl font-bold text-foreground">{summary.totalRegistered}</p>
            <p className="text-xs text-muted-foreground">Registered</p>
          </Card>
          <Card className="p-3 text-center shadow-card">
            <p className="text-2xl font-bold text-success">{summary.checkedIn}</p>
            <p className="text-xs text-muted-foreground">Checked in</p>
          </Card>
          <Card className="p-3 text-center shadow-card">
            <p className="text-2xl font-bold text-foreground">{summary.notCheckedIn}</p>
            <p className="text-xs text-muted-foreground">Remaining</p>
          </Card>
        </div>
      ) : null}

      <Card className="space-y-4 p-5 shadow-card md:p-6">
        <div>
          <h2 className="text-base font-semibold">Scan QR code</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Point your camera at a guest&apos;s registration QR code — same flow as Grad Pad web.
          </p>
        </div>
        <EventQrScannerPanel onScan={handleQrScan} />
      </Card>

      <Card className="space-y-4 p-5 shadow-card">
        <div>
          <h2 className="text-sm font-semibold">Manual check-in</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the email the guest used to register.
          </p>
        </div>
        <form action={manualAction} className="flex flex-col gap-3 sm:flex-row">
          <Input
            name="email"
            type="email"
            placeholder="guest@email.com"
            className="flex-1"
            required
            autoComplete="off"
          />
          <Button type="submit" disabled={manualPending} className="shrink-0">
            {manualPending ? "Checking in…" : "Check in"}
          </Button>
        </form>
      </Card>

      <Card className="space-y-4 p-5 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Checked-in guests</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Everyone who has arrived — same data as Grad Pad web attendees.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5"
            disabled={refreshing}
            onClick={refreshSummary}
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {checkedInPeople.length === 0 ? (
          <p className="text-sm text-muted-foreground">No check-ins yet. Scan a QR code or use manual check-in.</p>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border">
            {checkedInPeople.map((person) => (
              <li key={person.id} className="flex items-center gap-3 px-3 py-3 sm:px-4">
                <ProfileAvatarLink
                  userId={person.userId}
                  src={person.photo}
                  alt={person.name}
                  fallback={person.name}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {person.name}
                    {person.isPlusOne ? (
                      <span className="ml-1.5 text-xs font-normal text-muted-foreground">(Plus one)</span>
                    ) : null}
                  </p>
                  {person.email ? (
                    <p className="truncate text-xs text-muted-foreground">{person.email}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2 text-success">
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    {person.checkInDate ? formatPostHeaderTime(person.checkInDate) : "Checked in"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <EventCheckInResultDialog
        open={resultDialog.open}
        variant={resultDialog.variant}
        message={resultDialog.message}
        onClose={() => setResultDialog((d) => ({ ...d, open: false }))}
      />
    </div>
  );
}
