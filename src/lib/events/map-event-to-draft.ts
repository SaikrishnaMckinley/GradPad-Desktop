import type { EventCreateDraft } from "@/lib/events/event-create-draft";
import { newTicketId } from "@/lib/events/event-create-draft";
import type { EventDetailViewModel } from "@/lib/events/map-event-detail";

export function mapEventDetailToDraft(
  event: EventDetailViewModel,
  locationId: string | null,
): EventCreateDraft {
  const tickets =
    event.tickets.length > 0
      ? event.tickets.map((t) => ({
          id: t.id || newTicketId(),
          name: t.name,
          type: t.isFree ? ("free" as const) : ("paid" as const),
          price: t.isFree ? "" : String(t.cost),
        }))
      : [{ id: newTicketId(), name: "General Admission", type: "free" as const, price: "" }];

  return {
    communityId: event.communityId?.trim() ?? "",
    title: event.title,
    description: event.description,
    startAt: event.startAt,
    endAt: event.endAt,
    location: event.locationLabel ?? "",
    locationId: locationId ?? "",
    isPrivate: !event.isPublic,
    capacity: event.capacity != null ? String(event.capacity) : "",
    capacityLimited: event.capacity != null,
    payoutAccountType: "",
    payoutAccountId: "",
    tickets,
    hosts: [],
    donationsEnabled: false,
    donationGoal: "",
  };
}

export function extractAddressIdFromEventRaw(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const row = data as Record<string, unknown>;
  const address = row.address;
  if (!Array.isArray(address) || address.length === 0) return null;
  const first = address[0] as Record<string, unknown>;
  if (typeof first.id === "string") return first.id;
  return null;
}
