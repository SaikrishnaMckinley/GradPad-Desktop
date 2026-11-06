import { parseEventRegistrationDonationFromDetail } from "@/lib/events/event-donation";
import { resolveEventImageUrl } from "@/lib/events/event-image";
import type { PublicEventGuestView, PublicEventTicket } from "@/lib/events/public-event-types";
import { orderEventTicketsForDisplay } from "@/lib/events/ticket-sale-window";

function mapTicketRow(t: Record<string, unknown>): PublicEventTicket | null {
  if (!t || typeof t.id !== "string") return null;
  return {
    id: String(t.id),
    name: typeof t.name === "string" ? t.name : undefined,
    description: typeof t.description === "string" ? t.description : undefined,
    cost: t.cost as number | string | null | undefined,
    is_free: t.is_free === true,
    sale_status: t.sale_status as PublicEventTicket["sale_status"],
    sale_starts_at: typeof t.sale_starts_at === "string" ? t.sale_starts_at : null,
    sale_ends_at: typeof t.sale_ends_at === "string" ? t.sale_ends_at : null,
    limit_sales: t.limit_sales === true,
    allowed_sales: typeof t.allowed_sales === "number" ? t.allowed_sales : null,
    sales: typeof t.sales === "number" ? t.sales : null,
    remaining: typeof t.remaining === "number" ? t.remaining : null,
    remaining_tickets: typeof t.remaining_tickets === "number" ? t.remaining_tickets : null,
    quantity_available:
      typeof t.quantity_available === "number" ? t.quantity_available : null,
    created_at: typeof t.created_at === "string" ? t.created_at : null,
  };
}

export function isTicketFree(ticket: PublicEventTicket): boolean {
  if (ticket.is_free) return true;
  const cost = Number(ticket.cost ?? 0);
  return !Number.isFinite(cost) || cost <= 0;
}

export function ticketPriceLabel(ticket: PublicEventTicket): string {
  if (isTicketFree(ticket)) return "Free";
  const cost = Number(ticket.cost ?? 0);
  if (!Number.isFinite(cost)) return "Paid";
  return `$${cost.toFixed(cost % 1 === 0 ? 0 : 2)}`;
}

export { getDefaultPurchasableTicketId as defaultPublicGuestTicketId } from "@/lib/events/ticket-sale-window";

export function shouldShowTicketPicker(tickets: PublicEventTicket[]): boolean {
  if (tickets.length === 0) return false;
  if (tickets.length === 1 && isTicketFree(tickets[0])) return false;
  return true;
}

export function mapPublicEventRecord(raw: Record<string, unknown>): PublicEventGuestView | null {
  const id = typeof raw.id === "string" ? raw.id : null;
  if (!id) return null;

  const community = raw.community as Record<string, unknown> | undefined;
  const rawTickets = Array.isArray(raw.tickets)
    ? (raw.tickets as Record<string, unknown>[])
    : [];

  const tickets = orderEventTicketsForDisplay(
    rawTickets
      .map((t) => mapTicketRow(t as Record<string, unknown>))
      .filter((t): t is PublicEventTicket => t !== null),
  );
  const donation = parseEventRegistrationDonationFromDetail(raw);

  const location =
    (typeof raw.location_display === "string" && raw.location_display) ||
    (typeof raw.location === "string" && raw.location) ||
    "";

  return {
    id,
    title: typeof raw.title === "string" ? raw.title : "Event",
    description: typeof raw.description === "string" ? raw.description : "",
    imageUrl: resolveEventImageUrl(raw),
    location,
    startDate: typeof raw.start_date === "string" ? raw.start_date : undefined,
    startTime: typeof raw.start_time === "string" ? raw.start_time : undefined,
    endDate: typeof raw.end_date === "string" ? raw.end_date : undefined,
    endTime: typeof raw.end_time === "string" ? raw.end_time : undefined,
    isPublic: raw.is_public !== false,
    allowGuest: raw.allow_guest !== false && raw.allow_plus_one !== false,
    communityId:
      (typeof raw.community_id === "string" && raw.community_id) ||
      (typeof community?.id === "string" ? community.id : undefined),
    communityName:
      (typeof raw.community_name === "string" && raw.community_name) ||
      (typeof community?.name === "string" ? community.name : undefined),
    attendeeCount:
      typeof raw.attendee_count === "number"
        ? raw.attendee_count
        : typeof raw.attendees_count === "number"
          ? raw.attendees_count
          : 0,
    capacity: typeof raw.capacity === "number" ? raw.capacity : undefined,
    tickets,
    donation,
  };
}
