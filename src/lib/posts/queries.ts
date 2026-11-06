import "server-only";

import { getApiSessionProfile } from "@/lib/auth/get-api-session-profile";
import { fetchPostsByCommunityRaw } from "@/lib/api/posts";
import { mapPostsResponse, type FeedPostRow } from "@/lib/posts/map-post";

export async function getCommunityFeedPosts(
  communityId: string,
  communityName: string,
  limit = 50,
  options?: { cacheable?: boolean; viewerUserId?: string | null },
): Promise<FeedPostRow[]> {
  let viewerUserId = options?.viewerUserId;
  if (viewerUserId === undefined) {
    const session = await getApiSessionProfile();
    viewerUserId = session?.id ?? null;
  }

  const result = await fetchPostsByCommunityRaw(communityId, limit, {
    cacheable: options?.cacheable ?? false,
  });
  if (!result.ok || !result.data) return [];
  return mapPostsResponse(result.data, communityName, viewerUserId);
}
