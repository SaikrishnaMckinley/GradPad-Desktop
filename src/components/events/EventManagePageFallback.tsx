import { Skeleton } from "@/components/ui/skeleton";

export function EventManagePageFallback() {
  return (
    <div className="w-full max-w-4xl space-y-6">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-10 w-64 max-w-full" />
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-36 w-full rounded-2xl" />
    </div>
  );
}
