import type { ShellCommunityContext } from "@/lib/communities/shell-data";
import type { NavItem } from "@/types/navigation";

function resolveCommunityPath(communityContext: ShellCommunityContext): string {
  const { activeCommunity, activeSlug, memberships } = communityContext;
  const fromActive =
    activeCommunity?.slug ??
    activeCommunity?.id ??
    (activeSlug &&
    memberships.some((m) => m.slug === activeSlug || m.id === activeSlug)
      ? activeSlug
      : null);

  if (fromActive) {
    return `/communities/${fromActive}`;
  }

  if (memberships[0]) {
    return `/communities/${memberships[0].slug ?? memberships[0].id}`;
  }

  return "/communities";
}

/** Direct `/communities/{slug}` avoids index redirect flash (shell knows active community). */
export function primaryNavHref(item: NavItem, communityContext: ShellCommunityContext): string {
  if (item.href !== "/communities") {
    return item.href;
  }
  return resolveCommunityPath(communityContext);
}

export function resolveCommunityHubPath(
  communityContext: ShellCommunityContext,
): string | null {
  const href = resolveCommunityPath(communityContext);
  const match = href.match(/^\/communities\/([^/]+)/);
  return match?.[1] ?? null;
}
