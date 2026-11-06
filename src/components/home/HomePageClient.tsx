"use client";

import { useLayoutEffect, useMemo, useState } from "react";
import { HomeFeedClient } from "@/components/home/HomeFeedClient";
import { HomeRightSidebar } from "@/components/home/HomeRightSidebar";
import { PageContainer } from "@/components/layout/PageContainer";
import { buildEventsRailPreview } from "@/lib/events/events-rail-preview";
import type { HomeFeedPayload } from "@/lib/posts/load-home-feed";
import {
  fetchHighlightMembers,
  readHighlightMembersCache,
} from "@/lib/communities/home-highlight-members-cache";
import { rememberHomePage } from "@/lib/posts/home-page-cache";
import type { EventListItem } from "@/types/events";

type Props = {
  feed: HomeFeedPayload;
  joinedEvents: EventListItem[];
};

export function HomePageClient({ feed, joinedEvents }: Props) {
  const [activeCommunityId, setActiveCommunityId] = useState(
    () => feed.activeCommunity?.id ?? feed.memberships[0]?.id ?? null,
  );

  const activeCommunityName = useMemo(
    () => feed.memberships.find((m) => m.id === activeCommunityId)?.name ?? null,
    [feed.memberships, activeCommunityId],
  );

  const upcomingEvents = useMemo(
    () => buildEventsRailPreview(joinedEvents, 2).events,
    [joinedEvents],
  );

  const prefetchCommunityIds = useMemo(
    () => feed.memberships.map((m) => m.id),
    [feed.memberships],
  );

  useLayoutEffect(() => {
    rememberHomePage({ feed, joinedEvents });
  }, [feed, joinedEvents]);

  useLayoutEffect(() => {
    for (const id of prefetchCommunityIds) {
      if (!readHighlightMembersCache(id)) {
        void fetchHighlightMembers(id);
      }
    }
  }, [prefetchCommunityIds]);

  return (
    <PageContainer
      withRightRail
      mainColumnScroll
      className="min-h-0 flex-1 lg:max-h-[calc(100dvh-3.875rem)] lg:overflow-hidden"
      rightRail={
        <HomeRightSidebar
          upcomingEvents={upcomingEvents}
          activeCommunityId={activeCommunityId}
          activeCommunityName={activeCommunityName}
          prefetchCommunityIds={prefetchCommunityIds}
        />
      }
    >
      <HomeFeedClient
        initial={feed}
        activeCommunityId={activeCommunityId}
        onActiveCommunityChange={setActiveCommunityId}
      />
    </PageContainer>
  );
}
