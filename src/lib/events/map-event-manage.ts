export type EventManageStatistics = {
  eventTitle: string;
  eventDate: string | null;
  totalPeople: number;
  checkedIn: number;
  notCheckedIn: number;
  checkInActivity: {
    id: string;
    name: string;
    checkInDate: string;
  }[];
};

export type EventAttendeeRow = {
  id: string;
  name: string;
  email: string;
  photo: string | null;
  isCheckedIn: boolean;
  checkInDate: string | null;
  isPlusOne: boolean;
};

export type EventAttendeesSummary = {
  eventTitle: string;
  totalRegistered: number;
  checkedIn: number;
  notCheckedIn: number;
  attendees: EventAttendeeRow[];
};

function num(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function mapEventStatistics(data: unknown): EventManageStatistics | null {
  if (!data || typeof data !== "object") return null;
  const row = data as Record<string, unknown>;
  const stats =
    row.statistics && typeof row.statistics === "object"
      ? (row.statistics as Record<string, unknown>)
      : {};

  const totalPeople = num(stats.total_people ?? stats.total_registered);
  const checkedIn = num(
    stats.total_checked_in ?? stats.checked_in ?? stats.primary_checked_in,
  );
  const notCheckedIn = num(
    stats.not_checked_in ??
      (totalPeople > 0 ? Math.max(totalPeople - checkedIn, 0) : 0),
  );

  const activityRaw = Array.isArray(row.check_in_activity) ? row.check_in_activity : [];
  const checkInActivity = activityRaw
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const a = item as Record<string, unknown>;
      const name = typeof a.name === "string" ? a.name : "Guest";
      const checkInDate =
        typeof a.check_in_date === "string" ? a.check_in_date : "";
      const id = String(a.attendee_id ?? index);
      if (!checkInDate) return null;
      return { id, name, checkInDate };
    })
    .filter((x): x is NonNullable<typeof x> => x != null);

  return {
    eventTitle:
      typeof row.event_title === "string"
        ? row.event_title
        : typeof row.title === "string"
          ? row.title
          : "Event",
    eventDate: typeof row.event_date === "string" ? row.event_date : null,
    totalPeople,
    checkedIn,
    notCheckedIn,
    checkInActivity,
  };
}

function mapAttendeeRow(item: unknown, index: number): EventAttendeeRow | null {
  if (!item || typeof item !== "object") return null;
  const a = item as Record<string, unknown>;
  const name = typeof a.name === "string" && a.name.trim() ? a.name.trim() : "Guest";
  const email = typeof a.email === "string" ? a.email.trim() : "";
  const id = String(a.registration_id ?? a.attendee_id ?? `attendee-${index}`);
  const checkInDate =
    typeof a.check_in_date === "string" && a.check_in_date.trim()
      ? a.check_in_date
      : null;

  return {
    id,
    name,
    email,
    photo: typeof a.photo === "string" && a.photo.trim() ? a.photo : null,
    isCheckedIn: Boolean(a.is_checked_in),
    checkInDate,
    isPlusOne: Boolean(a.is_plus_one_ticket),
  };
}

export function mapEventAttendeesSummary(data: unknown): EventAttendeesSummary | null {
  if (!data || typeof data !== "object") return null;
  const row = data as Record<string, unknown>;
  const stats =
    row.statistics && typeof row.statistics === "object"
      ? (row.statistics as Record<string, unknown>)
      : {};

  const totalRegistered = num(stats.total_registered ?? stats.total_people);
  const checkedIn = num(stats.total_checked_in ?? stats.checked_in);
  const notCheckedIn = num(
    stats.not_checked_in ??
      (totalRegistered > 0 ? Math.max(totalRegistered - checkedIn, 0) : 0),
  );

  const attendeesRaw = Array.isArray(row.attendees) ? row.attendees : [];
  const attendees = attendeesRaw
    .map((item, index) => mapAttendeeRow(item, index))
    .filter((x): x is EventAttendeeRow => x != null);

  return {
    eventTitle: typeof row.event_title === "string" ? row.event_title : "Event",
    totalRegistered,
    checkedIn,
    notCheckedIn,
    attendees,
  };
}

/** Checked-in rows, most recent first (mirrors gradpad-web attendees API). */
export function listCheckedInAttendees(attendees: EventAttendeeRow[]): EventAttendeeRow[] {
  return attendees
    .filter((a) => a.isCheckedIn)
    .sort((a, b) => {
      const ta = a.checkInDate ? new Date(a.checkInDate).getTime() : 0;
      const tb = b.checkInDate ? new Date(b.checkInDate).getTime() : 0;
      return tb - ta;
    });
}
