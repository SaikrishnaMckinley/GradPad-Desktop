"use client";

import { usePathname } from "next/navigation";
import { CommunityHubPlaceholder } from "@/components/communities/CommunityHubPlaceholder";
import { LiveCommunityHub } from "@/components/communities/LiveCommunityHub";
import { resolveHubFallback } from "@/lib/communities/hub-cache";

function communityRouteKey(pathname: string): string | null {
  const match = pathname.match(/^\/communities\/([^/]+)/);
  const key = match?.[1];
  if (!key || key === "new" || key === "discover") return null;
  return key;
}

export function CommunityDetailLoading() {
  const pathname = usePathname();
  const routeKey = communityRouteKey(pathname);
  if (!routeKey) return null;

  const cached = resolveHubFallback(routeKey);
  if (cached) {
    return <LiveCommunityHub initialHub={cached} />;
  }

  return <CommunityHubPlaceholder routeKey={routeKey} />;
}
