import { Skeleton } from "@/components/ui/skeleton";

export function SidebarNavFallback() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden h-dvh w-[276px] border-r border-border bg-card lg:block">
      <div className="space-y-4 p-4">
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </aside>
  );
}

export function TopNavFallback() {
  return (
    <header className="hidden h-[62px] border-b border-border bg-card lg:block">
      <Skeleton className="mx-6 mt-4 h-8 w-full max-w-4xl" />
    </header>
  );
}

export function MobileNavFallback() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 border-t border-border bg-card lg:hidden" />
  );
}
