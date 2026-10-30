"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useActionState, useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { loadEventAttendeesSummary, manualCheckInAction } from "@/lib/events/manage-actions";
import type { EventAttendeesSummary } from "@/lib/events/map-event-manage";
import { cn } from "@/lib/utils/cn";
import { ChevronLeft } from "lucide-react";

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

export function EventCheckInClient({ eventId, title, initialSummary }: Props) {
  const [summary, setSummary] = useState(initialSummary);
  const [, startRefresh] = useTransition();
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

  useEffect(() => {
    if (manualState?.error) toast.error(manualState.error);
    if (manualState?.success) {
      toast.success(manualState.success);
      refreshSummary();
    }
  }, [manualState, refreshSummary]);

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
        <EventQrScannerPanel eventId={eventId} onCheckedIn={refreshSummary} />
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
    </div>
  );
}
