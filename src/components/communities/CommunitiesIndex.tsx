"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CommunitiesMembershipEmpty } from "@/components/communities/CommunitiesMembershipEmpty";
import { CommunityDemoScreen } from "@/components/communities/CommunityDemoScreen";
import { CommunityDetailLoading } from "@/components/communities/CommunityDetailLoading";
import { LiveCommunityHub } from "@/components/communities/LiveCommunityHub";
import { useShellData } from "@/components/layout/ShellDataProvider";
import { readHubCache } from "@/lib/communities/hub-cache";
import { resolveCommunityHubPath } from "@/lib/navigation/primary-nav-href";
import { DEV_ACTIVE_COMMUNITY } from "@/lib/fixtures/dev-shell-data";

function isDemoMode(): boolean {
  const raw = process.env.NEXT_PUBLIC_DEMO_STATIC_UI?.trim().toLowerCase();
  if (!raw || raw === "false" || raw === "0" || raw === "no") return false;
  return true;
}

/**
 * Communities hub index: uses shell + hub session cache while redirecting to the active community.
 */
export function CommunitiesIndex() {
  const router = useRouter();
  const { communityContext, hydrated } = useShellData();
  const demo = isDemoMode();

  const targetSlug = useMemo(
    () => (demo ? null : resolveCommunityHubPath(communityContext)),
    [demo, communityContext],
  );

  const cachedHub = targetSlug ? readHubCache(targetSlug) : null;

  useEffect(() => {
    if (demo || !hydrated || !targetSlug) return;
    router.replace(`/communities/${targetSlug}`);
  }, [demo, hydrated, targetSlug, router]);

  if (demo) {
    const slug = communityContext.activeSlug ?? DEV_ACTIVE_COMMUNITY.slug;
    return <CommunityDemoScreen slug={slug} />;
  }

  if (!hydrated) {
    return <CommunityDetailLoading />;
  }

  if (communityContext.memberships.length === 0) {
    return <CommunitiesMembershipEmpty />;
  }

  if (cachedHub) {
    return <LiveCommunityHub initialHub={cachedHub} />;
  }

  if (targetSlug) {
    return <CommunityDetailLoading />;
  }

  return null;
}
