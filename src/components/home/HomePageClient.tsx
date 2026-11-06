"use client";

import { useLayoutEffect, useMemo } from "react";
import { HomeFeedClient } from "@/components/home/HomeFeedClient";
import { HomeRightSidebar } from "@/components/home/HomeRightSidebar";
import { PageContainer } from "@/components/layout/PageContainer";
import { buildEventsRailPreview } from "@/lib/events/events-rail-preview";
import type { HomeFeedPayload } from "@/lib/posts/load-home-feed";
import { rememberHomePage } from "@/lib/posts/home-page-cache";
import type { EventListItem } from "@/types/events";

type Props = {
  feed: HomeFeedPayload;
  joinedEvents: EventListItem[];
};

export function HomePageClient({ feed, joinedEvents }: Props) {
  const upcomingEvents = useMemo(
    () => buildEventsRailPreview(joinedEvents, 2).events,
    [joinedEvents],
  );

  useLayoutEffect(() => {
    rememberHomePage({ feed, joinedEvents });
  }, [feed, joinedEvents]);

  return (
    <PageContainer withRightRail rightRail={<HomeRightSidebar upcomingEvents={upcomingEvents} />}>
      <HomeFeedClient initial={feed} />
    </PageContainer>
  );
}
