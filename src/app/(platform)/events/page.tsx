import { EventsComingUpRail } from "@/components/events/EventsComingUpRail";
import { EventsPageClient } from "@/components/events/EventsPageClient";
import { PageContainer } from "@/components/layout/PageContainer";

export const metadata = {
  title: "Events",
};

export default function EventsPage() {
  return (
    <PageContainer withRightRail rightRail={<EventsComingUpRail />}>
      <EventsPageClient />
    </PageContainer>
  );
}
