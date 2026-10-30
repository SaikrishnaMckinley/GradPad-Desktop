"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useShellData } from "@/components/layout/ShellDataProvider";
import { primaryNavHref } from "@/lib/navigation/primary-nav-href";
import { PRIMARY_NAV } from "@/types/navigation";

/** Warm Home + active community routes for instant tab switches. */
export function NavPrefetch() {
  const router = useRouter();
  const { communityContext } = useShellData();

  useEffect(() => {
    router.prefetch("/home");
    const communitiesItem = PRIMARY_NAV.find((item) => item.href === "/communities");
    if (communitiesItem) {
      router.prefetch(primaryNavHref(communitiesItem, communityContext));
    }
  }, [router, communityContext]);

  return null;
}
