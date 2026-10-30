import { Suspense } from "react";
import { redirect } from "next/navigation";
import { EventStatisticsClient } from "@/components/events/EventStatisticsClient";
import { EventManagePageFallback } from "@/components/events/EventManagePageFallback";
import { PageContainer } from "@/components/layout/PageContainer";
import { isDemoStaticUi } from "@/lib/demo-mode";
import { loadEventManageStatistics } from "@/lib/events/manage-actions";
import { requireEventOwner } from "@/lib/events/require-event-owner";

type Props = { params: Promise<{ eventId: string }> };

export const instant = true;

async function EventStatisticsContent({ params }: Props) {
  if (isDemoStaticUi()) redirect("/events");

  const { eventId } = await params;
  await requireEventOwner(eventId);
  const { stats, error } = await loadEventManageStatistics(eventId);

  return (
    <EventStatisticsClient eventId={eventId} initialStats={stats} loadError={error ?? null} />
  );
}

export default function EventStatisticsPage(props: Props) {
  return (
    <PageContainer className="max-w-5xl">
      <Suspense fallback={<EventManagePageFallback />}>
        <EventStatisticsContent {...props} />
      </Suspense>
    </PageContainer>
  );
}
