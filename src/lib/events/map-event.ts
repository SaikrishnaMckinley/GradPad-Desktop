import { extractCommunityFromEventRow } from "@/lib/events/event-community";
import { parseEventStartIso } from "@/lib/events/format-event-datetime";
import { resolveEventImageUrl } from "@/lib/events/event-image";
import type { EventBadgeTone, EventListItem } from "@/types/events";

type ApiEventRow = {
  id: string;
  title?: string | null;
  name?: string | null;
  description?: string | null;
  start_at?: string | null;
  start_date?: string | null;
  start_time?: string | null;
  end_date?: string | null;
  end_time?: string | null;
  image?: string | null;
  location?: string | null | Record<string, unknown>;
  address?: string | null | Record<string, unknown>;
  community?: string | null;
  community_id?: string | null;
  community_name?: string | null;
  is_owner?: boolean;
  is_attendee?: boolean;
  has_requested?: boolean;
  is_public?: boolean;
  is_active?: boolean;
  cost?: number | null;
  price?: number | null;
  /** Joined-events list often includes ticket tiers here without top-level cost. */
  tickets?: unknown;
  event_type?: string | null;
};

function locationText(raw: ApiEventRow["location"] | ApiEventRow["address"]): string | null {
  if (!raw) return null;
  if (typeof raw === "string") {
    const t = raw.trim();
    return t.length > 0 ? t : null;
  }
  if (typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    const parts = [obj.name, obj.city, obj.state, obj.formatted_address, obj.address]
      .filter((p) => typeof p === "string" && p.trim().length > 0)
      .map((p) => (p as string).trim());
    return parts.length > 0 ? parts.join(", ") : null;
  }
  return null;
}

function parseStartIso(row: ApiEventRow): string {
  return (
    parseEventStartIso({
      start_at: row.start_at,
      start_date: row.start_date,
      start_time: row.start_time,
    }) ?? new Date().toISOString()
  );
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function formatMoney(n: number): string {
  return `$${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)}`;
}

/** Parse money from API (number, string "$12", "12.00", or cents when key suggests it). */
function parseMoneyField(record: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const raw = record[key];
    if (raw == null) continue;
    const n = parseMoneyValue(raw);
    if (n == null) continue;
    const centsKey = key.endsWith("_cents") || key.includes("cents");
    const amount = centsKey ? n / 100 : n;
    if (amount >= 0) return amount;
  }
  return null;
}

function parseMoneyValue(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const t = raw.trim();
    if (!t) return null;
    const cleaned = t.replace(/[$,\s]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function priceLabelFromTopLevel(_row: ApiEventRow, record: Record<string, unknown>): string | null {
  const keys = [
    "cost",
    "price",
    "amount",
    "ticket_price",
    "entry_fee",
    "registration_fee",
    "min_ticket_price",
    "minimum_ticket_price",
    "lowest_ticket_price",
    "starting_price",
    "price_cents",
    "cost_cents",
  ];
  const n = parseMoneyField(record, keys);
  if (n == null) return null;
  if (n <= 0) return "Free";
  return formatMoney(n);
}

/** Collect ticket-tier rows from list/detail shapes (joined list may nest differently). */
function collectTicketTierRows(record: Record<string, unknown>): unknown[] {
  const out: unknown[] = [];
  const push = (v: unknown) => {
    if (Array.isArray(v)) out.push(...v);
  };
  push(record.tickets);
  push(record.ticket_types);
  push(record.event_tickets);
  push(record.ticket_set);
  return out;
}

function ticketTierPaidAmount(t: Record<string, unknown>): number | null {
  const fromFields =
    parseMoneyField(t, ["cost", "price", "amount", "ticket_cost", "unit_price", "price_cents", "cost_cents"]) ??
    null;
  if (fromFields != null && fromFields > 0) return fromFields;

  const isFreeFlag =
    t.is_free === true ||
    t.free === true ||
    t.type === "free" ||
    (typeof t.type === "string" && t.type.toLowerCase() === "free");
  if (isFreeFlag) return 0;

  return null;
}

function ticketTierIsFree(t: Record<string, unknown>, paid: number | null): boolean {
  if (paid != null && paid <= 0) return true;
  if (t.is_free === true || t.free === true) return true;
  if (typeof t.type === "string" && t.type.toLowerCase() === "free") return true;
  return false;
}

/**
 * Derive a single list-display price from ticket tiers when top-level cost is absent.
 */
function priceLabelFromTickets(record: Record<string, unknown>): string | null {
  const raw = collectTicketTierRows(record);
  if (raw.length === 0) return null;

  const costs: number[] = [];
  let anyTicket = false;
  let anyFree = false;

  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const t = item as Record<string, unknown>;
    anyTicket = true;
    const paid = ticketTierPaidAmount(t);
    if (ticketTierIsFree(t, paid)) {
      anyFree = true;
      continue;
    }
    if (paid != null && paid > 0) costs.push(paid);
  }

  if (!anyTicket) return null;

  const paidPositive = costs.filter((c) => c > 0);
  if (paidPositive.length === 0) {
    return anyFree ? "Free" : null;
  }

  const min = Math.min(...paidPositive);
  const distinct = new Set(paidPositive);
  if (distinct.size >= 2 || (anyFree && paidPositive.length >= 1)) {
    return `From ${formatMoney(min)}`;
  }
  return formatMoney(min);
}

function priceLabelForListRow(row: ApiEventRow, record: Record<string, unknown>): string | null {
  const top = priceLabelFromTopLevel(row, record);
  if (top != null) return top;
  return priceLabelFromTickets(record);
}

function buildBadges(row: ApiEventRow, location: string | null, price: string | null) {
  const badges: { label: string; tone: EventBadgeTone }[] = [];

  if (row.is_owner) badges.push({ label: "Managing", tone: "primary" });
  else if (row.is_attendee) badges.push({ label: "Attending", tone: "success" });
  else if (row.has_requested) badges.push({ label: "Requested", tone: "muted" });

  badges.push({ label: row.is_public === false ? "Private" : "Public", tone: "muted" });

  if (location) badges.push({ label: location, tone: "muted" });
  if (price) badges.push({ label: price, tone: "muted" });

  return badges;
}

function actionLabel(row: ApiEventRow): string {
  if (row.is_owner) return "Manage";
  return "View details";
}

export function mapEventRow(row: unknown): EventListItem | null {
  if (!row || typeof row !== "object") return null;
  const e = row as ApiEventRow;
  if (!e.id) return null;

  const record = e as Record<string, unknown>;
  const community = extractCommunityFromEventRow(record);
  const title = (e.title ?? e.name ?? "Event").trim();
  const descriptionRaw = e.description?.trim() ?? "";
  const description = descriptionRaw.includes("<") ? stripHtml(descriptionRaw) : descriptionRaw;
  const location = locationText(e.location) ?? locationText(e.address);
  const startAt = parseStartIso(e);
  const imageUrl = resolveEventImageUrl(record);
  const price = priceLabelForListRow(e, record);

  return {
    id: e.id,
    title,
    description: description || "Event details from your community.",
    communityName: community.name?.trim() || e.community_name?.trim() || "Community",
    communityId: community.id,
    startAt,
    locationLabel: location,
    imageUrl,
    isOwner: Boolean(e.is_owner),
    isAttendee: Boolean(e.is_attendee),
    hasRequested: Boolean(e.has_requested),
    isPublic: e.is_public !== false,
    priceLabel: price,
    badges: buildBadges(e, location, price),
    actionLabel: actionLabel(e),
  };
}

export function mapEventsResponse(data: unknown): EventListItem[] {
  const list = Array.isArray(data)
    ? data
    : data && typeof data === "object" && Array.isArray((data as { results?: unknown[] }).results)
      ? (data as { results: unknown[] }).results
      : [];

  return list.map(mapEventRow).filter((e): e is EventListItem => e != null);
}

export function sortEventsByStart(events: EventListItem[]): EventListItem[] {
  return [...events].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
  );
}
