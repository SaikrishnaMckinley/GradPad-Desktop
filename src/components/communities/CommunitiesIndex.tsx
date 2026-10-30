"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CommunitiesMembershipEmpty } from "@/components/communities/CommunitiesMembershipEmpty";
import { CommunityDemoScreen } from "@/components/communities/CommunityDemoScreen";
import { useShellData } from "@/components/layout/ShellDataProvider";
import { DEV_ACTIVE_COMMUNITY } from "@/lib/fixtures/dev-shell-data";

function isDemoMode(): boolean {
  const raw = process.env.NEXT_PUBLIC_DEMO_STATIC_UI?.trim().toLowerCase();
  if (!raw || raw === "false" || raw === "0" || raw === "no") return false;
  return true;
}

/**
 * Communities hub index: no server API on navigation — uses shell data from /api/shell.
 */
export function CommunitiesIndex() {
  const router = useRouter();
  const { communityContext, hydrated } = useShellData();
  const demo = isDemoMode();

  useEffect(() => {
    if (demo || !hydrated) return;

    const { memberships, activeSlug } = communityContext;
    if (memberships.length === 0) return;

    const activeMatch =
      activeSlug && memberships.some((m) => m.slug === activeSlug || m.id === activeSlug)
        ? activeSlug
        : null;
    const target = activeMatch ?? memberships[0]?.slug ?? memberships[0]?.id;
    if (target) {
      router.replace(`/communities/${target}`);
    }
  }, [demo, hydrated, communityContext, router]);

  if (demo) {
    const slug = communityContext.activeSlug ?? DEV_ACTIVE_COMMUNITY.slug;
    return <CommunityDemoScreen slug={slug} />;
  }

  if (!hydrated) {
    return null;
  }

  if (communityContext.memberships.length === 0) {
    return <CommunitiesMembershipEmpty />;
  }

  return null;
}
