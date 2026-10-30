"use client";

import { CommunityChannelContent } from "@/components/communities/CommunityChannelContent";
import { CommunityDetailDemoSidebar } from "@/components/communities/CommunityDetailDemoSidebar";
import { PageContainer } from "@/components/layout/PageContainer";
import { DEV_CHANNELS, DEV_COMMUNITIES } from "@/lib/fixtures/dev-shell-data";

type Props = {
  communitySlug: string;
  channelSlug: string;
};

export function CommunityChannelDemoScreen({ communitySlug, channelSlug }: Props) {
  const demo = DEV_COMMUNITIES.find((c) => c.slug === communitySlug);
  const channel = DEV_CHANNELS.find((c) => c.slug === channelSlug);
  if (!demo || !channel) {
    return null;
  }

  const community = {
    id: demo.id,
    name: demo.name,
    slug: demo.slug,
    description: null,
    institution: null,
    location: null,
    logoUrl: demo.logoUrl,
    coverImageUrl: null,
    visibility: "public" as const,
    joinApprovalRequired: false,
    memberCount: 0,
    membershipRole: "member" as const,
    membershipStatus: "active" as const,
    createdBy: null,
  };

  return (
    <PageContainer withRightRail rightRail={<CommunityDetailDemoSidebar />}>
      <CommunityChannelContent
        community={community}
        channel={{
          id: channel.id,
          slug: channel.slug,
          name: channel.name,
          description: null,
          communityId: demo.id,
        }}
        posts={[]}
        isMember
      />
    </PageContainer>
  );
}
