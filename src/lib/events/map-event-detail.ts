import { mapEventRow } from "@/lib/events/map-event";
import type { EventListItem } from "@/types/events";

export type EventTicketOption = {
  id: string;
  name: string;
  description: string;
  cost: number;
  isFree: boolean;
  allowedSales: number | null;
  allowsPlusOne: boolean;
};

export type EventDetailViewModel = EventListItem & {
  endAt: string;
  startDate: string | null;
  startTime: string | null;
  endDate: string | null;
  endTime: string | null;
  capacity: number | null;
  attendeeCount: number;
  spotsRemaining: number | null;
  requiresApproval: boolean;
  allowGuest: boolean;
  tickets: EventTicketOption[];
  hostName: string;
  hostAvatarUrl: string | null;
  platformFeeLabel: string | null;
};

type ApiTicket = {
  id?: string;
  name?: string;
  description?: string;
  cost?: number | string;
  is_free?: boolean;
  allowed_sales?: number | null;
  allow_plus_one?: boolean;
};

function parseStartEnd(row: Record<string, unknown>): { startAt: string; endAt: string } {
  const start =
    (typeof row.start_at === "string" && row.start_at) ||
    (typeof row.start_date === "string"
      ? `${row.start_date}T${(row.start_time as string) ?? "00:00:00"}`
      : new Date().toISOString());
  const end =
    (typeof row.end_at === "string" && row.end_at) ||
    (typeof row.end_date === "string"
      ? `${row.end_date}T${(row.end_time as string) ?? "23:59:00"}`
      : start);
  return { startAt: start, endAt: end };
}

function mapTickets(raw: unknown): EventTicketOption[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row) => {
      const t = row as ApiTicket;
      if (!t.id) return null;
      const cost = Number(t.cost ?? 0);
      return {
        id: String(t.id),
        name: t.name?.trim() || "Ticket",
        description: t.description?.trim() || "",
        cost: Number.isNaN(cost) ? 0 : cost,
        isFree: t.is_free === true || cost <= 0,
        allowedSales: t.allowed_sales ?? null,
        allowsPlusOne: t.allow_plus_one === true,
      };
    })
    .filter((t): t is EventTicketOption => t != null);
}

function hostFromOwners(row: Record<string, unknown>): { name: string; avatar: string | null } {
  const owners = row.owner ?? row.owners;
  if (Array.isArray(owners) && owners.length > 0) {
    const o = owners[0] as Record<string, unknown>;
    const first = typeof o.first_name === "string" ? o.first_name : "";
    const last = typeof o.last_name === "string" ? o.last_name : "";
    const name = `${first} ${last}`.trim() || (typeof o.name === "string" ? o.name : "Organizer");
    const avatar =
      (typeof o.photo === "string" && o.photo) ||
      (typeof o.profile_picture === "string" && o.profile_picture) ||
      null;
    return { name, avatar };
  }
  return { name: "Community organizer", avatar: null };
}

export function mapEventDetail(data: unknown): EventDetailViewModel | null {
  if (!data || typeof data !== "object") return null;
  const row = data as Record<string, unknown>;
  const base = mapEventRow(row);
  if (!base) return null;

  const { startAt, endAt } = parseStartEnd(row);
  const host = hostFromOwners(row);
  const tickets = mapTickets(row.tickets);
  const isPublic = row.is_public !== false;
  const isPrivate = row.is_private === true || !isPublic;

  return {
    ...base,
    communityId: base.communityId,
    startAt,
    endAt,
    startDate: typeof row.start_date === "string" ? row.start_date : null,
    startTime: typeof row.start_time === "string" ? row.start_time : null,
    endDate: typeof row.end_date === "string" ? row.end_date : null,
    endTime: typeof row.end_time === "string" ? row.end_time : null,
    capacity: typeof row.capacity === "number" ? row.capacity : null,
    attendeeCount: typeof row.attendee_count === "number" ? row.attendee_count : 0,
    spotsRemaining:
      typeof row.spots_remaining === "number" ? row.spots_remaining : null,
    requiresApproval: isPrivate,
    allowGuest: row.allow_guest === true || row.allow_plus_one === true,
    tickets,
    hostName: host.name,
    hostAvatarUrl: host.avatar,
    platformFeeLabel:
      typeof row.platform_fee === "string" && row.platform_fee.trim()
        ? row.platform_fee
        : null,
    isPublic,
    badges: base.badges,
  };
}
