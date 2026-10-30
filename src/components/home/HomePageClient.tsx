"use client";

import { useLayoutEffect } from "react";
import { HomeFeedClient } from "@/components/home/HomeFeedClient";
import { HomeRightSidebar } from "@/components/home/HomeRightSidebar";
import { PageContainer } from "@/components/layout/PageContainer";
import type { HomeFeedPayload } from "@/lib/posts/load-home-feed";
import { rememberHomePage } from "@/lib/posts/home-page-cache";
import type { EventRailItem } from "@/types/events";

type Props = {
  feed: HomeFeedPayload;
  upcomingEvents: EventRailItem[];
};

export function HomePageClient({ feed, upcomingEvents }: Props) {
  useLayoutEffect(() => {
    rememberHomePage({ feed, upcomingEvents });
  }, [feed, upcomingEvents]);

  return (
    <PageContainer withRightRail rightRail={<HomeRightSidebar upcomingEvents={upcomingEvents} />}>
      <HomeFeedClient initial={feed} />
    </PageContainer>
  );
}
