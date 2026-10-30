import "server-only";

import { fetchCommunityDetailRaw } from "@/lib/api/communities";
import { mapCommunityDetail } from "@/lib/api/map-community";
import { canCreateInCommunity } from "@/lib/communities/permissions";

export const MEMBERSHIP_REQUIRED_MESSAGE =
  "Join this community before creating posts, events, or channels. If your request is pending, wait for approval.";

export async function requireActiveCommunityMember(
  communityId: string,
): Promise<string | null> {
  const id = communityId.trim();
  if (!id) return "Choose a community.";

  const result = await fetchCommunityDetailRaw(id);
  if (!result.ok || !result.data) {
    return "Community not found.";
  }

  const detail = mapCommunityDetail(result.data);
  if (!detail || !canCreateInCommunity(detail.membershipStatus)) {
    return MEMBERSHIP_REQUIRED_MESSAGE;
  }

  return null;
}
