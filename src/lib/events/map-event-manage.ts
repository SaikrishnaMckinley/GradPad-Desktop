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

export type EventAttendeesSummary = {
  eventTitle: string;
  totalRegistered: number;
  checkedIn: number;
  notCheckedIn: number;
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

  return {
    eventTitle: typeof row.event_title === "string" ? row.event_title : "Event",
    totalRegistered,
    checkedIn,
    notCheckedIn,
  };
}
