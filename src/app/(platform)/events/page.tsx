import { EventsComingUpRail } from "@/components/events/EventsComingUpRail";
import { EventsComingUpRailLive } from "@/components/events/EventsComingUpRailLive";
import { EventsPageClient } from "@/components/events/EventsPageClient";
import { PageContainer } from "@/components/layout/PageContainer";
import { usesStagingApi } from "@/lib/demo-mode";
import { getJoinedEvents } from "@/lib/events/queries";

export const metadata = {
  title: "Events",
};

export const instant = true;

export default async function EventsPage() {
  const stagingApi = usesStagingApi();
  const joinedEvents = stagingApi ? await getJoinedEvents() : [];

  return (
    <PageContainer
      withRightRail
      rightRail={
        stagingApi ? (
          <EventsComingUpRailLive events={joinedEvents} />
        ) : (
          <EventsComingUpRail />
        )
      }
    >
      <EventsPageClient stagingApi={stagingApi} initialEvents={joinedEvents} />
    </PageContainer>
  );
}
