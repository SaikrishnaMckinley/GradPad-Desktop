import "server-only";

import { fetchCommunityDetailRaw, fetchCommunityMembersRaw } from "@/lib/api/communities";
import { unwrapList } from "@/lib/api/parse-list";
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

    return {
      id: String(m.id ?? m.user_id ?? user?.id ?? `member-${index}`),
      userId,
      fullName: memberDisplayNameFromApi(row),
      username: null,
      avatarUrl: memberPhotoFromApi(row),
      role,
      status,
      joinedAt: new Date().toISOString(),
    } satisfies CommunityMemberRow;
  });
}

/** Live member roster for API routes (no `use cache` — safe in Route Handlers). */
export async function fetchCommunityHighlightMembers(
  communityId: string,
): Promise<CommunityMemberRow[]> {
  const [membersRes, detailRes] = await Promise.all([
    fetchCommunityMembersRaw(communityId, { cacheable: false }),
    fetchCommunityDetailRaw(communityId, { cacheable: false }),
  ]);

  const raw = membersRes.ok && membersRes.data ? mapMembersList(membersRes.data) : [];
  const active = raw.filter((m) => m.status === "active");
  const detail =
    detailRes.ok && detailRes.data && typeof detailRes.data === "object"
      ? (detailRes.data as Record<string, unknown>)
      : null;

  return mergeAndEnrichCommunityMembers(active, detail);
}
