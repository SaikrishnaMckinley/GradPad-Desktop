import { CommunityFilters } from "@/components/home/CommunityFilters";
import { FeaturedEventCard } from "@/components/home/FeaturedEventCard";
import { HomeRightSidebar } from "@/components/home/HomeRightSidebar";
import { PostCard } from "@/components/home/PostCard";
import { PageContainer } from "@/components/layout/PageContainer";

export const metadata = {
  title: "Home",
};

export default function HomePage() {
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
