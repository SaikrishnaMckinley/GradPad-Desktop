"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { loadEventManageStatistics } from "@/lib/events/manage-actions";
import type { EventManageStatistics } from "@/lib/events/map-event-manage";
import { formatPostHeaderTime } from "@/lib/events/format-event-datetime";
import { cn } from "@/lib/utils/cn";
import { ChevronLeft, RefreshCw, Users, UserCheck } from "lucide-react";

type Props = {
  eventId: string;
  initialStats: EventManageStatistics | null;
  loadError: string | null;
};

export function EventStatisticsClient({ eventId, initialStats, loadError }: Props) {
  const [stats, setStats] = useState(initialStats);
  const [error, setError] = useState(loadError);
  const [refreshing, startRefresh] = useTransition();

  function refresh() {
    startRefresh(async () => {
      const result = await loadEventManageStatistics(eventId);
      setError(result.error ?? null);
      if (result.stats) setStats(result.stats);
    });
  }

  useEffect(() => {
    const id = window.setInterval(refresh, 15_000);
    return () => window.clearInterval(id);
  }, [eventId]);

  const checkInRate =
    stats && stats.totalPeople > 0
      ? Math.round((stats.checkedIn / stats.totalPeople) * 100)
      : 0;

  return (
    <div className="w-full max-w-4xl space-y-6">
      <Link
        href={`/events/${eventId}/manage`}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1 px-0")}
      >
        <ChevronLeft className="h-4 w-4" />
        Manage event
      </Link>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Event statistics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {stats?.eventTitle ?? "Live attendance for your event"}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          disabled={refreshing}
          onClick={refresh}
        >
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {error && !stats ? (
        <Card className="p-5 text-sm text-destructive shadow-card">{error}</Card>
      ) : null}

      {stats ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="p-4 shadow-card">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">Registered</span>
              </div>
              <p className="mt-2 text-3xl font-bold">{stats.totalPeople}</p>
            </Card>
            <Card className="p-4 shadow-card">
              <div className="flex items-center gap-2 text-success">
                <UserCheck className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">Checked in</span>
              </div>
              <p className="mt-2 text-3xl font-bold text-success">{stats.checkedIn}</p>
            </Card>
            <Card className="p-4 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Check-in rate
              </p>
              <p className="mt-2 text-3xl font-bold">{checkInRate}%</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {stats.notCheckedIn} not checked in
              </p>
            </Card>
          </div>

          <Card className="p-5 shadow-card">
            <h2 className="text-sm font-semibold">Recent check-ins</h2>
            {stats.checkInActivity.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No check-ins yet.</p>
            ) : (
              <ul className="mt-3 divide-y divide-border">
                {stats.checkInActivity.slice(0, 12).map((row) => (
                  <li key={row.id} className="flex items-center justify-between gap-3 py-3">
                    <span className="text-sm font-medium">{row.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatPostHeaderTime(row.checkInDate)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      ) : null}
    </div>
  );
}
