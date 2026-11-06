import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { CommunityMembersDirectorySkeleton } from "@/components/communities/CommunityMembersDirectorySkeleton";
import { CommunityMembersDirectoryView } from "@/components/communities/CommunityMembersDirectoryView";
import { CommunityMembersPageFrame } from "@/components/communities/CommunityMembersPageFrame";
import { loadCommunityHub } from "@/lib/communities/load-community-hub";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import {
  getCommunityByRouteKeyCached,
  resolveCommunityId,
} from "@/lib/communities/api-queries";
import { loadCommunityMembersDirectory } from "@/lib/communities/load-community-members-directory";
import { isActiveMember } from "@/lib/communities/permissions";

export const instant = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return { title: `Members · ${slug}` };
}

async function MembersDirectoryContent({ slug }: { slug: string }) {
  const session = await getSessionProfile();
  if (!session) {
    redirect("/login");
  }

  const communityId = await resolveCommunityId(slug);
  if (!communityId) {
    notFound();
  }

  const [community, { members, total }, hub] = await Promise.all([
    getCommunityByRouteKeyCached(slug),
    loadCommunityMembersDirectory(communityId, slug),
    loadCommunityHub(slug),
  ]);

  if (!community || !isActiveMember(community.membershipStatus)) {
    notFound();
  }

  return (
    <CommunityMembersPageFrame slug={community.slug} hub={hub}>
      <CommunityMembersDirectoryView
        slug={community.slug}
        communityName={community.name}
        members={members}
        total={total}
      />
    </CommunityMembersPageFrame>
  );
}

export default async function CommunityMembersPage({ params }: Props) {
  const { slug } = await params;

  return (
    <Suspense
      fallback={
        <CommunityMembersPageFrame slug={slug}>
          <CommunityMembersDirectorySkeleton />
        </CommunityMembersPageFrame>
      }
    >
      <MembersDirectoryContent slug={slug} />
    </Suspense>
  );
}
