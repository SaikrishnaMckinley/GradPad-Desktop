"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { CommunityDetailSidebar } from "@/components/communities/CommunityDetailSidebar";
import { PageContainer } from "@/components/layout/PageContainer";
import type { CommunityHubPayload } from "@/lib/communities/hub-cache";
import { resolveHubFallback } from "@/lib/communities/hub-cache";

type Props = {
  slug: string;
  hub?: CommunityHubPayload | null;
  children: ReactNode;
};

export function CommunityMembersPageFrame({ slug, hub: hubFromServer, children }: Props) {
  const hub = hubFromServer ?? resolveHubFallback(slug);

  return (
    <div className={cn(hub && "flex min-h-0 flex-1 flex-col")}>
    <PageContainer
      withRightRail={Boolean(hub)}
      unifiedScroll={Boolean(hub)}
      className={
        hub
          ? "min-h-0 flex-1 lg:max-h-[calc(100dvh-3.875rem)] lg:overflow-hidden"
          : undefined
      }
      rightRail={
        hub ? (
          <CommunityDetailSidebar
            user={hub.shellUser}
            communityId={hub.isMember ? hub.community.id : undefined}
            canCreateInCommunity={hub.isMember}
            memberships={hub.memberships}
            upcomingEvents={hub.events}
          />
        ) : null
      }
    >
      <div className="mx-auto w-full max-w-3xl">{children}</div>
    </PageContainer>
    </div>
  );
}
