import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { getApiSessionProfile } from "@/lib/auth/get-api-session-profile";
import { resolveShellUser } from "@/lib/auth/resolve-shell-user";
import { communityHubCacheTag } from "@/lib/communities/cache-tags";
import { canManageCommunity, isActiveMember } from "@/lib/communities/permissions";
import type { CommunityHubPayload } from "@/lib/communities/hub-cache";
import {
  getCommunityBySlug,
  getCommunityChannels,
  getCommunityEventsPreview,
  getCommunityMembers,
  getCommunityPostsPreview,
  listDiscoverableCommunities,
} from "@/lib/communities/queries";

export async function loadCommunityHub(routeKey: string): Promise<CommunityHubPayload | null> {
  "use cache: private";
  cacheLife("minutes");
  cacheTag(communityHubCacheTag(routeKey));

  const session = await getApiSessionProfile();
  const community = await getCommunityBySlug(routeKey, session?.id ?? null);

  if (!community) {
    return null;
  }

  const member = isActiveMember(community.membershipStatus);
  const canManage = canManageCommunity(community.membershipRole);

  const [channels, events, posts, membersPage, memberships] = await Promise.all([
    member || community.visibility === "public" ? getCommunityChannels(community.id) : [],
    member ? getCommunityEventsPreview(community.id) : [],
    member ? getCommunityPostsPreview(community.id) : [],
    getCommunityMembers(community.id, 1, 5),
    listDiscoverableCommunities(session?.id ?? null),
  ]);

  return {
    community,
    channels,
    events,
    posts,
    membersPreview: membersPage.members.map((m) => ({
      fullName: m.fullName,
      avatarUrl: m.avatarUrl,
    })),
    canManage,
    isMember: member,
    shellUser: resolveShellUser(session, true),
    memberships: memberships.filter((m) => isActiveMember(m.membershipStatus)),
  };
}
