import "server-only";

import { fetchPostsByCommunityRaw } from "@/lib/api/posts";
import { mapPostsResponse, type FeedPostRow } from "@/lib/posts/map-post";

export async function getCommunityFeedPosts(
  communityId: string,
  communityName: string,
  limit = 50,
  options?: { cacheable?: boolean },
): Promise<FeedPostRow[]> {
  const result = await fetchPostsByCommunityRaw(communityId, limit, options);
  if (!result.ok || !result.data) return [];
  return mapPostsResponse(result.data, communityName);
}
