export type EventStartFields = {
  start_at?: string | null;
  start_date?: string | null;
  start_time?: string | null;
};

/** Normalize staging event start fields to an ISO-ish string, or null if unparseable. */
export function parseEventStartIso(fields: EventStartFields): string | null {
  const at = fields.start_at?.trim();
  if (at) {
    const parsed = new Date(at);
    if (!Number.isNaN(parsed.getTime())) return at;
  }

  const date = fields.start_date?.trim();
  if (date) {
    const timeRaw = (fields.start_time ?? "00:00:00").trim();
    const normalized = timeRaw.length <= 5 ? `${timeRaw}:00` : timeRaw;
    const iso = `${date}T${normalized}`;
    const parsed = new Date(iso);
    if (!Number.isNaN(parsed.getTime())) return iso;
  }

  const timeOnly = fields.start_time?.trim();
  if (timeOnly && (timeOnly.includes("T") || /^\d{4}-\d{2}-\d{2}/.test(timeOnly))) {
    const parsed = new Date(timeOnly);
    if (!Number.isNaN(parsed.getTime())) return timeOnly;
  }

  return null;
}

export function formatEventCard(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return { day: "—", month: "TBD", time: "Time TBD" };
  }
  return {
    day: d.toLocaleDateString("en-US", { day: "2-digit" }),
    month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  };
}

export function formatPostHeaderTime(iso: string): string {
  if (!iso.trim()) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${date} · ${time}`;
}

export function formatEventUpcomingLine(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Date TBD";
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function startOfLocalDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function formatEventFeedLabels(iso: string) {
  const d = new Date(iso);
  const today = startOfLocalDay(new Date());
  const eventDay = startOfLocalDay(d);
  const diffDays = Math.round((eventDay.getTime() - today.getTime()) / 86_400_000);

  let dayLabel: string;
  if (diffDays === 0) dayLabel = "Today";
  else if (diffDays === 1) dayLabel = "Tomorrow";
  else if (diffDays === -1) dayLabel = "Yesterday";
  else {
    dayLabel = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  }

  return {
    timeLabel: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    dayLabel,
  };
}

export function formatEventMonthHeading(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
