import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <PageContainer withRightRail rightRail={<HomeRailSkeleton />}>
      <div className="space-y-5">
        <Skeleton className="h-10 w-full max-w-lg rounded-xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    </PageContainer>
  );
}

function HomeRailSkeleton() {
  return (
    <div className="hidden space-y-4 xl:block">
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
    </div>
  );
}
