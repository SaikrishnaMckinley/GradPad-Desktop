export const ATTENDEE_IDENTITY_GUEST = "Guest";
export const ATTENDEE_IDENTITY_BLS_PARENT = "BLS Parent";

export type AttendeeIdentityKind = "class_year" | "guest" | "bls_parent";

export function isSawubonaCommunity(options?: {
  partnerSource?: string | null;
  communityName?: string | null;
}): boolean {
  const source = (options?.partnerSource || "").trim().toLowerCase();
  if (source === "sawubona") return true;
  const name = (options?.communityName || "").trim().toLowerCase();
  return name.includes("sawubona");
}

/** Public events (except Sawubona) require class year / Guest / BLS Parent — gradpad-web. */
export function publicEventNeedsAffiliation(communityName?: string | null): boolean {
  return !isSawubonaCommunity({ communityName });
}

export function resolveAttendeeIdentity(
  kind: AttendeeIdentityKind,
  classYearInput: string,
): string {
  if (kind === "guest") return ATTENDEE_IDENTITY_GUEST;
  if (kind === "bls_parent") return ATTENDEE_IDENTITY_BLS_PARENT;
  return classYearInput.replace(/\D/g, "").slice(0, 4);
}

export function validateAttendeeIdentityValue(identity: string): boolean {
  const trimmed = (identity || "").trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  if (lower === "guest") return true;
  if (lower === "bls parent") return true;
  const year = trimmed.replace(/\D/g, "");
  if (year.length !== 4) return false;
  const numeric = parseInt(year, 10);
  const maxYear = new Date().getFullYear() + 1;
  return numeric >= 1900 && numeric <= maxYear;
}

export function normalizeAttendeeIdentityLabel(raw: unknown): string | null {
  if (raw === undefined || raw === null || raw === "") return null;
  const trimmed = String(raw).trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();
  if (lower === "guest") return ATTENDEE_IDENTITY_GUEST;
  if (lower === "bls parent") return ATTENDEE_IDENTITY_BLS_PARENT;
  const year = trimmed.replace(/\D/g, "").slice(0, 4);
  if (year.length === 4) return year;
  return null;
}

export function formatAttendeeIdentitySubtitle(raw: unknown): string | null {
  const identity = normalizeAttendeeIdentityLabel(raw);
  if (!identity) return null;
  if (/^\d{4}$/.test(identity)) return `Class of ${identity}`;
  return identity;
}

export function attendeeIdentityFromMember(
  member: Record<string, unknown> | null | undefined,
): string | null {
  if (!member) return null;
  const answers = (member.registration_answers ?? member.registrationAnswers) as
    | Record<string, unknown>
    | undefined;
  const fromAnswers =
    answers?.class_year ??
    answers?.graduation_year ??
    answers?.["Class year"] ??
    answers?.["class year"] ??
    answers?.attendee_identity;
  return normalizeAttendeeIdentityLabel(
    fromAnswers ??
      member.attendee_identity ??
      member.class_year ??
      member.classYear ??
      member.graduation_year ??
      member.graduationYear,
  );
}
