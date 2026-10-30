import {
  DEV_ACTIVE_COMMUNITY,
  DEV_CHANNELS,
  DEV_COMMUNITIES,
} from "@/lib/fixtures/dev-shell-data";
import type { ShellCommunityContext } from "@/lib/communities/shell-data";
import type { SidebarChannel, SidebarCommunity } from "@/types/community";

function toSidebarCommunity(c: (typeof DEV_COMMUNITIES)[number]): SidebarCommunity {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    logoUrl: c.logoUrl,
    initials: c.initials,
    accentColor: c.accentColor,
  };
}

const memberships = DEV_COMMUNITIES.map(toSidebarCommunity);
const activeCommunity = toSidebarCommunity(DEV_ACTIVE_COMMUNITY);
const channels: SidebarChannel[] = DEV_CHANNELS.map((ch) => ({
  id: ch.id,
  slug: ch.slug,
  name: ch.name,
}));

const channelsByCommunityId = Object.fromEntries(
  memberships.map((m) => [m.id, m.slug === DEV_ACTIVE_COMMUNITY.slug ? channels : []]),
);

export const DEMO_SHELL_COMMUNITY_CONTEXT: ShellCommunityContext = {
  activeSlug: DEV_ACTIVE_COMMUNITY.slug,
  activeCommunity,
  channels,
  channelsByCommunityId,
  memberships,
};
