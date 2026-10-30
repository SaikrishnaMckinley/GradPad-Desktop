import "server-only";

import { flattenUserMembershipCommunities } from "@/lib/api/community-list";
import { unwrapList } from "@/lib/api/parse-list";
import { serverFetchJson } from "@/lib/api/server-fetch";
import { getActiveCommunitySlug } from "@/lib/communities/active-community";
import { mapSidebarCommunity } from "@/lib/api/map-community";
import type { ShellCommunityContext } from "@/lib/communities/shell-data";
import type { SidebarChannel, SidebarCommunity } from "@/types/community";

type ApiChannel = {
  id: string;
  name?: string;
  slug?: string;
  title?: string;
  community?: string | { id?: string };
  community_id?: string;
};

function mapSidebarChannel(ch: ApiChannel): SidebarChannel {
  const name = ch.name?.trim() || ch.title?.trim() || "Channel";
  const slug = (ch.slug?.trim() || ch.id).toLowerCase();
  return { id: ch.id, slug, name };
}

function channelCommunityId(ch: ApiChannel): string | null {
  if (typeof ch.community === "string") return ch.community;
  if (ch.community_id) return ch.community_id;
  if (ch.community && typeof ch.community === "object" && ch.community.id) {
    return ch.community.id;
  }
  return null;
}

export async function getApiShellCommunityContext(): Promise<ShellCommunityContext> {
  const empty: ShellCommunityContext = {
    activeSlug: null,
    activeCommunity: null,
    channels: [],
    channelsByCommunityId: {},
    memberships: [],
  };

  const [listResult, channelsResult, cookieSlug] = await Promise.all([
    serverFetchJson("community/list/"),
    serverFetchJson("channels/joined/"),
    getActiveCommunitySlug(),
  ]);

  if (!listResult.ok || !listResult.data) {
    return empty;
  }

  const memberships = flattenUserMembershipCommunities(listResult.data)
    .map((row) => mapSidebarCommunity(row))
    .filter((c): c is NonNullable<ReturnType<typeof mapSidebarCommunity>> => Boolean(c));

  if (!memberships.length) {
    return { ...empty, memberships };
  }

  const channelsByCommunityId: Record<string, SidebarChannel[]> = {};
  if (channelsResult.ok && channelsResult.data) {
    for (const row of unwrapList(channelsResult.data)) {
      const ch = mapSidebarChannel(row as ApiChannel);
      const communityId = channelCommunityId(row as ApiChannel);
      if (!communityId) continue;
      if (!channelsByCommunityId[communityId]) {
        channelsByCommunityId[communityId] = [];
      }
      channelsByCommunityId[communityId].push(ch);
    }
  }

  const activeSlug =
    cookieSlug && memberships.some((m) => m.slug === cookieSlug)
      ? cookieSlug
      : memberships[0].slug;

  const activeCommunity =
    memberships.find((m) => m.slug === activeSlug) ?? memberships[0];

  const channels = channelsByCommunityId[activeCommunity.id] ?? [];

  return {
    activeSlug: activeCommunity.slug,
    activeCommunity,
    channels,
    channelsByCommunityId,
    memberships,
  };
}
