export const COMMUNITY_HUB_CACHE_PREFIX = "gradpad-community-hub";

export function communityHubCacheTag(routeKey: string): string {
  return `${COMMUNITY_HUB_CACHE_PREFIX}:${routeKey.toLowerCase()}`;
}

const COMMUNITY_ADMIN_CACHE_PREFIX = "gradpad-community-admin";

export function communityAdminCacheTag(routeKey: string): string {
  return `${COMMUNITY_ADMIN_CACHE_PREFIX}:${routeKey.toLowerCase()}`;
}

const COMMUNITY_MEMBERS_DIRECTORY_PREFIX = "gradpad-community-members-directory";

export function communityMembersDirectoryCacheTag(routeKey: string): string {
  return `${COMMUNITY_MEMBERS_DIRECTORY_PREFIX}:${routeKey.toLowerCase()}`;
}
