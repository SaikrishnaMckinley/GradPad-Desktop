import { notFound, redirect } from "next/navigation";
import { EventRegisterClient } from "@/components/events/EventRegisterClient";
import { PageContainer } from "@/components/layout/PageContainer";
import { getApiSessionProfile } from "@/lib/auth/get-api-session-profile";
import { isDemoStaticUi } from "@/lib/demo-mode";
import { getEventDetail } from "@/lib/events/queries";

type Props = { params: Promise<{ eventId: string }> };

export async function generateMetadata({ params }: Props) {
  const { eventId } = await params;
  return { title: `Register · ${eventId}` };
}

export default async function EventRegisterPage({ params }: Props) {
  if (isDemoStaticUi()) redirect("/events");

  const { eventId } = await params;
  const [event, profile] = await Promise.all([
    getEventDetail(eventId),
    getApiSessionProfile(),
  ]);

  if (!event) notFound();
  if (!profile) redirect("/login");

  return (
    <PageContainer>
      <EventRegisterClient
        event={event}
        viewerName={profile.fullName}
        viewerEmail={profile.email ?? ""}
      />
    </PageContainer>
  );
}
