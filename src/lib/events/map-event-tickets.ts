import { normalizeEventQrCode } from "@/lib/events/public-guest-registration";

export type EventTicketHolder = {
  id: string;
  full_name: string;
  email: string;
  qr_code: string;
  is_checked_in: boolean;
  check_in_date: string | null;
  has_plus_one: boolean;
  ticket_type: "primary" | "secondary" | "plus_one";
};

/** Map API registration rows to view-ticket carousel items (gradpad-web). */
export function mapRegistrationsToAllTickets(
  registrations: Array<Record<string, unknown>>,
): EventTicketHolder[] {
  if (!registrations.length) return [];

  const hasAnyPlusOne = registrations.some((reg) => reg.has_plus_one === true);

  return registrations.map((reg, index) => {
    const total = registrations.length;
    const isLast = index === total - 1;
    const ticketType: EventTicketHolder["ticket_type"] =
      index === 0 ? "primary" : isLast && hasAnyPlusOne ? "plus_one" : "secondary";

    return {
      id: String(reg.id ?? index),
      full_name: `${reg.first_name ?? ""} ${reg.last_name ?? ""}`.trim(),
      email: String(reg.email ?? ""),
      qr_code: normalizeEventQrCode(reg.qr_code as string | null | undefined),
      is_checked_in: Boolean(reg.is_checked_in),
      check_in_date: (reg.check_in_date as string | null) ?? null,
      has_plus_one: Boolean(reg.has_plus_one),
      ticket_type: ticketType,
    };
  });
}

export type EventRegistrationTicketView = {
  status: string;
  tickets: EventTicketHolder[];
  payment: Record<string, unknown> | null;
  ticketName: string;
  ticketIsFree: boolean;
  ticketUnitCost: number;
  registrantFirstName: string;
  registrantLastName: string;
  registrantEmail: string;
  qrCode: string;
};

export function mapRegistrationStatusPayload(data: unknown): EventRegistrationTicketView | null {
  if (!data || typeof data !== "object") return null;
  const row = data as Record<string, unknown>;

  const registrationsRaw = Array.isArray(row.registrations)
    ? row.registrations
    : Array.isArray(data)
      ? (data as Array<Record<string, unknown>>)
      : [];

  const registrations = registrationsRaw.filter(
    (r): r is Record<string, unknown> => r != null && typeof r === "object",
  );

  const tickets = mapRegistrationsToAllTickets(registrations);
  const primary = registrations[0];
  const payment =
    row.payment && typeof row.payment === "object"
      ? (row.payment as Record<string, unknown>)
      : null;

  const ticket =
    primary?.ticket && typeof primary.ticket === "object"
      ? (primary.ticket as Record<string, unknown>)
      : null;

  const ticketIsFree = ticket?.is_free === true || Number(ticket?.cost ?? 0) <= 0;
  const ticketUnitCost = Number(ticket?.cost ?? 0);
  const ticketName =
    (typeof ticket?.name === "string" && ticket.name.trim()) || "General Admission";

  const registrantFirstName =
    (typeof primary?.first_name === "string" && primary.first_name) || "";
  const registrantLastName =
    (typeof primary?.last_name === "string" && primary.last_name) || "";
  const registrantEmail = (typeof primary?.email === "string" && primary.email) || "";

  const qrCode = tickets[0]?.qr_code ?? normalizeEventQrCode(primary?.qr_code as string);

  const status =
    typeof row.status === "string"
      ? row.status
      : tickets.length > 0
        ? "registered"
        : "none";

  return {
    status,
    tickets,
    payment,
    ticketName,
    ticketIsFree,
    ticketUnitCost: Number.isFinite(ticketUnitCost) ? ticketUnitCost : 0,
    registrantFirstName,
    registrantLastName,
    registrantEmail,
    qrCode,
  };
}
