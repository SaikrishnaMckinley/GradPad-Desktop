import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { EventDetailClient } from "@/components/events/EventDetailClient";
import { EventsRouteLoading } from "@/components/events/EventsRouteLoading";
import { PageContainer } from "@/components/layout/PageContainer";
import { getApiSessionProfile } from "@/lib/auth/get-api-session-profile";
import { isDemoStaticUi } from "@/lib/demo-mode";
import { loadEventRegistrationStatus } from "@/lib/events/actions";
import type { EventRegistrationTicketView } from "@/lib/events/map-event-tickets";
import { getEventAttendeeRoster, getEventDetail } from "@/lib/events/queries";

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
  const event = await getEventDetail(eventId);
  const [profile, attendees] = await Promise.all([
    getApiSessionProfile(),
    event
      ? getEventAttendeeRoster(eventId, { isPublic: event.isPublic })
      : Promise.resolve([]),
  ]);

  if (!event) notFound();
  if (!profile) redirect(`/events/${eventId}/event-invite`);

  let initialRegistration: EventRegistrationTicketView | null = null;
  if (event.isAttendee) {
    const reg = await loadEventRegistrationStatus(eventId);
    initialRegistration = reg.registration;
  }

  return (
    <PageContainer>
      <EventDetailClient
        event={event}
        attendees={attendees}
        viewerName={profile.fullName}
        viewerEmail={profile.email ?? ""}
        initialRegistration={initialRegistration}
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
