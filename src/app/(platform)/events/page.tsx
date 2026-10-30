import { EventsComingUpRail } from "@/components/events/EventsComingUpRail";
import { EventsPageClient } from "@/components/events/EventsPageClient";
import { PageContainer } from "@/components/layout/PageContainer";
import { usesStagingApi } from "@/lib/demo-mode";
import { getJoinedEvents, getUpcomingEventsPreview } from "@/lib/events/queries";

export const metadata = {
  title: "Events",
};

export const instant = true;

export default async function EventsPage() {
  const stagingApi = usesStagingApi();
  let joinedEvents: Awaited<ReturnType<typeof getJoinedEvents>> = [];
  let railPreview: Awaited<ReturnType<typeof getUpcomingEventsPreview>> | undefined;
  if (stagingApi) {
    [joinedEvents, railPreview] = await Promise.all([
      getJoinedEvents(),
      getUpcomingEventsPreview(3),
    ]);
  }

  return (
    <PageContainer
      withRightRail
      rightRail={<EventsComingUpRail events={stagingApi ? railPreview : undefined} />}
    >
      <EventsPageClient stagingApi={stagingApi} initialEvents={joinedEvents} />
    </PageContainer>
  );
}
