import { formatEventMonthHeading } from "@/lib/events/format-event-datetime";
import type { EventListItem, EventRailItem } from "@/types/events";

export type EventsRailPreviewModel = {
  events: EventRailItem[];
  sectionTitle: string;
  monthHeading: string | null;
};

type EventStartRef = Pick<EventListItem, "id" | "title" | "startAt">;

function startOfLocalDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Sunday 00:00 through next Sunday 00:00 (local). */
function currentWeekBounds(now = new Date()) {
  const start = startOfLocalDay(now);
  start.setDate(start.getDate() - start.getDay());
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { start, end };
}

function isUpcoming(startAt: string, nowMs: number) {
  const t = new Date(startAt).getTime();
  return !Number.isNaN(t) && t >= nowMs;
}

function isInWeek(startAt: string, start: Date, end: Date) {
  const t = new Date(startAt).getTime();
  return !Number.isNaN(t) && t >= start.getTime() && t < end.getTime();
}

/** Call from client only — uses `Date.now()` for upcoming / this-week windows. */
export function buildEventsRailPreview(
  events: EventStartRef[],
  limit = 3,
): EventsRailPreviewModel {
  const nowMs = Date.now() - 86_400_000;
  const upcoming = events
    .filter((e) => isUpcoming(e.startAt, nowMs))
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

  const { start, end } = currentWeekBounds(new Date());
  const thisWeek = upcoming.filter((e) => isInWeek(e.startAt, start, end));
  const picked = (thisWeek.length > 0 ? thisWeek : upcoming).slice(0, limit);

  const items: EventRailItem[] = picked.map((e) => ({
    id: e.id,
    title: e.title,
    startAt: e.startAt,
  }));

  return {
    events: items,
    sectionTitle: thisWeek.length > 0 ? "Coming up this week" : "Coming up soon",
    monthHeading: items.length > 0 ? formatEventMonthHeading(items[0].startAt) : null,
  };
}
