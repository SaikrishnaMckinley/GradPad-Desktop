"use client";

import { HomePageClient } from "@/components/home/HomePageClient";
import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { readHomePageCache } from "@/lib/posts/home-page-cache";

function HomeSkeleton() {
  return (
    <PageContainer
      withRightRail
      rightRail={
        <div className="hidden space-y-4 xl:block">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      }
    >
      <div className="space-y-5">
        <Skeleton className="h-10 w-full max-w-lg rounded-xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    </PageContainer>
  );
}

export function HomeRouteLoading() {
  const cached = readHomePageCache();
  if (cached) {
    return (
      <HomePageClient feed={cached.feed} upcomingEvents={cached.upcomingEvents} />
    );
  }
  return <HomeSkeleton />;
}
