"use client";

import { usePathname } from "next/navigation";
import { EventDetailClient } from "@/components/events/EventDetailClient";
import { EventsComingUpRail } from "@/components/events/EventsComingUpRail";
import { EventsPageClient } from "@/components/events/EventsPageClient";
import { PageContainer } from "@/components/layout/PageContainer";
import { useShellData } from "@/components/layout/ShellDataProvider";
import { Skeleton } from "@/components/ui/skeleton";
import {
  readEventsListCache,
  resolveEventDetailFallback,
} from "@/lib/events/events-cache";

function eventIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/events\/([^/]+)(?:\/|$)/);
  const id = match?.[1];
  if (!id || id === "new") return null;
  return id;
}

function EventsListFallback() {
  const cached = readEventsListCache();
  if (cached) {
    return (
      <PageContainer
        withRightRail
        rightRail={<EventsComingUpRail events={cached.railPreview} />}
      >
        <EventsPageClient stagingApi initialEvents={cached.joinedEvents} />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      withRightRail
      rightRail={<Skeleton className="hidden h-48 w-full rounded-2xl xl:block" />}
    >
      <Skeleton className="mb-6 h-16 w-full max-w-md" />
      <Skeleton className="mb-4 h-10 w-56 rounded-xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </PageContainer>
  );
}

function EventDetailFallback({ eventId }: { eventId: string }) {
  const { shellUser } = useShellData();
  const cached = resolveEventDetailFallback(eventId);
  if (cached) {
    return (
      <PageContainer>
        <EventDetailClient
          event={cached}
          viewerName={shellUser.fullName}
          viewerEmail=""
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Skeleton className="mb-4 h-8 w-32" />
      <Skeleton className="aspect-[21/9] w-full rounded-2xl" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-56 rounded-2xl" />
      </div>
    </PageContainer>
  );
}

function EventsFormFallback() {
  return (
    <PageContainer>
      <Skeleton className="mb-4 h-8 w-40" />
      <Skeleton className="h-[480px] w-full rounded-2xl" />
    </PageContainer>
  );
}

export function EventsRouteLoading() {
  const pathname = usePathname();
  const eventId = eventIdFromPath(pathname);

  if (pathname.includes("/edit") || pathname.includes("/register")) {
    return <EventsFormFallback />;
  }

  if (eventId) {
    return <EventDetailFallback eventId={eventId} />;
  }

  return <EventsListFallback />;
}
