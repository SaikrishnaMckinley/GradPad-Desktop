import type { ApiCommunityRecord } from "@/lib/api/map-community";
import { unwrapList } from "@/lib/api/parse-list";

const LIST_BUCKETS = ["owned", "admin", "member", "requested", "suggested"] as const;

/** Sidebar + hub: only communities the user belongs to (not suggested catalog). */
export const MEMBERSHIP_LIST_BUCKETS = ["owned", "admin", "member"] as const;

/**
 * `GET community/list/` returns categorized buckets (gradpad-api UserMiniCommunityListView).
 */
export function flattenCommunityListResponse(data: unknown): ApiCommunityRecord[] {
  if (!data || typeof data !== "object") {
    return unwrapList(data).filter(
      (row): row is ApiCommunityRecord => Boolean(row && typeof row === "object"),
    );
  }

  const obj = data as Record<string, unknown>;
  const hasBuckets = LIST_BUCKETS.some((key) => Array.isArray(obj[key]));

  if (!hasBuckets) {
    return unwrapList(data).filter(
      (row): row is ApiCommunityRecord => Boolean(row && typeof row === "object"),
    );
  }

  const merged: ApiCommunityRecord[] = [];

  for (const key of LIST_BUCKETS) {
    const rows = obj[key];
    if (!Array.isArray(rows)) continue;
    for (const row of rows) {
      if (!row || typeof row !== "object") continue;
      const record = { ...(row as ApiCommunityRecord) };
      if (key === "owned") {
        record.is_owner = true;
        record.is_admin = true;
        record.is_member = true;
      } else if (key === "admin") {
        record.is_admin = true;
        record.is_member = true;
      } else if (key === "member") {
        record.is_member = true;
      } else if (key === "requested") {
        record.applied = true;
      }
      merged.push(record);
    }
  }

  const seen = new Set<string>();
  return merged.filter((c) => {
    const id = c.id != null ? String(c.id) : "";
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export function flattenUserMembershipCommunities(data: unknown): ApiCommunityRecord[] {
  if (!data || typeof data !== "object") {
    return flattenCommunityListResponse(data);
  }

  const obj = data as Record<string, unknown>;
  const merged: ApiCommunityRecord[] = [];

  for (const key of MEMBERSHIP_LIST_BUCKETS) {
    const rows = obj[key];
    if (!Array.isArray(rows)) continue;
    for (const row of rows) {
      if (!row || typeof row !== "object") continue;
      const record = { ...(row as ApiCommunityRecord) };
      if (key === "owned") {
        record.is_owner = true;
        record.is_admin = true;
        record.is_member = true;
      } else if (key === "admin") {
        record.is_admin = true;
        record.is_member = true;
      } else if (key === "member") {
        record.is_member = true;
      }
      merged.push(record);
    }
  }

  const seen = new Set<string>();
  return merged.filter((c) => {
    const id = c.id != null ? String(c.id) : "";
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}
