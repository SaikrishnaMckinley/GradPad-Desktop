import type { ShellCommunityContext } from "@/lib/communities/shell-data";
import type { SidebarChannel } from "@/types/community";

function mergeChannelLists(
  a: SidebarChannel[] | undefined,
  b: SidebarChannel[] | undefined,
): SidebarChannel[] {
  const map = new Map<string, SidebarChannel>();
  for (const ch of [...(a ?? []), ...(b ?? [])]) {
    map.set(ch.id, ch);
  }
  return Array.from(map.values());
}

export function mergeChannelsByCommunityId(
  prev: Record<string, SidebarChannel[]>,
  incoming: Record<string, SidebarChannel[]>,
): Record<string, SidebarChannel[]> {
  const ids = new Set([...Object.keys(prev), ...Object.keys(incoming)]);
  const out: Record<string, SidebarChannel[]> = {};
  for (const id of ids) {
    out[id] = mergeChannelLists(prev[id], incoming[id]);
  }
  return out;
}

function communityRouteFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/communities\/([^/]+)/);
  const routeKey = match?.[1];
  if (!routeKey || routeKey === "new" || routeKey === "discover") {
    return null;
  }
  return routeKey;
}

function channelsForCommunity(
  ctx: ShellCommunityContext,
  communityId: string,
): SidebarChannel[] {
  return ctx.channelsByCommunityId[communityId] ?? [];
}

/** Keep sidebar channels stable when leaving /communities/* (Home, Events, etc.). */
export function applyPathToShellContext(
  pathname: string,
  prev: ShellCommunityContext,
  incoming: ShellCommunityContext,
): ShellCommunityContext {
  const channelsByCommunityId = mergeChannelsByCommunityId(
    prev.channelsByCommunityId,
    incoming.channelsByCommunityId,
  );

  const memberships =
    incoming.memberships.length > 0 ? incoming.memberships : prev.memberships;

  const routeKey = communityRouteFromPath(pathname);

  if (!routeKey) {
    const activeCommunity = prev.activeCommunity ?? incoming.activeCommunity;
    const activeSlug =
      prev.activeSlug ??
      activeCommunity?.slug ??
      activeCommunity?.id ??
      incoming.activeSlug;

    const channels = activeCommunity
      ? channelsForCommunity({ ...prev, channelsByCommunityId }, activeCommunity.id)
      : incoming.channels;

    return {
      activeSlug,
      activeCommunity,
      channels,
      channelsByCommunityId,
      memberships,
    };
  }

  const membership =
    memberships.find((m) => m.slug === routeKey || m.id === routeKey) ?? null;

  if (!membership) {
    return {
      ...prev,
      activeSlug: routeKey,
      channelsByCommunityId,
      memberships,
      channels: channelsForCommunity({ ...prev, channelsByCommunityId }, routeKey),
    };
  }

  return {
    activeSlug: membership.slug ?? membership.id,
    activeCommunity: membership,
    channels: channelsForCommunity({ ...prev, channelsByCommunityId }, membership.id),
    channelsByCommunityId,
    memberships,
  };
}

export function resolveSidebarCommunityRouteKey(
  activeSlug: string | null,
  activeCommunity: ShellCommunityContext["activeCommunity"],
): string | null {
  if (activeCommunity) {
    return activeCommunity.slug ?? activeCommunity.id;
  }
  return activeSlug;
}
