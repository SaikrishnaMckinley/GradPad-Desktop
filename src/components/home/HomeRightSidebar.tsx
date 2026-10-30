"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useShellData } from "@/components/layout/ShellDataProvider";
import { formatEventCard } from "@/lib/events/format-event-datetime";
import { cn } from "@/lib/utils/cn";
import type { EventRailItem } from "@/types/events";

const DEMO_UPCOMING = [
  { id: "d1", title: "Social Circles Collaboration", startAt: "2024-03-09T16:00:00" },
  { id: "d2", title: "Social Circles Collaboration", startAt: "2024-03-14T16:00:00" },
] as const satisfies readonly EventRailItem[];

const SUGGESTIONS = [
  { name: "Ema Watson", detail: "UCLA · Class of 2020" },
  { name: "Jennie Whiesly", detail: "Duke University · Class of 2019" },
  { name: "Maya Chen", detail: "UCLA · Class of 2021" },
] as const;

const railHeader = "px-5 pb-0 pt-5";
const railBody = "space-y-5 px-5 pb-6 pt-5";

type Props = {
  upcomingEvents?: EventRailItem[];
};

export function HomeRightSidebar({ upcomingEvents }: Props) {
  const { shellUser, communityContext } = useShellData();
  const isLiveEvents = upcomingEvents !== undefined;
  const eventItems = isLiveEvents ? upcomingEvents : DEMO_UPCOMING;
  const showLiveEmpty = isLiveEvents && upcomingEvents.length === 0;
  const communityCount = communityContext.memberships.length;
  const profileHref = shellUser.username
    ? `/profile/${shellUser.username}`
    : "/settings/profile";

  return (
    <div className="space-y-5 pb-2">
      <Card className="shadow-card">
        <CardContent className="px-5 pb-6 pt-5">
          <div className="flex flex-col items-center text-center">
            <Link href={profileHref} className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
              <Avatar
                alt={shellUser.fullName}
                fallback={shellUser.fullName}
                src={shellUser.avatarUrl}
                size="lg"
              />
            </Link>
            <Link href={profileHref} className="mt-4 hover:underline">
              <h2 className="text-[15px] font-semibold">{shellUser.fullName}</h2>
            </Link>
            <p className="mt-1 text-xs text-muted-foreground">
              {shellUser.headline || "GradPad member"}
            </p>
            <div className="mt-5 grid w-full grid-cols-2 gap-3 border-t border-border pt-5">
              <div>
                <p className="text-base font-semibold">{communityCount}</p>
                <p className="text-xs text-muted-foreground">
                  {communityCount === 1 ? "Community" : "Communities"}
                </p>
              </div>
              <Link href={profileHref} className="rounded-lg transition-colors hover:bg-page-secondary">
                <p className="text-base font-semibold text-primary">View</p>
                <p className="text-xs text-muted-foreground">Profile</p>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader className={cn(railHeader, "flex flex-row items-center justify-between gap-2")}>
          <h3 className="text-[15px] font-semibold leading-tight">Upcoming events</h3>
          <Link
            href="/events"
            className="shrink-0 text-xs font-medium text-primary hover:underline"
          >
            View calendar
          </Link>
        </CardHeader>
        <CardContent className={railBody}>
          {showLiveEmpty ? (
            <p className="text-sm text-muted-foreground">No upcoming events.</p>
          ) : (
            eventItems.map((event) => {
              const { day, month, time } = formatEventCard(event.startAt);
              return (
                <div key={event.id} className="flex gap-3 py-0.5">
                  <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg border border-primary-border bg-primary-light text-primary">
                    <span className="text-[10px] font-bold uppercase leading-none">{day}</span>
                    <span className="mt-0.5 text-[10px] font-semibold uppercase leading-none">
                      {month}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold leading-snug line-clamp-2">
                      {event.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{time}</p>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader className={railHeader}>
          <h3 className="text-[15px] font-semibold leading-tight">People you may know</h3>
        </CardHeader>
        <CardContent className={railBody}>
          {SUGGESTIONS.map((person) => (
            <div key={person.name} className="flex items-start gap-2.5 py-1">
              <Avatar alt={person.name} fallback={person.name} size="sm" className="mt-0.5" />
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-[13px] font-semibold leading-tight">{person.name}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                  {person.detail}
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="h-8 shrink-0 px-2.5 text-xs"
              >
                Connect
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
