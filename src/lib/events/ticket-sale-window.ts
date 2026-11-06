import { formatStableDateTime } from "@/lib/format-stable-datetime";
import type { PublicEventTicket } from "@/lib/events/public-event-types";

export type TicketWithDisplayState = PublicEventTicket & {
  displayState: "available" | "upcoming" | "sold_out";
  salePhase: "upcoming" | "active" | "ended";
};

function parseWhen(raw?: string | null): Date | null {
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function getTicketRemainingCount(ticket: PublicEventTicket | null | undefined): number | null {
  if (!ticket) return null;
  if (typeof ticket.remaining === "number") return Math.max(ticket.remaining, 0);
  if (typeof ticket.remaining_tickets === "number") {
    return Math.max(ticket.remaining_tickets, 0);
  }
  if (typeof ticket.quantity_available === "number") {
    return Math.max(ticket.quantity_available, 0);
  }
  if (
    ticket.limit_sales &&
    typeof ticket.allowed_sales === "number" &&
    typeof ticket.sales === "number"
  ) {
    return Math.max(ticket.allowed_sales - ticket.sales, 0);
  }
  if (typeof ticket.allowed_sales === "number" && ticket.allowed_sales > 0) {
    const sold = typeof ticket.sales === "number" ? ticket.sales : 0;
    return Math.max(ticket.allowed_sales - sold, 0);
  }
  return null;
}

export function getTicketSalePhase(
  ticket: PublicEventTicket,
  now: Date = new Date(),
): "upcoming" | "active" | "ended" {
  const starts = parseWhen(ticket.sale_starts_at);
  const ends = parseWhen(ticket.sale_ends_at);
  if (starts && now < starts) return "upcoming";
  if (ends && now > ends) return "ended";
  return "active";
}

export function isTicketQuantitySoldOut(ticket: PublicEventTicket): boolean {
  return getTicketRemainingCount(ticket) === 0;
}

export function isTicketPurchasable(ticket: PublicEventTicket, now: Date = new Date()): boolean {
  if (getTicketSalePhase(ticket, now) !== "active") return false;
  if (isTicketQuantitySoldOut(ticket)) return false;
  return true;
}

function usesSequentialTicketRelease(tickets: PublicEventTicket[]): boolean {
  if (tickets.length <= 1) return false;
  return tickets.some((t) => Boolean(t.sale_starts_at || t.sale_ends_at));
}

export function orderEventTicketsForDisplay(tickets: PublicEventTicket[]): PublicEventTicket[] {
  if (usesSequentialTicketRelease(tickets)) {
    return [...tickets].sort((a, b) => {
      const aCreated = a.created_at ?? "";
      const bCreated = b.created_at ?? "";
      if (aCreated !== bCreated) return aCreated.localeCompare(bCreated);
      return String(a.id).localeCompare(String(b.id));
    });
  }
  return [...tickets].sort((a, b) => {
    const ca = Number(a.cost ?? 0);
    const cb = Number(b.cost ?? 0);
    return (Number.isFinite(ca) ? ca : 0) - (Number.isFinite(cb) ? cb : 0);
  });
}

export function applySequentialTicketVisibility(
  orderedTickets: PublicEventTicket[],
  now: Date = new Date(),
): TicketWithDisplayState[] {
  return orderedTickets.map((ticket) => {
    const salePhase = getTicketSalePhase(ticket, now);
    let displayState: TicketWithDisplayState["displayState"] = "available";
    if (salePhase === "upcoming") displayState = "upcoming";
    else if (!isTicketPurchasable(ticket, now)) displayState = "sold_out";
    return { ...ticket, displayState, salePhase };
  });
}

export function getDefaultPurchasableTicketId(
  tickets: PublicEventTicket[],
  now: Date = new Date(),
): string | null {
  const ordered = orderEventTicketsForDisplay(tickets);
  const visible = applySequentialTicketVisibility(ordered, now);
  const pick =
    visible.find((t) => t.displayState === "available" && isTicketPurchasable(t, now)) ??
    visible.find((t) => t.displayState !== "sold_out") ??
    visible[0];
  return pick ? String(pick.id) : null;
}

function formatTicketSaleMoment(raw?: string | null): string | null {
  if (!raw) return null;
  return formatStableDateTime(raw);
}

/** Limited inventory + sale end labels for guest invite (unlimited → no count). */
export function formatTicketSupportingDetails(ticket: TicketWithDisplayState): string[] {
  const details: string[] = [];
  const remaining = getTicketRemainingCount(ticket);

  if (ticket.displayState === "sold_out" || remaining === 0) {
    details.push("Sold out");
    return details;
  }

  if (ticket.displayState === "upcoming") {
    details.push("Not on sale yet");
    const opens = formatTicketSaleMoment(ticket.sale_starts_at);
    if (opens) details.push(`Opens ${opens}`);
    return details;
  }

  if (remaining !== null) {
    details.push(`${remaining} ${remaining === 1 ? "ticket" : "tickets"} left`);
  }

  const ends = formatTicketSaleMoment(ticket.sale_ends_at);
  if (ends) details.push(`Sales end ${ends}`);

  return details;
}
