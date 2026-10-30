import type { CommunityHubPayload } from "@/lib/communities/hub-cache";
import type { ShellCommunityContext } from "@/lib/communities/shell-data";
import { mergeChannelsByCommunityId } from "@/lib/shell/shell-context-sync";
import { communityAccentColor, communityInitials } from "@/lib/communities/slug";
import type { CommunityListItem, SidebarCommunity } from "@/types/community";

function toSidebarCommunity(item: CommunityListItem): SidebarCommunity {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    logoUrl: item.logoUrl,
    initials: communityInitials(item.name),
    accentColor: communityAccentColor(item.slug),
  };
}

export function mergeHubIntoShellContext(
  prev: ShellCommunityContext,
  hub: CommunityHubPayload,
): ShellCommunityContext {
  const byId = new Map(prev.memberships.map((m) => [m.id, m]));
  for (const item of hub.memberships) {
    byId.set(item.id, toSidebarCommunity(item));
  }
  const memberships = Array.from(byId.values());

  const hubChannels = hub.channels.map((ch) => ({
    id: ch.id,
    slug: ch.slug,
    name: ch.name,
  }));
  const channelsByCommunityId = mergeChannelsByCommunityId(prev.channelsByCommunityId, {
    [hub.community.id]: hubChannels,
  });

  const routeKey = hub.community.slug ?? hub.community.id;
  const activeCommunity =
    memberships.find((m) => m.slug === routeKey || m.id === routeKey) ??
    toSidebarCommunity(hub.community);

  return {
    activeSlug: activeCommunity.slug,
    activeCommunity,
    channels: channelsByCommunityId[activeCommunity.id] ?? [],
    channelsByCommunityId,
    memberships,
  };
}
