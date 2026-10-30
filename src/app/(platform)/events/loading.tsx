import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/skeleton";

export default function EventsLoading() {
  return (
    <PageContainer withRightRail rightRail={<Skeleton className="hidden h-48 w-full rounded-2xl xl:block" />}>
      <Skeleton className="mb-6 h-16 w-full max-w-md" />
      <Skeleton className="mb-4 h-10 w-56 rounded-xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </PageContainer>
  );
}
