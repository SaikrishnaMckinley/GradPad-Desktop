"use client";

import { CommunityCoverImage } from "@/components/communities/CommunityCoverImage";
import { CommunityDetailSidebar } from "@/components/communities/CommunityDetailSidebar";
import { CommunityMark } from "@/components/layout/CommunityMark";
import { useShellData } from "@/components/layout/ShellDataProvider";
import { PageContainer } from "@/components/layout/PageContainer";
import { communityAccentColor, communityInitials } from "@/lib/communities/slug";

type Props = {
  routeKey: string;
};

/** Instant chrome on reload / first paint while hub API loads. */
export function CommunityHubPlaceholder({ routeKey }: Props) {
  const { shellUser, communityContext } = useShellData();

  const membership =
    communityContext.memberships.find(
      (m) => m.slug === routeKey || m.id === routeKey,
    ) ??
    (communityContext.activeCommunity &&
    (communityContext.activeCommunity.slug === routeKey ||
      communityContext.activeCommunity.id === routeKey)
      ? communityContext.activeCommunity
      : null);

  const name = membership?.name ?? "Community";
  const initials = membership?.initials ?? communityInitials(name);
  const accent = membership?.accentColor ?? communityAccentColor(routeKey);

  return (
    <PageContainer
      withRightRail
      rightRail={
        <CommunityDetailSidebar user={shellUser} memberships={[]} upcomingEvents={[]} />
      }
    >
      <div className="overflow-hidden rounded-[22px] border border-border bg-card shadow-card">
        <div className="relative h-44 md:h-52">
          <CommunityCoverImage name={name} slug={routeKey} coverImageUrl={null} />
        </div>
        <div className="relative px-5 pb-6 md:px-8">
          <div className="-mt-10 flex gap-4">
            <CommunityMark
              name={name}
              initials={initials}
              accentColor={accent}
              logoUrl={membership?.logoUrl}
              shape="rounded"
              size="lg"
              className="h-20 w-20 shrink-0 text-xl ring-4 ring-card"
            />
            <div className="min-w-0 flex-1 pt-12 md:pt-10">
              <h1 className="text-2xl font-semibold">{name}</h1>
              <p className="text-sm text-muted-foreground">Loading community…</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 space-y-4">
        <div className="h-32 animate-pulse rounded-2xl bg-page-secondary" />
        <div className="h-40 animate-pulse rounded-2xl bg-page-secondary" />
      </div>
    </PageContainer>
  );
}
