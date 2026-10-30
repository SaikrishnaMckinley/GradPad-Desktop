export const COMMUNITY_HUB_CACHE_PREFIX = "gradpad-community-hub";

export function communityHubCacheTag(routeKey: string): string {
  return `${COMMUNITY_HUB_CACHE_PREFIX}:${routeKey.toLowerCase()}`;
}
