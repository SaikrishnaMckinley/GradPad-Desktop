import { Suspense } from "react";
import { HomePageClient } from "@/components/home/HomePageClient";
import { HomeRouteLoading } from "@/components/home/HomeRouteLoading";
import { CommunityFilters } from "@/components/home/CommunityFilters";
import { FeaturedEventCard } from "@/components/home/FeaturedEventCard";
import { HomeRightSidebar } from "@/components/home/HomeRightSidebar";
import { PostCard } from "@/components/home/PostCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { isDemoStaticUi } from "@/lib/demo-mode";
import { getUpcomingEventsPreview } from "@/lib/events/queries";
import { loadHomeFeed } from "@/lib/posts/load-home-feed";

export const metadata = {
  title: "Home",
};

export const instant = true;

type Props = {
  searchParams: Promise<{ community?: string }>;
};

async function HomePageContent({ searchParams }: Props) {
  const { community } = await searchParams;

  const [feed, upcomingEvents] = await Promise.all([
    loadHomeFeed(typeof community === "string" ? community : null),
    getUpcomingEventsPreview(2),
  ]);

  return <HomePageClient feed={feed} upcomingEvents={upcomingEvents} />;
}

export default async function HomePage(props: Props) {
  if (isDemoStaticUi()) {
    return (
      <PageContainer withRightRail rightRail={<HomeRightSidebar />}>
        <div className="space-y-5">
          <CommunityFilters />
          <FeaturedEventCard />
          <PostCard />
        </div>
      </PageContainer>
    );
  }

  return (
    <Suspense fallback={<HomeRouteLoading />}>
      <HomePageContent {...props} />
    </Suspense>
  );
}
