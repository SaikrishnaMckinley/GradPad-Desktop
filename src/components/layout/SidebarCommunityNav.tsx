"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Plus } from "lucide-react";
import { CommunityMark } from "@/components/layout/CommunityMark";
import { buttonVariants } from "@/components/ui/button";
import { canCreateInCommunity } from "@/lib/communities/permissions";
import type { ShellCommunityContext } from "@/lib/communities/shell-data";
import { resolveSidebarCommunityRouteKey } from "@/lib/shell/shell-context-sync";
import { cn } from "@/lib/utils/cn";

type Props = {
  communityContext: ShellCommunityContext;
};

const isDemoStaticUi =
  process.env.NEXT_PUBLIC_DEMO_STATIC_UI !== "false";

function resolveActiveSlug(pathname: string, fallback: string | null): string | null {
  if (isDemoStaticUi && pathname === "/communities") {
    return fallback;
  }
  const match = pathname.match(/^\/communities\/([^/]+)/);
  const pathSlug = match?.[1];
  if (pathSlug && pathSlug !== "new" && pathSlug !== "discover") {
    return pathSlug;
  }
  return fallback;
}

export function SidebarCommunityNav({ communityContext }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const activeSlug = resolveActiveSlug(pathname, communityContext.activeSlug);

  useEffect(() => {
    for (const community of communityContext.memberships) {
      router.prefetch(`/communities/${community.slug}`);
      const list = communityContext.channelsByCommunityId[community.id] ?? [];
      for (const channel of list) {
        router.prefetch(`/communities/${community.slug}/channels/${channel.slug}`);
      }
    }
  }, [communityContext.memberships, communityContext.channelsByCommunityId, router]);
  const activeCommunity =
    communityContext.memberships.find(
      (m) => m.slug === activeSlug || m.id === activeSlug,
    ) ?? communityContext.activeCommunity;

  const communityRouteKey = resolveSidebarCommunityRouteKey(activeSlug, activeCommunity);

  const channels = activeCommunity
    ? (communityContext.channelsByCommunityId[activeCommunity.id] ??
      communityContext.channels)
    : communityContext.channels;

  const canCreateInActive = activeCommunity
    ? canCreateInCommunity(activeCommunity.membershipStatus)
    : false;

  return (
    <>
      {activeCommunity ? (
        <div className="mb-6 rounded-[16px] border border-primary-border bg-primary-light/60 p-3">
          <div className="flex items-center gap-3">
            <CommunityMark
              name={activeCommunity.name}
              initials={activeCommunity.initials}
              accentColor={activeCommunity.accentColor}
              logoUrl={activeCommunity.logoUrl}
              size="md"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {activeCommunity.name}
              </p>
              <p className="text-xs text-muted-foreground">Active community</p>
            </div>
          </div>
        </div>
      ) : null}

      <section className="mb-6">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Channels
          </h2>
          {canCreateInActive && activeCommunity ? (
            <Link
              href={`/create?tab=channel&community=${encodeURIComponent(activeCommunity.id)}`}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-primary hover:bg-primary-light"
              aria-label="Create channel"
            >
              <Plus className="h-4 w-4" strokeWidth={2.25} />
            </Link>
          ) : null}
        </div>
        {activeCommunity && communityRouteKey && channels.length > 0 ? (
          <ul className="space-y-0.5 px-0.5">
            {channels.map((channel) => {
              const href = `/communities/${communityRouteKey}/channels/${channel.slug}`;
              const active =
                pathname === href ||
                pathname.startsWith(`${href}/`);
              return (
                <li key={channel.id}>
                  <Link
                    href={href}
                    scroll={false}
                    prefetch
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm transition-colors",
                      active
                        ? "bg-primary-light font-medium text-primary"
                        : "text-foreground hover:bg-secondary",
                    )}
                  >
                    <span className="text-muted-foreground">#</span>
                    {channel.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="px-1 text-xs text-muted-foreground">
            {activeCommunity ? "No channels yet." : "Join a community to see channels."}
          </p>
        )}
      </section>

      <section className="flex-1">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Communities
          </h2>
          <Link
            href="/create?tab=community"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-primary hover:bg-primary-light"
            aria-label="Create community"
          >
            <Plus className="h-4 w-4" strokeWidth={2.25} />
          </Link>
        </div>
        {communityContext.memberships.length > 0 ? (
          <ul className="space-y-0.5">
            {communityContext.memberships.map((community) => {
              const href = `/communities/${community.slug}`;
              const active =
                community.slug === activeSlug ||
                community.id === activeSlug ||
                pathname.startsWith(`/communities/${community.slug}`) ||
                pathname.startsWith(`/communities/${community.id}`);
              return (
                <li key={community.id}>
                  <Link
                    href={href}
                    scroll={false}
                    prefetch
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition-colors",
                      active
                        ? "bg-primary-light font-medium text-primary"
                        : "text-foreground hover:bg-secondary",
                    )}
                  >
                    <CommunityMark
                      name={community.name}
                      initials={community.initials}
                      accentColor={community.accentColor}
                      logoUrl={community.logoUrl}
                      size="sm"
                    />
                    <span className="truncate">{community.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="px-1 text-xs text-muted-foreground">
            You have not joined any communities yet.
          </p>
        )}
        {communityContext.memberships.length === 0 ? (
          <Link
            href="/create?tab=community"
            className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "mt-4 w-full")}
          >
            Create a community
          </Link>
        ) : null}
      </section>
    </>
  );
}
