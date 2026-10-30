import { Suspense } from "react";
import { redirect } from "next/navigation";
import { EventManageHubClient } from "@/components/events/EventManageHubClient";
import { EventManagePageFallback } from "@/components/events/EventManagePageFallback";
import { PageContainer } from "@/components/layout/PageContainer";
import { isDemoStaticUi } from "@/lib/demo-mode";
import { getEventDetail } from "@/lib/events/queries";
import { requireEventOwner } from "@/lib/events/require-event-owner";

type Props = { params: Promise<{ eventId: string }> };

export const instant = true;

export async function generateMetadata({ params }: Props) {
  const { eventId } = await params;
  const event = await getEventDetail(eventId);
  return { title: event ? `Manage · ${event.title}` : "Manage event" };
}

async function EventManageContent({ params }: Props) {
  if (isDemoStaticUi()) redirect("/events");

  const { eventId } = await params;
  const event = await requireEventOwner(eventId);

  return (
    <EventManageHubClient
      eventId={event.id}
      title={event.title}
      communityName={event.communityName}
    />
  );
}

export default function EventManagePage(props: Props) {
  return (
    <PageContainer className="max-w-5xl">
      <Suspense fallback={<EventManagePageFallback />}>
        <EventManageContent {...props} />
      </Suspense>
    </PageContainer>
  );
}
