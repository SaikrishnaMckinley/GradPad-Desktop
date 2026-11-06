import {
  attendeeIdentityFromMember,
  formatAttendeeIdentitySubtitle,
} from "@/lib/events/attendee-identity";
import { sortPeopleStable } from "@/lib/utils/sort-people-stable";

export type EventAttendeeRosterItem = {
  id: string;
  name: string;
  avatarUrl: string | null;
  subtitle: string | null;
  plusOneLabel: string | null;
};

export function extractEventAttendeesList(data: unknown): unknown[] {
  if (!data || typeof data !== "object") return [];
  const row = data as Record<string, unknown>;
  const list = row.attendees ?? row.public_attendees ?? row.results;
  return Array.isArray(list) ? list : [];
}

function displayName(row: Record<string, unknown>): string {
  const name = typeof row.name === "string" ? row.name.trim() : "";
  if (name) return name;
  const first = typeof row.first_name === "string" ? row.first_name.trim() : "";
  const last = typeof row.last_name === "string" ? row.last_name.trim() : "";
  const combined = `${first} ${last}`.trim();
  if (combined) return combined;
  const email = typeof row.email === "string" ? row.email : "";
  if (email.includes("@")) return email.split("@")[0] ?? "Guest";
  return "Guest";
}

function avatarUrl(row: Record<string, unknown>): string | null {
  const photo =
    (typeof row.photo === "string" && row.photo) ||
    (typeof row.profile_picture === "string" && row.profile_picture) ||
    (typeof row.avatar === "string" && row.avatar) ||
    null;
  return photo;
}

function plusOneLabel(row: Record<string, unknown>): string | null {
  const named =
    typeof row.plus_one_name === "string" ? row.plus_one_name.trim() : "";
  if (named) return named;
  if (row.has_plus_one === true) return "Guest";
  return null;
}

export function mapEventAttendeeRoster(data: unknown): EventAttendeeRosterItem[] {
  const list = sortPeopleStable(
    extractEventAttendeesList(data).filter(
      (entry): entry is Record<string, unknown> =>
        entry != null && typeof entry === "object",
    ),
  );
  const items = list
    .map((entry, index) => {
      if (!entry || typeof entry !== "object") return null;
      const row = entry as Record<string, unknown>;
      const identity = attendeeIdentityFromMember(row);
      const id = String(
        row.attendee_id ?? row.registration_id ?? row.id ?? `attendee-${index}`,
      );
      return {
        id,
        name: displayName(row),
        avatarUrl: avatarUrl(row),
        subtitle: formatAttendeeIdentitySubtitle(identity),
        plusOneLabel: plusOneLabel(row),
      };
    })
    .filter((x): x is EventAttendeeRosterItem => x != null);

  return items;
}
