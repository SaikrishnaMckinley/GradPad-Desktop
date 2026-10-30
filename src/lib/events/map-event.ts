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

function priceLabel(row: ApiEventRow): string | null {
  const cost = row.cost ?? row.price;
  if (cost == null || Number.isNaN(Number(cost))) return null;
  const n = Number(cost);
  if (n <= 0) return "Free";
  return `$${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)}`;
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
  const price = priceLabel(e);

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
