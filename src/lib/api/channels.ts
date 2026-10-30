import "server-only";

import { serverFetchJson } from "@/lib/api/server-fetch";

export async function fetchChannelDetailRaw(channelId: string) {
  return serverFetchJson<unknown>(`channels/${channelId}/`);
}

export async function fetchChannelPostsRaw(channelId: string, limit = 50) {
  return serverFetchJson<unknown>(
    `posts/?channel=${encodeURIComponent(channelId)}&limit=${limit}&page_size=${limit}`,
  );
}
