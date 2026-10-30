import type { SidebarCommunity } from "@/types/community";

const GENERIC_COMMUNITY_LABEL = "Community";

export function isGenericCommunityLabel(name: string | null | undefined): boolean {
  if (!name?.trim()) return true;
  return name.trim().toLowerCase() === GENERIC_COMMUNITY_LABEL.toLowerCase();
}

export function extractCommunityFromEventRow(row: Record<string, unknown>): {
  id: string | null;
  name: string | null;
} {
  let id: string | null = null;
  if (typeof row.community_id === "string" && row.community_id.trim()) {
    id = row.community_id.trim();
  } else if (typeof row.community === "string" && row.community.trim()) {
    id = row.community.trim();
  } else if (row.community && typeof row.community === "object") {
    const c = row.community as Record<string, unknown>;
    if (typeof c.id === "string" && c.id.trim()) id = c.id.trim();
    else if (typeof c.id === "number") id = String(c.id);
  }

  let name: string | null =
    typeof row.community_name === "string" && row.community_name.trim()
      ? row.community_name.trim()
      : null;
  if (!name && row.community && typeof row.community === "object") {
    const c = row.community as Record<string, unknown>;
    if (typeof c.name === "string" && c.name.trim()) name = c.name.trim();
  }

  return { id, name };
}

export function resolveEventCommunityLabel(
  communityId: string | null | undefined,
  communityName: string | null | undefined,
  memberships: SidebarCommunity[],
): string {
  if (communityId) {
    const member = memberships.find((m) => m.id === communityId);
    if (member?.name) return member.name;
  }
  if (communityName && !isGenericCommunityLabel(communityName)) {
    return communityName.trim();
  }
  if (communityId) {
    const member = memberships.find((m) => m.slug === communityId);
    if (member?.name) return member.name;
  }
  return communityName?.trim() || GENERIC_COMMUNITY_LABEL;
}
