"use client";

import type { ReactNode } from "react";
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
    <PageContainer
      withRightRail={Boolean(hub)}
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
  );
}
