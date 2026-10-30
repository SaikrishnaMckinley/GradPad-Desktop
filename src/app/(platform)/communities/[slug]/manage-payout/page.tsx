import { notFound, redirect } from "next/navigation";
import { CommunityManagePayoutClient } from "@/components/communities/CommunityManagePayoutClient";
import { PageContainer } from "@/components/layout/PageContainer";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { canManageCommunity } from "@/lib/communities/permissions";
import { getCommunityBySlug } from "@/lib/communities/queries";
import { eventCreateReturnPath } from "@/lib/events/site-url";
import { isDemoStaticUi } from "@/lib/demo-mode";

export const instant = false;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return { title: `Bank account · ${slug}` };
}

export default async function CommunityManagePayoutPage({ params }: Props) {
  if (isDemoStaticUi()) redirect("/communities");

  const { slug } = await params;
  const session = await getSessionProfile();
  if (!session) redirect("/login");

  const community = await getCommunityBySlug(slug, session.id);
  if (!community) notFound();
  if (!canManageCommunity(community.membershipRole)) {
    redirect(`/communities/${slug}`);
  }

  const defaultReturn = eventCreateReturnPath(community.id, "success");

  return (
    <PageContainer>
      <CommunityManagePayoutClient
        communityId={community.id}
        slug={community.slug}
        communityName={community.name}
        defaultReturnPath={defaultReturn}
      />
    </PageContainer>
  );
}
