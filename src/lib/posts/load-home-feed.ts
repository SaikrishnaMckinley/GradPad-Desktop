import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { getApiSessionProfile } from "@/lib/auth/get-api-session-profile";
import { getActiveCommunitySlug } from "@/lib/communities/active-community";
import { listDiscoverableCommunities } from "@/lib/communities/queries";
import { HOME_FEED_CACHE_TAG } from "@/lib/posts/cache-tags";
import { getCommunityFeedPosts } from "@/lib/posts/queries";
import type { CommunityListItem } from "@/types/community";

export type HomeFeedPayload = {
  activeCommunity: CommunityListItem | null;
  memberships: CommunityListItem[];
  posts: Awaited<ReturnType<typeof getCommunityFeedPosts>>;
};

function pickActiveCommunity(
  memberships: CommunityListItem[],
  routeKey: string | null,
  queryCommunityId: string | null,
): CommunityListItem | null {
  if (!memberships.length) return null;

  if (queryCommunityId) {
    const byQuery = memberships.find(
      (m) => m.id === queryCommunityId || m.slug === queryCommunityId,
    );
    if (byQuery) return byQuery;
  }

  if (routeKey) {
    const byRoute = memberships.find((m) => m.slug === routeKey || m.id === routeKey);
    if (byRoute) return byRoute;
  }

  return memberships[0];
}

export async function loadHomeFeed(queryCommunityId: string | null): Promise<HomeFeedPayload> {
  "use cache: private";
  cacheLife("minutes");
  cacheTag(HOME_FEED_CACHE_TAG);

  const session = await getApiSessionProfile();
  const [memberships, cookieSlug] = await Promise.all([
    listDiscoverableCommunities(session?.id ?? null),
    getActiveCommunitySlug(),
  ]);

  const activeCommunity = pickActiveCommunity(
    memberships,
    cookieSlug,
    queryCommunityId,
  );

  if (!activeCommunity) {
    return { activeCommunity: null, memberships, posts: [] };
  }

  const posts = await getCommunityFeedPosts(activeCommunity.id, activeCommunity.name, 50, {
    cacheable: true,
  });

  return { activeCommunity, memberships, posts };
}
