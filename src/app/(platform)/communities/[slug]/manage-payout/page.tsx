import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { canManageCommunity } from "@/lib/communities/permissions";
import { getCommunityBySlug } from "@/lib/communities/queries";
import { isDemoStaticUi } from "@/lib/demo-mode";

type Props = { params: Promise<{ slug: string }> };

export default async function CommunityManagePayoutPage({ params }: Props) {
  if (isDemoStaticUi()) redirect("/communities");

  const { slug } = await params;
  const session = await getSessionProfile();
  if (!session) redirect("/login");

  const community = await getCommunityBySlug(slug, session.id);
  if (!community || !canManageCommunity(community.membershipRole)) {
    redirect(`/communities/${slug}`);
  }

  redirect(`/communities/${slug}/admin?tab=bank`);
}
