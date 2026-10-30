"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { mergeHubIntoShellContext } from "@/lib/shell/merge-hub-shell";
import { readShellCache, writeShellCache } from "@/lib/shell/shell-cache";
import type { CommunityHubPayload } from "@/lib/communities/hub-cache";
import { resolveShellUser } from "@/lib/auth/resolve-shell-user";
import type { ShellCommunityContext } from "@/lib/communities/shell-data";
import { DEMO_SHELL_COMMUNITY_CONTEXT } from "@/lib/fixtures/demo-shell-context";
import type { ShellUser } from "@/types/shell-user";

function isDemoMode(): boolean {
  const raw = process.env.NEXT_PUBLIC_DEMO_STATIC_UI?.trim().toLowerCase();
  if (!raw || raw === "false" || raw === "0" || raw === "no") return false;
  return true;
}

const EMPTY_COMMUNITY: ShellCommunityContext = {
  activeSlug: null,
  activeCommunity: null,
  channels: [],
  channelsByCommunityId: {},
  memberships: [],
};

type ShellData = {
  shellUser: ShellUser;
  communityContext: ShellCommunityContext;
  hydrated: boolean;
  refreshShell: () => void;
};

const ShellDataContext = createContext<ShellData | null>(null);

export function useShellData(): ShellData {
  const ctx = useContext(ShellDataContext);
  if (!ctx) {
    throw new Error("useShellData must be used within ShellDataProvider");
  }
  return ctx;
}

const PLACEHOLDER_USER = resolveShellUser(null, true);

function syncActiveCommunityFromPath(
  pathname: string,
  prev: ShellCommunityContext,
): ShellCommunityContext {
  const match = pathname.match(/^\/communities\/([^/]+)/);
  const routeKey = match?.[1];
  if (!routeKey || routeKey === "new" || routeKey === "discover") {
    return prev;
  }

  const membership =
    prev.memberships.find((m) => m.slug === routeKey || m.id === routeKey) ?? null;
  if (!membership) {
    return { ...prev, activeSlug: routeKey };
  }

  return {
    ...prev,
    activeSlug: membership.slug,
    activeCommunity: membership,
    channels: prev.channelsByCommunityId[membership.id] ?? [],
  };
}

export function ShellDataProvider({ children }: { children: ReactNode }) {
  const demo = isDemoMode();
  const pathname = usePathname();

  const [shellUser, setShellUser] = useState<ShellUser>(PLACEHOLDER_USER);
  const [communityContext, setCommunityContext] = useState<ShellCommunityContext>(() =>
    demo ? DEMO_SHELL_COMMUNITY_CONTEXT : EMPTY_COMMUNITY,
  );
  const [hydrated, setHydrated] = useState(demo);

  const loadShell = useCallback(() => {
    fetch("/api/shell", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((body: { user?: ShellUser; communityContext?: ShellCommunityContext } | null) => {
        if (!body?.user) {
          setHydrated(true);
          return;
        }
        setShellUser(body.user);
        setCommunityContext((prev) => {
          const merged = syncActiveCommunityFromPath(
            pathname,
            body.communityContext ?? prev,
          );
          writeShellCache(body.user!, merged);
          return merged;
        });
        setHydrated(true);
      })
      .catch(() => {
        setHydrated(true);
      });
  }, [pathname]);

  useLayoutEffect(() => {
    const cached = readShellCache();
    if (!cached) return;
    setShellUser(cached.user);
    setCommunityContext(syncActiveCommunityFromPath(pathname, cached.communityContext));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restore cache once on mount
  }, []);

  useEffect(() => {
    loadShell();
  }, [loadShell]);

  useEffect(() => {
    setCommunityContext((prev) => syncActiveCommunityFromPath(pathname, prev));
  }, [pathname]);

  useEffect(() => {
    const onRefresh = () => loadShell();
    window.addEventListener("gradpad:refresh-shell", onRefresh);
    return () => window.removeEventListener("gradpad:refresh-shell", onRefresh);
  }, [loadShell]);

  useEffect(() => {
    const onHub = (event: Event) => {
      const hub = (event as CustomEvent<CommunityHubPayload>).detail;
      if (!hub) return;
      setShellUser(hub.shellUser);
      setCommunityContext((prev) => {
        const merged = syncActiveCommunityFromPath(
          pathname,
          mergeHubIntoShellContext(prev, hub),
        );
        writeShellCache(hub.shellUser, merged);
        return merged;
      });
    };
    window.addEventListener("gradpad:hub-shell", onHub);
    return () => window.removeEventListener("gradpad:hub-shell", onHub);
  }, [pathname]);

  const value = useMemo(
    () => ({
      shellUser,
      communityContext,
      hydrated,
      refreshShell: loadShell,
    }),
    [shellUser, communityContext, hydrated, loadShell],
  );

  return <ShellDataContext.Provider value={value}>{children}</ShellDataContext.Provider>;
}
