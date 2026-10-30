import "server-only";

import { fetchChannelDetailRaw, fetchChannelPostsRaw } from "@/lib/api/channels";
import { fetchCommunityChannelsRaw } from "@/lib/api/communities";
import { unwrapList } from "@/lib/api/parse-list";
import { resolveCommunityId } from "@/lib/communities/api-queries";
import { mapPostsResponse, type FeedPostRow } from "@/lib/posts/map-post";

export type ChannelDetail = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  communityId: string;
};

type ApiChannel = {
  id: string;
  name?: string;
  slug?: string;
  title?: string;
  description?: string | null;
  community?: string | { id?: string };
  community_id?: string;
};

function mapChannel(row: ApiChannel, communityId: string): ChannelDetail {
  const name = row.name?.trim() || row.title?.trim() || "Channel";
  const slug = (row.slug?.trim() || row.id).toLowerCase();
  return {
    id: row.id,
    slug,
    name,
    description: row.description ?? null,
    communityId,
  };
}

function channelCommunityId(ch: ApiChannel): string | null {
  if (typeof ch.community === "string") return ch.community;
  if (ch.community_id) return ch.community_id;
  if (ch.community && typeof ch.community === "object" && ch.community.id) {
    return ch.community.id;
  }
  return null;
}

export async function listCommunityChannels(communityId: string): Promise<ChannelDetail[]> {
  const result = await fetchCommunityChannelsRaw(communityId);
  if (!result.ok || !result.data) return [];
  return unwrapList(result.data).map((row) => mapChannel(row as ApiChannel, communityId));
}

export async function resolveChannelInCommunity(
  communityRouteKey: string,
  channelRouteKey: string,
): Promise<ChannelDetail | null> {
  const communityId = await resolveCommunityId(communityRouteKey);
  if (!communityId) return null;

  const key = channelRouteKey.trim().toLowerCase();
  const channels = await listCommunityChannels(communityId);
  const fromList =
    channels.find((c) => c.slug === key || c.id.toLowerCase() === key) ?? null;
  if (fromList) return fromList;

  if (/^[0-9a-f-]{36}$/i.test(key)) {
    const detail = await fetchChannelDetailRaw(key);
    if (detail.ok && detail.data && typeof detail.data === "object") {
      const row = detail.data as ApiChannel;
      const cid = channelCommunityId(row) ?? communityId;
      if (cid === communityId) {
        return mapChannel(row, communityId);
      }
    }
  }

  return null;
}

export type ChannelPostRow = FeedPostRow;

export async function getChannelPosts(channelId: string, limit = 50): Promise<ChannelPostRow[]> {
  const result = await fetchChannelPostsRaw(channelId, limit);
  if (!result.ok || !result.data) return [];
  return mapPostsResponse(result.data);
}
