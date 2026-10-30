export type EventCalendarFields = {
  title?: string;
  description?: string;
  location?: string | null;
  start_date?: string | null;
  start_time?: string | null;
  end_date?: string | null;
  end_time?: string | null;
  startAt?: string;
  endAt?: string;
  id?: string;
};

function normalizeDate(value?: string | null): string | null {
  if (!value?.trim()) return null;
  return value.trim().slice(0, 10);
}

function normalizeTime(value?: string | null): string {
  if (!value?.trim()) return "00:00:00";
  const t = value.trim();
  if (t.length <= 5) return `${t}:00`;
  return t.slice(0, 8);
}

function fromIso(iso?: string): { date: string | null; time: string | null } {
  if (!iso?.trim()) return { date: null, time: null };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: null, time: null };
  const date = d.toISOString().slice(0, 10);
  const time = d.toTimeString().slice(0, 8);
  return { date, time };
}

export function eventToCalendarFields(event: EventCalendarFields): Required<
  Pick<EventCalendarFields, "title" | "description" | "location">
> & {
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  id?: string;
} {
  let startDate = normalizeDate(event.start_date);
  let startTime = normalizeTime(event.start_time);
  let endDate = normalizeDate(event.end_date);
  let endTime = normalizeTime(event.end_time);

  if (!startDate && event.startAt) {
    const parsed = fromIso(event.startAt);
    startDate = parsed.date;
    startTime = parsed.time ?? startTime;
  }
  if (!endDate && event.endAt) {
    const parsed = fromIso(event.endAt);
    endDate = parsed.date;
    endTime = parsed.time ?? endTime;
  }
  if (!startDate) startDate = new Date().toISOString().slice(0, 10);

  if (!endDate) endDate = startDate;
  if (!endTime || endTime === "00:00:00") endTime = "23:59:00";

  return {
    id: event.id,
    title: event.title?.trim() || "Event",
    description: event.description?.trim() || "",
    location: event.location ?? "",
    start_date: startDate,
    start_time: startTime,
    end_date: endDate,
    end_time: endTime,
  };
}

function formatWallClockCalendarStamp(date?: string | null, time?: string | null): string | null {
  const normalized = normalizeDate(date);
  if (!normalized) return null;
  const t = normalizeTime(time);
  const [hh, mm, ss] = t.split(":");
  const ymd = normalized.replace(/-/g, "");
  return `${ymd}T${hh}${mm}${(ss || "00").slice(0, 2)}`;
}

function wallClockStampToDate(stamp: string): Date {
  const y = Number(stamp.slice(0, 4));
  const m = Number(stamp.slice(4, 6));
  const d = Number(stamp.slice(6, 8));
  const h = Number(stamp.slice(9, 11));
  const min = Number(stamp.slice(11, 13));
  const sec = Number(stamp.slice(13, 15) || "0");
  return new Date(y, m - 1, d, h, min, sec);
}

function addHoursToWallClockStamp(stamp: string, hours: number): string {
  const next = wallClockStampToDate(stamp);
  next.setHours(next.getHours() + hours);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${next.getFullYear()}${pad(next.getMonth() + 1)}${pad(next.getDate())}` +
    `T${pad(next.getHours())}${pad(next.getMinutes())}${pad(next.getSeconds())}`
  );
}

export function getEventCalendarExportStamps(event: EventCalendarFields): { start: string; end: string } {
  const e = eventToCalendarFields(event);
  const today = formatWallClockCalendarStamp(new Date().toISOString().slice(0, 10), "00:00:00")!;
  const start = formatWallClockCalendarStamp(e.start_date, e.start_time) || today;

  let end = formatWallClockCalendarStamp(e.end_date, e.end_time);
  if (!e.end_time || e.end_time === "00:00:00") {
    end = addHoursToWallClockStamp(start, 1);
  } else if (!end) {
    end = addHoursToWallClockStamp(start, 1);
  } else if (end < start) {
    end = addHoursToWallClockStamp(start, 1);
  }

  return { start, end };
}

export function buildGoogleCalendarDatesParam(event: EventCalendarFields): string {
  const { start, end } = getEventCalendarExportStamps(event);
  return `${start}/${end}`;
}

export function formatWallClockIsoLocal(stamp: string): string {
  return (
    `${stamp.slice(0, 4)}-${stamp.slice(4, 6)}-${stamp.slice(6, 8)}` +
    `T${stamp.slice(9, 11)}:${stamp.slice(11, 13)}:${stamp.slice(13, 15) || "00"}`
  );
}

export function buildEventIcs(event: EventCalendarFields): string {
  const e = eventToCalendarFields(event);
  const { start, end } = getEventCalendarExportStamps(event);
  const currentDate = new Date().toISOString().replace(/-|:|\.\d+/g, "");
  const uid = `${e.id || "event"}@gradpad.io`;

  const clean = (text: string) =>
    text
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "")
      .replace(/[\x00-\x1F\x7F]/g, "");

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//GradPad//Event Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${currentDate}
DTSTART:${start}
DTEND:${end}
SUMMARY:${clean(e.title)}
DESCRIPTION:${clean(e.description.replace(/<[^>]*>?/gm, ""))}
LOCATION:${clean(String(e.location ?? ""))}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;
}
