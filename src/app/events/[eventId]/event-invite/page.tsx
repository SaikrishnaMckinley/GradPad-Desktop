import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EventInviteGuest } from "@/components/events/EventInviteGuest";
import { fetchPublicEventRaw } from "@/lib/api/public-events";
import { mapPublicEventRecord } from "@/lib/events/map-public-event";
import { getSessionTokens } from "@/lib/auth/session-cookies";

export const instant = false;

type PageProps = {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ view?: string; email?: string; guest_email?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { eventId } = await params;
  const open = await fetchPublicEventRaw(eventId);
  const mapped = open.ok && open.data ? mapPublicEventRecord(open.data) : null;
  return { title: mapped?.title ? `RSVP · ${mapped.title}` : "Event invite" };
}

export default async function EventInvitePage({ params, searchParams }: PageProps) {
  const { eventId } = await params;
  const query = await searchParams;
  const id = eventId.trim();

  if (!id) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        This event link is invalid. Check the link and try again.
      </p>
    );
  }

  const { access } = await getSessionTokens();
  if (access) {
    redirect(`/events/${id}`);
  }

  const open = await fetchPublicEventRaw(id);
  if (!open.ok || !open.data) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        This event could not be loaded. The link may be invalid or the event is no longer
        available.
      </p>
    );
  }

  const event = mapPublicEventRecord(open.data);
  if (!event) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        This event link is invalid. Check the link and try again.
      </p>
    );
  }

  const initialView = query.view === "login" ? "login" : "signup";
  const initialEmail =
    typeof query.email === "string"
      ? query.email
      : typeof query.guest_email === "string"
        ? query.guest_email
        : "";

  return (
    <EventInviteGuest
      event={event}
      initialView={initialView}
      initialEmail={initialEmail}
      stripeGuestEmail={
        typeof query.guest_email === "string" ? query.guest_email : undefined
      }
    />
  );
}
