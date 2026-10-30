import { CommunityFilters } from "@/components/home/CommunityFilters";
import { FeaturedEventCard } from "@/components/home/FeaturedEventCard";
import { HomeFeedClient } from "@/components/home/HomeFeedClient";
import { HomeRightSidebar } from "@/components/home/HomeRightSidebar";
import { PostCard } from "@/components/home/PostCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { isDemoStaticUi } from "@/lib/demo-mode";
import { getUpcomingEventsPreview } from "@/lib/events/queries";
import { loadHomeFeed } from "@/lib/posts/load-home-feed";

export const metadata = {
  title: "Home",
};

type Props = {
  searchParams: Promise<{ community?: string }>;
};

export default async function HomePage({ searchParams }: Props) {
  const { community } = await searchParams;

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

  const [feed, upcomingEvents] = await Promise.all([
    loadHomeFeed(typeof community === "string" ? community : null),
    getUpcomingEventsPreview(2),
  ]);

  return (
    <PageContainer withRightRail rightRail={<HomeRightSidebar upcomingEvents={upcomingEvents} />}>
      <HomeFeedClient initial={feed} />
    </PageContainer>
  );
}
