import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import {
  fetchCommunityDonationFundsManageRaw,
  fetchCommunityDonationSettingsRaw,
} from "@/lib/api/community-donations";
import { fetchCommunityDetailRaw } from "@/lib/api/communities";
import { fetchAvailablePayoutAccountsRaw, fetchCommunityPayoutStatusRaw } from "@/lib/api/event-payments";
import { mergeAndEnrichCommunityMembers } from "@/lib/communities/enrich-member-roles";
import { loadDonationPayoutReady } from "@/lib/donations/actions";
import {
  normalizeCommunityDonationSettings,
  normalizeDonationFundsManageResponse,
} from "@/lib/donations/community-donations";
import {
  buildPayoutLoadResult,
  parseCommunityPayoutStatus,
} from "@/lib/events/payout-accounts";
import type { CommunityPayoutStatus } from "@/types/payment";
import {
  getCommunityBySlug,
  getCommunityMembers,
  getPendingMembers,
} from "@/lib/communities/queries";
import { communityAdminCacheTag } from "@/lib/communities/cache-tags";
import { canManageCommunity } from "@/lib/communities/permissions";
import type {
  CommunityJoinRequestRow,
  CommunityMemberRow,
  MembershipRole,
} from "@/types/community";
import type { CommunityDonationFund, CommunityDonationSettings } from "@/lib/donations/community-donations";

export type CommunityAdminDashboardData = {
  communityId: string;
  slug: string;
  communityName: string;
  actorRole: MembershipRole;
  pending: CommunityJoinRequestRow[];
  members: CommunityMemberRow[];
  donationSettings: CommunityDonationSettings | null;
  donationFunds: CommunityDonationFund[];
  donationTotalRaised: number;
  payoutReady: boolean;
  payoutStatus: CommunityPayoutStatus | null;
  payoutAccountLabel: string | null;
  isPaymentOwner: boolean;
};

function payoutAccountLabel(
  status: CommunityPayoutStatus | null,
  accounts: ReturnType<typeof buildPayoutLoadResult>,
): string | null {
  const community = accounts.accounts.find((a) => a.type === "community");
  const name = community?.display_name?.trim() || community?.name?.trim();
  if (name) return name;
  const stripeId = status?.stripe_account_id?.trim();
  if (stripeId) {
    const tail = stripeId.length > 8 ? stripeId.slice(-4) : stripeId;
    return `Stripe account ····${tail}`;
  }
  return null;
}

async function loadCommunityAdminPayload(
  communityId: string,
  slug: string,
  communityName: string,
  actorRole: MembershipRole,
): Promise<Omit<CommunityAdminDashboardData, "communityId" | "slug" | "communityName" | "actorRole">> {
  "use cache: private";
  cacheLife("minutes");
  cacheTag(communityAdminCacheTag(slug));

  const [
    { members: rawMembers },
    pending,
    detailRes,
    manageRes,
    settingsRes,
    payout,
    statusRes,
    accountsRes,
  ] = await Promise.all([
    getCommunityMembers(communityId, 1, 200),
    getPendingMembers(communityId),
    fetchCommunityDetailRaw(communityId),
    fetchCommunityDonationFundsManageRaw(communityId),
    fetchCommunityDonationSettingsRaw(communityId),
    loadDonationPayoutReady(communityId),
    fetchCommunityPayoutStatusRaw(communityId),
    fetchAvailablePayoutAccountsRaw(communityId),
  ]);

  const manage = manageRes.ok
    ? normalizeDonationFundsManageResponse(manageRes.data)
    : normalizeDonationFundsManageResponse([]);
  const settings = settingsRes.ok
    ? normalizeCommunityDonationSettings(settingsRes.data)
    : null;

  const payoutStatus =
    statusRes.ok && statusRes.data && typeof statusRes.data === "object"
      ? parseCommunityPayoutStatus(statusRes.data as Record<string, unknown>)
      : null;
  const accounts =
    accountsRes.ok && accountsRes.data && typeof accountsRes.data === "object"
      ? buildPayoutLoadResult(accountsRes.data as Record<string, unknown>)
      : buildPayoutLoadResult({});

  const detail =
    detailRes.ok && detailRes.data && typeof detailRes.data === "object"
      ? (detailRes.data as Record<string, unknown>)
      : null;
  const members = mergeAndEnrichCommunityMembers(rawMembers, detail);

  return {
    pending,
    members,
    donationSettings: settings,
    donationFunds: manage.funds,
    donationTotalRaised: manage.summary.total_raised,
    payoutReady: payout.ready,
    payoutStatus,
    payoutAccountLabel: payoutAccountLabel(payoutStatus, accounts),
    isPaymentOwner: accounts.isPaymentOwner,
  };
}

export async function loadCommunityAdminDashboard(
  slug: string,
  userId: string,
): Promise<CommunityAdminDashboardData | null> {
  const community = await getCommunityBySlug(slug, userId);
  if (!community || !canManageCommunity(community.membershipRole) || !community.membershipRole) {
    return null;
  }

  const payload = await loadCommunityAdminPayload(
    community.id,
    community.slug,
    community.name,
    community.membershipRole,
  );

  return {
    communityId: community.id,
    slug: community.slug,
    communityName: community.name,
    actorRole: community.membershipRole,
    ...payload,
  };
}
