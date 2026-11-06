import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { EventRegisterClient } from "@/components/events/EventRegisterClient";
import { EventsRouteLoading } from "@/components/events/EventsRouteLoading";
import { PageContainer } from "@/components/layout/PageContainer";
import { getApiSessionProfile } from "@/lib/auth/get-api-session-profile";
import { isDemoStaticUi } from "@/lib/demo-mode";
import { getEventDetail, getEventRegistrationDonationContext } from "@/lib/events/queries";

type Props = { params: Promise<{ eventId: string }> };

export const instant = true;

export async function generateMetadata({ params }: Props) {
  const { eventId } = await params;
  const event = await getEventDetail(eventId);
  return { title: event ? `Register · ${event.title}` : "Register" };
}

async function EventRegisterContent({ params }: Props) {
  if (isDemoStaticUi()) redirect("/events");

  const { eventId } = await params;
  const [event, profile, donationContext] = await Promise.all([
    getEventDetail(eventId),
    getApiSessionProfile(),
    getEventRegistrationDonationContext(eventId),
  ]);

  if (!event) notFound();
  if (!profile) redirect("/login");

  return (
    <PageContainer>
      <EventRegisterClient
        event={event}
        viewerName={profile.fullName}
        viewerEmail={profile.email ?? ""}
        donationContext={donationContext}
      />
    </PageContainer>
  );
}

export default function EventRegisterPage(props: Props) {
  return (
    <Suspense fallback={<EventsRouteLoading />}>
      <EventRegisterContent {...props} />
    </Suspense>
  );
}
