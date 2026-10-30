import "server-only";

import { cache } from "react";
import { getApiSessionProfile } from "@/lib/auth/get-api-session-profile";
import { resolveShellUser } from "@/lib/auth/resolve-shell-user";
import type { ChannelDetail, ChannelPostRow } from "@/lib/communities/channel-api";
import {
  getChannelPosts,
  resolveChannelInCommunity,
} from "@/lib/communities/channel-api";
import { isActiveMember } from "@/lib/communities/permissions";
import {
  getCommunityBySlug,
  getCommunityChannels,
  listDiscoverableCommunities,
} from "@/lib/communities/queries";
import type { CommunityDetail, CommunityListItem } from "@/types/community";

export type CommunityChannelPayload = {
  community: CommunityDetail;
  channel: ChannelDetail;
  posts: ChannelPostRow[];
  channels: {
    id: string;
    slug: string;
    name: string;
    description?: string | null;
  }[];
  isMember: boolean;
  shellUser: ReturnType<typeof resolveShellUser>;
  memberships: CommunityListItem[];
};

export const loadCommunityChannel = cache(
  async (
    communityRouteKey: string,
    channelRouteKey: string,
  ): Promise<CommunityChannelPayload | null> => {
    const session = await getApiSessionProfile();
    const [community, channel] = await Promise.all([
      getCommunityBySlug(communityRouteKey, session?.id ?? null),
      resolveChannelInCommunity(communityRouteKey, channelRouteKey),
    ]);

    if (!community || !channel) {
      return null;
    }

    const member = isActiveMember(community.membershipStatus);
    const canSee =
      member || community.visibility === "public";

    const [posts, channels, memberships] = await Promise.all([
      canSee ? getChannelPosts(channel.id) : [],
      canSee ? getCommunityChannels(community.id) : [],
      listDiscoverableCommunities(session?.id ?? null).then((list) =>
        list.filter((m) => isActiveMember(m.membershipStatus)),
      ),
    ]);

    return {
      community,
      channel,
      posts,
      channels,
      isMember: member,
      shellUser: resolveShellUser(session, true),
      memberships,
    };
  },
);
