import "server-only";

import { flattenUserMembershipCommunities } from "@/lib/api/community-list";
import { serverFetchJson } from "@/lib/api/server-fetch";
import type { ApiCommunityRecord } from "@/lib/api/map-community";

export async function fetchCommunityListRaw() {
  return serverFetchJson<unknown>("community/list/");
}

export async function fetchAllCommunitiesRaw() {
  return serverFetchJson<unknown>("community/all/");
}

export async function fetchCommunityDetailRaw(communityId: string) {
  return serverFetchJson<ApiCommunityRecord>(`community/${communityId}/`);
}

export async function fetchCommunityChannelsRaw(communityId: string) {
  return serverFetchJson<unknown>(`community/${communityId}/channels/`);
}

export async function fetchCommunityMembersRaw(communityId: string) {
  return serverFetchJson<unknown>(`community/${communityId}/members/`);
}

export async function fetchCommunityUpcomingEventsRaw(communityId: string) {
  return serverFetchJson<unknown>(`community/${communityId}/events/upcoming/`);
}

export async function fetchCommunityPostsRaw(communityId: string, limit = 5) {
  return serverFetchJson<unknown>(
    `posts/?community=${encodeURIComponent(communityId)}&limit=${limit}&page_size=${limit}`,
  );
}

export function communitiesFromResponse(data: unknown): ApiCommunityRecord[] {
  return flattenUserMembershipCommunities(data);
}
