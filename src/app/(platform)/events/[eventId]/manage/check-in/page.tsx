import { Suspense } from "react";
import { redirect } from "next/navigation";
import { EventCheckInClient } from "@/components/events/EventCheckInClient";
import { EventManagePageFallback } from "@/components/events/EventManagePageFallback";
import { PageContainer } from "@/components/layout/PageContainer";
import { isDemoStaticUi } from "@/lib/demo-mode";
import { loadEventAttendeesSummary } from "@/lib/events/manage-actions";
import { requireEventOwner } from "@/lib/events/require-event-owner";

type Props = { params: Promise<{ eventId: string }> };

export const instant = true;

async function EventCheckInContent({ params }: Props) {
  if (isDemoStaticUi()) redirect("/events");

  const { eventId } = await params;
  const event = await requireEventOwner(eventId);
  const { summary } = await loadEventAttendeesSummary(eventId);

  return (
    <EventCheckInClient eventId={event.id} title={event.title} initialSummary={summary} />
  );
}

export default function EventCheckInPage(props: Props) {
  return (
    <PageContainer className="max-w-5xl">
      <Suspense fallback={<EventManagePageFallback />}>
        <EventCheckInContent {...props} />
      </Suspense>
    </PageContainer>
  );
}
