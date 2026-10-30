import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { EventDetailClient } from "@/components/events/EventDetailClient";
import { EventsRouteLoading } from "@/components/events/EventsRouteLoading";
import { PageContainer } from "@/components/layout/PageContainer";
import { getApiSessionProfile } from "@/lib/auth/get-api-session-profile";
import { isDemoStaticUi } from "@/lib/demo-mode";
import { getEventDetail } from "@/lib/events/queries";

type Props = { params: Promise<{ eventId: string }> };

export const instant = true;

export async function generateMetadata({ params }: Props) {
  const { eventId } = await params;
  const event = await getEventDetail(eventId);
  return { title: event?.title ?? "Event" };
}

async function EventDetailContent({ params }: Props) {
  if (isDemoStaticUi()) {
    redirect("/events");
  }

  const { eventId } = await params;
  const [event, profile] = await Promise.all([
    getEventDetail(eventId),
    getApiSessionProfile(),
  ]);

  if (!event) notFound();
  if (!profile) redirect("/login");

  return (
    <PageContainer>
      <EventDetailClient
        event={event}
        viewerName={profile.fullName}
        viewerEmail={profile.email ?? ""}
      />
    </PageContainer>
  );
}

export default function EventDetailPage(props: Props) {
  return (
    <Suspense fallback={<EventsRouteLoading />}>
      <EventDetailContent {...props} />
    </Suspense>
  );
}
