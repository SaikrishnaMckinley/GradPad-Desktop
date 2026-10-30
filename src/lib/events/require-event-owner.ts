import "server-only";

import { notFound, redirect } from "next/navigation";
import { getEventDetail } from "@/lib/events/queries";

export async function requireEventOwner(eventId: string) {
  const event = await getEventDetail(eventId);
  if (!event) notFound();
  if (!event.isOwner) redirect(`/events/${eventId}`);
  return event;
}
