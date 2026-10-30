import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DonationFundCreateForm } from "@/components/donations/DonationFundCreateForm";
import { PageContainer } from "@/components/layout/PageContainer";
import { buttonVariants } from "@/components/ui/button";
import { fetchCommunityDonationFundsManageRaw } from "@/lib/api/community-donations";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { canManageCommunity } from "@/lib/communities/permissions";
import { getCommunityBySlug } from "@/lib/communities/queries";
import { loadDonationPayoutReady } from "@/lib/donations/actions";
import { normalizeDonationFundsManageResponse } from "@/lib/donations/community-donations";
import { cn } from "@/lib/utils/cn";

export const instant = false;

type Props = { params: Promise<{ slug: string }> };

export default async function NewDonationFundPage({ params }: Props) {
  const { slug } = await params;
  const session = await getSessionProfile();
  if (!session) redirect("/login");

  const community = await getCommunityBySlug(slug, session.id);
  if (!community) notFound();
  if (!canManageCommunity(community.membershipRole)) {
    redirect(`/communities/${slug}`);
  }

  const payout = await loadDonationPayoutReady(community.id);
  if (!payout.ready) {
    redirect(`/communities/${slug}/admin/donations`);
  }

  const manageRes = await fetchCommunityDonationFundsManageRaw(community.id);
  const manage = manageRes.ok
    ? normalizeDonationFundsManageResponse(manageRes.data)
    : normalizeDonationFundsManageResponse([]);

  return (
    <PageContainer className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Create donation fund</h1>
        <Link
          href={`/communities/${slug}/admin/donations`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Cancel
        </Link>
      </div>
      <DonationFundCreateForm slug={slug} payoutAccounts={manage.available_payout_accounts} />
    </PageContainer>
  );
}
