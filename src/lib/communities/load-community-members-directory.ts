import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { fetchCommunityDetailRaw, fetchCommunityMembersRaw } from "@/lib/api/communities";
import { unwrapList } from "@/lib/api/parse-list";
import { communityMembersDirectoryCacheTag } from "@/lib/communities/cache-tags";
import { mergeAndEnrichCommunityMembers } from "@/lib/communities/enrich-member-roles";
import { memberDisplayNameFromApi, memberPhotoFromApi } from "@/lib/communities/member-display-name";
import type { CommunityMemberRow } from "@/types/community";

function mapMembersList(data: unknown): CommunityMemberRow[] {
  return unwrapList(data).map((row, index) => {
    const m = row as Record<string, unknown>;
    const user =
      m.user && typeof m.user === "object" ? (m.user as Record<string, unknown>) : null;
    const roleRaw = m.role ?? user?.role;
    const role =
      roleRaw === "owner" ||
      roleRaw === "admin" ||
      roleRaw === "moderator" ||
      roleRaw === "member"
        ? roleRaw
        : "member";
    const statusRaw = m.status ?? user?.status;
    const status =
      statusRaw === "pending" ||
      statusRaw === "active" ||
      statusRaw === "rejected" ||
      statusRaw === "banned"
        ? statusRaw
        : "active";
    const userId = String(m.user_id ?? user?.id ?? m.id ?? index);
    const nickname =
      (typeof user?.nickname === "string" ? user.nickname : null) ??
      (typeof m.nickname === "string" ? m.nickname : null);

    return {
      id: String(m.id ?? m.user_id ?? user?.id ?? `member-${index}`),
      userId,
      fullName: memberDisplayNameFromApi(row),
      username: nickname?.trim() && nickname !== "undefined" ? nickname.trim() : null,
      avatarUrl: memberPhotoFromApi(row),
      role,
      status,
      joinedAt:
        (typeof m.joined_at === "string" && m.joined_at) ||
        (typeof user?.joined_at === "string" && user.joined_at) ||
        new Date().toISOString(),
    } satisfies CommunityMemberRow;
  });
}

async function loadCommunityMembersDirectoryCached(
  communityId: string,
  routeKey: string,
): Promise<{ members: CommunityMemberRow[]; total: number }> {
  "use cache: private";
  cacheLife("minutes");
  cacheTag(communityMembersDirectoryCacheTag(routeKey));

  const [membersRes, detailRes] = await Promise.all([
    fetchCommunityMembersRaw(communityId, { cacheable: true }),
    fetchCommunityDetailRaw(communityId, { cacheable: true }),
  ]);

  const raw = membersRes.ok && membersRes.data ? mapMembersList(membersRes.data) : [];
  const active = raw.filter((m) => m.status === "active");
  const detail =
    detailRes.ok && detailRes.data && typeof detailRes.data === "object"
      ? (detailRes.data as Record<string, unknown>)
      : null;

  return {
    members: mergeAndEnrichCommunityMembers(active, detail),
    total: active.length,
  };
}

export async function loadCommunityMembersDirectory(
  communityId: string,
  routeKey: string,
): Promise<{ members: CommunityMemberRow[]; total: number }> {
  return loadCommunityMembersDirectoryCached(communityId, routeKey.toLowerCase());
}

export type CommunityMembersDirectorySnapshot = {
  slug: string;
  communityName: string;
  members: CommunityMemberRow[];
  total: number;
};
