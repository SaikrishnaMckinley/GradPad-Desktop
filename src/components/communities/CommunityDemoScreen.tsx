import { CommunityDetailContent } from "@/components/communities/CommunityDetailContent";
import { CommunityDetailDemoSidebar } from "@/components/communities/CommunityDetailDemoSidebar";
import { PageContainer } from "@/components/layout/PageContainer";
import { DEV_ACTIVE_COMMUNITY, DEV_COMMUNITIES } from "@/lib/fixtures/dev-shell-data";
import type { CommunityDetail } from "@/types/community";

type Props = {
  slug?: string;
};

function demoCommunityDetail(slug: string): CommunityDetail {
  const c = DEV_COMMUNITIES.find((x) => x.slug === slug) ?? DEV_ACTIVE_COMMUNITY;
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description:
      "A welcoming space for alumni to reconnect, exchange ideas, discover opportunities, and take part in local events.",
    institution: null,
    location: "Westwood, CA",
    logoUrl: c.logoUrl,
    coverImageUrl: null,
    visibility: "public",
    joinApprovalRequired: false,
    memberCount: 12,
    membershipRole: "owner",
    membershipStatus: "active",
    createdBy: null,
  };
}

/** Static community hub (reference mockups). */
export function CommunityDemoScreen({ slug = DEV_ACTIVE_COMMUNITY.slug }: Props) {
  const community = demoCommunityDetail(slug);
  const demoEvents = [
    {
      id: "1",
      title: "Alumni Mixer",
      start_at: new Date(Date.now() + 86400000 * 3).toISOString(),
      location: "Campus",
    },
    {
      id: "2",
      title: "New Grad Networking Night",
      start_at: new Date(Date.now() + 86400000 * 6).toISOString(),
      location: "In person",
    },
  ];

  return (
    <PageContainer withRightRail rightRail={<CommunityDetailDemoSidebar />}>
      <CommunityDetailContent
        community={community}
        channels={[
          {
            id: "1",
            slug: "general",
            name: "General",
            description: "Join the latest conversations in the general channel",
          },
        ]}
        events={demoEvents}
        posts={[
          {
            id: "demo-post",
            title: "Innovate 2024: A University-wide Initiative",
            content:
              "Excited to share our latest alumni initiative — join us in the General channel for updates.",
            authorName: "Peter Jackson",
            createdAt: "2026-05-01T14:00:00",
          },
        ]}
        membersPreview={[
          { fullName: "PJ", avatarUrl: null },
          { fullName: "EW", avatarUrl: null },
          { fullName: "MC", avatarUrl: null },
        ]}
        canManage
        isMember
        useFixtureCover
      />
    </PageContainer>
  );
}
