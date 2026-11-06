"use client";

import { useLayoutEffect } from "react";
import { CommunityChannelContent } from "@/components/communities/CommunityChannelContent";
import { CommunityDetailSidebar } from "@/components/communities/CommunityDetailSidebar";
import { PageContainer } from "@/components/layout/PageContainer";
import { writeChannelCache } from "@/lib/communities/channel-cache";
import type { CommunityChannelPayload } from "@/lib/communities/load-community-channel";

type Props = {
  initial: CommunityChannelPayload;
};

export function LiveCommunityChannel({ initial }: Props) {
  useLayoutEffect(() => {
    writeChannelCache(initial);
    window.dispatchEvent(
      new CustomEvent("gradpad:hub-shell", {
        detail: {
          community: initial.community,
          channels: initial.channels,
          events: [],
          posts: [],
          membersPreview: [],
          canManage: false,
          isMember: initial.isMember,
          shellUser: initial.shellUser,
          memberships: initial.memberships,
        },
      }),
    );
  }, [initial]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
    <PageContainer
      withRightRail
      unifiedScroll
      className="min-h-0 flex-1 lg:max-h-[calc(100dvh-3.875rem)] lg:overflow-hidden"
      rightRail={
        <CommunityDetailSidebar
          user={initial.shellUser}
          communityId={initial.isMember ? initial.community.id : undefined}
          canCreateInCommunity={initial.isMember}
          memberships={initial.memberships}
          upcomingEvents={[]}
        />
      }
    >
      <CommunityChannelContent
        community={initial.community}
        channel={initial.channel}
        posts={initial.posts}
        isMember={initial.isMember}
      />
    </PageContainer>
    </div>
  );
}
