import { resolveStagingMediaUrl } from "@/lib/api/media-url";

type NameFields = {
  first_name?: unknown;
  last_name?: unknown;
  name?: unknown;
  nickname?: unknown;
  email?: unknown;
};

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function nameFromFields(fields: NameFields): string | null {
  const combined = [str(fields.first_name), str(fields.last_name)].filter(Boolean).join(" ").trim();
  if (combined) return combined;
  const name = str(fields.name);
  if (name) return name;
  const nick = str(fields.nickname);
  if (nick && nick !== "undefined") return nick;
  const email = str(fields.email);
  if (email.includes("@")) {
    const local = email.split("@")[0]?.trim();
    if (local) return local;
  }
  return null;
}

/** gradpad-web: full name, else email local-part before `@`. */
export function memberDisplayNameFromApi(row: unknown): string {
  if (!row || typeof row !== "object") return "Member";
  const record = row as Record<string, unknown>;
  const nested =
    record.user && typeof record.user === "object"
      ? (record.user as NameFields)
      : null;

  const fromNested = nested ? nameFromFields(nested) : null;
  if (fromNested) return fromNested;

  const fromRow = nameFromFields(record as NameFields);
  if (fromRow) return fromRow;

  return "Member";
}

export function memberEmailFromApi(row: unknown): string | null {
  if (!row || typeof row !== "object") return null;
  const record = row as Record<string, unknown>;
  const nested =
    record.user && typeof record.user === "object"
      ? (record.user as NameFields)
      : null;
  const email = str(nested?.email) || str(record.email);
  return email || null;
}

function photoFromRecord(record: Record<string, unknown>): string | null {
  const keys = ["photo", "avatar_url", "avatar", "profile_picture", "image", "profile_image"];
  for (const key of keys) {
    const value = str(record[key]);
    if (value) return resolveStagingMediaUrl(value);
  }
  return null;
}

export function memberPhotoFromApi(row: unknown): string | null {
  if (!row || typeof row !== "object") return null;
  const record = row as Record<string, unknown>;
  const nested =
    record.user && typeof record.user === "object"
      ? (record.user as Record<string, unknown>)
      : null;
  return photoFromRecord(nested ?? {}) ?? photoFromRecord(record);
}
