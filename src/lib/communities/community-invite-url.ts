import { siteOrigin } from "@/lib/events/site-url";

/** Share link path — uses community id so links match gradpad-web. */
export function communityInvitePath(communityId: string, options?: { view?: "login" | "signup" }) {
  const params = new URLSearchParams();
  if (options?.view) params.set("view", options.view);
  const qs = params.toString();
  return `/communities/${communityId}/community-invite${qs ? `?${qs}` : ""}`;
}

export function communityInviteCompletePath(routeKey: string) {
  return `/communities/${routeKey}/community-invite/complete`;
}

/** Hub URL after invite — keeps community id in the path (gradpad-web share links). */
export function communityHubAfterInvitePath(
  communityId: string,
  join?: "pending" | "ok" | "error",
) {
  if (!join) return `/communities/${communityId}`;
  return `/communities/${communityId}?join=${join}`;
}

export function buildCommunityInviteUrl(communityId: string, origin = siteOrigin()): string {
  return `${origin.replace(/\/$/, "")}${communityInvitePath(communityId)}`;
}
