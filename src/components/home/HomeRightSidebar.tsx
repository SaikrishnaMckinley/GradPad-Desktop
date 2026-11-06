"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { ProfileAvatarLink } from "@/components/profile/ProfileAvatarLink";
import { ProfileNameLink } from "@/components/profile/ProfileNameLink";
import { Avatar } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useShellData } from "@/components/layout/ShellDataProvider";
import { formatEventCard } from "@/lib/events/format-event-datetime";
import {
  fetchHighlightMembers,
  readHighlightMembersCache,
} from "@/lib/communities/home-highlight-members-cache";
import type { HighlightMember } from "@/lib/communities/pick-highlight-members";
import { chatWithUserPath } from "@/lib/profiles/profile-links";
import { cn } from "@/lib/utils/cn";
import type { EventRailItem } from "@/types/events";

const DEMO_UPCOMING = [
  { id: "d1", title: "Social Circles Collaboration", startAt: "2024-03-09T16:00:00" },
  { id: "d2", title: "Social Circles Collaboration", startAt: "2024-03-14T16:00:00" },
] as const satisfies readonly EventRailItem[];

const railHeader = "px-5 pb-0 pt-5";
const railBody = "space-y-5 px-5 pb-6 pt-5";

type Props = {
  upcomingEvents?: EventRailItem[];
  activeCommunityId?: string | null;
  activeCommunityName?: string | null;
  prefetchCommunityIds?: string[];
};

function PeopleList({
  members,
  loading,
}: {
  members: HighlightMember[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (members.length === 0) {
    return <p className="text-sm text-muted-foreground">No members to show yet.</p>;
  }
  return (
    <div className="space-y-3">
      {members.slice(0, 3).map((person) => (
        <div key={person.userId} className="flex items-start gap-2.5 py-1">
          <ProfileAvatarLink
            userId={person.userId}
            src={person.avatarUrl}
            alt={person.fullName}
            fallback={person.fullName}
            size="sm"
            className="mt-0.5"
          />
          <div className="min-w-0 flex-1 pr-2">
            <ProfileNameLink
              userId={person.userId}
              className="text-[13px] font-semibold leading-tight"
            >
              {person.fullName}
            </ProfileNameLink>
            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
              {person.roleLabel}
            </p>
          </div>
          <Link
            href={chatWithUserPath(person.userId)}
            className={cn(
              buttonVariants({ variant: "secondary", size: "sm" }),
              "h-8 shrink-0 px-2.5 text-xs",
            )}
          >
            Message
          </Link>
        </div>
      ))}
    </div>
  );
}

export function HomeRightSidebar({
  upcomingEvents,
  activeCommunityId = null,
  activeCommunityName = null,
  prefetchCommunityIds = [],
}: Props) {
  const { shellUser, communityContext } = useShellData();
  const isLiveEvents = upcomingEvents !== undefined;
  const eventItems = isLiveEvents ? upcomingEvents : DEMO_UPCOMING;
  const showLiveEmpty = isLiveEvents && upcomingEvents.length === 0;
  const communityCount = communityContext.memberships.length;
  const profileHref = shellUser.username
    ? `/profile/${shellUser.username}`
    : "/settings/profile";

  const [highlights, setHighlights] = useState<HighlightMember[]>([]);
  const [highlightsLoading, setHighlightsLoading] = useState(false);
  const fetchGenRef = useRef(0);

  useLayoutEffect(() => {
    if (!activeCommunityId) {
      setHighlights([]);
      setHighlightsLoading(false);
      return;
    }
    const cached = readHighlightMembersCache(activeCommunityId);
    if (cached) {
      setHighlights(cached);
      setHighlightsLoading(false);
    } else {
      setHighlights([]);
      setHighlightsLoading(true);
    }
  }, [activeCommunityId]);

  useEffect(() => {
    if (!activeCommunityId) return;

    const gen = ++fetchGenRef.current;
    void (async () => {
      const members = await fetchHighlightMembers(activeCommunityId);
      if (gen !== fetchGenRef.current) return;
      setHighlights(members);
      setHighlightsLoading(false);
    })();
  }, [activeCommunityId]);

  useEffect(() => {
    if (prefetchCommunityIds.length === 0) return;

    const idle =
      typeof requestIdleCallback !== "undefined"
        ? requestIdleCallback
        : (cb: () => void) => window.setTimeout(cb, 500);

    idle(() => {
      for (const id of prefetchCommunityIds) {
        if (!id || id === activeCommunityId) continue;
        if (readHighlightMembersCache(id)) continue;
        void fetchHighlightMembers(id);
      }
    });
  }, [prefetchCommunityIds, activeCommunityId]);

  const peopleTitle = activeCommunityName
    ? `People in ${activeCommunityName}`
    : "People you may know";

  const showPeopleSpinner = highlightsLoading && highlights.length === 0;

  return (
    <div className="flex flex-col gap-5 pb-2">
      <Card className="shrink-0 shadow-card">
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

      <Card className="shrink-0 shadow-card">
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

      <Card className="shrink-0 shadow-card">
        <CardHeader className={railHeader}>
          <h3 className="text-[15px] font-semibold leading-tight">{peopleTitle}</h3>
        </CardHeader>
        <CardContent className={cn(railBody, "pt-5")}>
          {!activeCommunityId ? (
            <p className="text-sm text-muted-foreground">Select a community to see members.</p>
          ) : (
            <PeopleList members={highlights} loading={showPeopleSpinner} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
