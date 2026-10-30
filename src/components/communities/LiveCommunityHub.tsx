"use client";

import { Suspense, useLayoutEffect } from "react";
import { CommunityJoinStatusToast } from "@/components/communities/CommunityJoinStatusToast";
import { CommunityDetailContent } from "@/components/communities/CommunityDetailContent";
import { CommunityDetailSidebar } from "@/components/communities/CommunityDetailSidebar";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  rememberDisplayedHub,
  type CommunityHubPayload,
} from "@/lib/communities/hub-cache";

type Props = {
  initialHub: CommunityHubPayload;
};

export function LiveCommunityHub({ initialHub }: Props) {
  useLayoutEffect(() => {
    const routeKey = initialHub.community.slug ?? initialHub.community.id;
    rememberDisplayedHub(routeKey, initialHub);
    window.dispatchEvent(
      new CustomEvent("gradpad:hub-shell", { detail: initialHub }),
    );
  }, [initialHub]);

  return (
    <>
      <Suspense fallback={null}>
        <CommunityJoinStatusToast />
      </Suspense>
    <PageContainer
      withRightRail
      rightRail={
        <CommunityDetailSidebar
          user={initialHub.shellUser}
          communityId={initialHub.isMember ? initialHub.community.id : undefined}
          canCreateInCommunity={initialHub.isMember}
          memberships={initialHub.memberships}
          upcomingEvents={initialHub.events}
        />
      }
    >
      <CommunityDetailContent
        community={initialHub.community}
        channels={initialHub.channels}
        events={initialHub.events}
        posts={initialHub.posts}
        membersPreview={initialHub.membersPreview}
        canManage={initialHub.canManage}
        isMember={initialHub.isMember}
      />
    </PageContainer>
    </>
  );
}
