import { CommunityFilters } from "@/components/home/CommunityFilters";
import { FeaturedEventCard } from "@/components/home/FeaturedEventCard";
import { HomeFeedClient } from "@/components/home/HomeFeedClient";
import { HomeRightSidebar } from "@/components/home/HomeRightSidebar";
import { PostCard } from "@/components/home/PostCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { isDemoStaticUi } from "@/lib/demo-mode";
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

  const feed = await loadHomeFeed(typeof community === "string" ? community : null);

  return (
    <PageContainer withRightRail rightRail={<HomeRightSidebar />}>
      <HomeFeedClient initial={feed} />
    </PageContainer>
  );
}
