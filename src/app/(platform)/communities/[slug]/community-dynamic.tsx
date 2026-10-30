import { notFound } from "next/navigation";
import { CommunityDetailContent } from "@/components/communities/CommunityDetailContent";
import { CommunityDetailSidebar } from "@/components/communities/CommunityDetailSidebar";
import { PageContainer } from "@/components/layout/PageContainer";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { resolveShellUser } from "@/lib/auth/resolve-shell-user";
import { canManageCommunity, isActiveMember } from "@/lib/communities/permissions";
import {
  getCommunityBySlug,
  getCommunityChannels,
  getCommunityEventsPreview,
  getCommunityMembers,
  getCommunityPostsPreview,
  listDiscoverableCommunities,
} from "@/lib/communities/queries";

type Props = { params: Promise<{ slug: string }> };

export default async function DynamicCommunityPage({ params }: Props) {
  const { slug } = await params;
  const session = await getSessionProfile();
  const community = await getCommunityBySlug(slug, session?.id ?? null);

  if (!community) {
    notFound();
  }

  const member = isActiveMember(community.membershipStatus);
  const canManage = canManageCommunity(community.membershipRole);

  const [channels, events, posts, membersPage, memberships] = await Promise.all([
    member || community.visibility === "public" ? getCommunityChannels(community.id) : [],
    member ? getCommunityEventsPreview(community.id) : [],
    member ? getCommunityPostsPreview(community.id) : [],
    getCommunityMembers(community.id, 1, 5),
    listDiscoverableCommunities(session?.id ?? null),
  ]);

  const shellUser = resolveShellUser(session, true);

  return (
    <PageContainer
      withRightRail
      rightRail={
        <CommunityDetailSidebar
          user={shellUser}
          memberships={memberships}
          upcomingEvents={events}
        />
      }
    >
      <CommunityDetailContent
        community={community}
        channels={channels}
        events={events}
        posts={posts}
        membersPreview={membersPage.members.map((m) => ({
          fullName: m.fullName,
          avatarUrl: m.avatarUrl,
        }))}
        canManage={canManage}
        isMember={member}
      />
    </PageContainer>
  );
}
