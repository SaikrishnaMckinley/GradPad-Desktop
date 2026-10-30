import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DonationAdminFunds } from "@/components/donations/DonationAdminFunds";
import { DonationSettingsToggle } from "@/components/donations/DonationSettingsToggle";
import { PageContainer } from "@/components/layout/PageContainer";
import { buttonVariants } from "@/components/ui/button";
import { fetchCommunityDonationFundsManageRaw, fetchCommunityDonationSettingsRaw } from "@/lib/api/community-donations";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { canManageCommunity } from "@/lib/communities/permissions";
import { getCommunityBySlug } from "@/lib/communities/queries";
import { loadDonationPayoutReady } from "@/lib/donations/actions";
import {
  normalizeCommunityDonationSettings,
  normalizeDonationFundsManageResponse,
} from "@/lib/donations/community-donations";
import { cn } from "@/lib/utils/cn";

export const instant = false;

type Props = { params: Promise<{ slug: string }> };

export default async function ManageDonationsPage({ params }: Props) {
  const { slug } = await params;
  const session = await getSessionProfile();
  if (!session) redirect("/login");

  const community = await getCommunityBySlug(slug, session.id);
  if (!community) notFound();
  if (!canManageCommunity(community.membershipRole)) {
    redirect(`/communities/${slug}`);
  }

  const [manageRes, settingsRes, payout] = await Promise.all([
    fetchCommunityDonationFundsManageRaw(community.id),
    fetchCommunityDonationSettingsRaw(community.id),
    loadDonationPayoutReady(community.id),
  ]);

  const manage = manageRes.ok
    ? normalizeDonationFundsManageResponse(manageRes.data)
    : normalizeDonationFundsManageResponse([]);
  const settings = settingsRes.ok
    ? normalizeCommunityDonationSettings(settingsRes.data)
    : null;

  return (
    <PageContainer className="max-w-3xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Donation funds</h1>
          <p className="mt-1 text-sm text-muted-foreground">{community.name}</p>
        </div>
        <Link
          href={`/communities/${slug}/admin`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Back to admin
        </Link>
      </div>

      <DonationSettingsToggle slug={slug} settings={settings} />

      <DonationAdminFunds
        slug={slug}
        communityId={community.id}
        funds={manage.funds}
        payoutReady={payout.ready}
        totalRaised={manage.summary.total_raised}
      />
    </PageContainer>
  );
}
