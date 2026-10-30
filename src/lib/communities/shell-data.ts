import { getApiShellCommunityContext } from "@/lib/communities/api-sidebar";
import { getActiveCommunitySlug } from "@/lib/communities/active-community";
import {
  getSidebarChannels,
  getUserSidebarCommunities,
} from "@/lib/communities/queries";
import { isDemoStaticUi } from "@/lib/demo-mode";
import type { SidebarChannel, SidebarCommunity } from "@/types/community";

export type ShellCommunityContext = {
  activeSlug: string | null;
  activeCommunity: SidebarCommunity | null;
  channels: SidebarChannel[];
  channelsByCommunityId: Record<string, SidebarChannel[]>;
  memberships: SidebarCommunity[];
};

const empty: ShellCommunityContext = {
  activeSlug: null,
  activeCommunity: null,
  channels: [],
  channelsByCommunityId: {},
  memberships: [],
};

export async function getShellCommunityContext(
  userId: string | null,
): Promise<ShellCommunityContext> {
  if (!userId) {
    return empty;
  }

  if (!isDemoStaticUi()) {
    return getApiShellCommunityContext();
  }

  const [memberships, cookieSlug] = await Promise.all([
    getUserSidebarCommunities(userId),
    getActiveCommunitySlug(),
  ]);

  if (!memberships.length) {
    return { ...empty, memberships };
  }

  const activeSlug =
    cookieSlug && memberships.some((m) => m.slug === cookieSlug)
      ? cookieSlug
      : memberships[0].slug;

  const activeCommunity =
    memberships.find((m) => m.slug === activeSlug) ?? memberships[0];

  const channelEntries = await Promise.all(
    memberships.map(async (m) => [m.id, await getSidebarChannels(m.id)] as const),
  );
  const channelsByCommunityId = Object.fromEntries(channelEntries);
  const channels = channelsByCommunityId[activeCommunity.id] ?? [];

  return {
    activeSlug: activeCommunity.slug,
    activeCommunity,
    channels,
    channelsByCommunityId,
    memberships,
  };
}
