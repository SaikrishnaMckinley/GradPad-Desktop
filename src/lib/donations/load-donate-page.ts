import "server-only";

import {
  fetchCommunityDonationFundsRaw,
  fetchCommunityDonationSettingsRaw,
  fetchCommunityDonationStatsRaw,
} from "@/lib/api/community-donations";
import {
  areCommunityDonationsAvailable,
  getActiveCommunityDonationFunds,
  normalizeCommunityDonationFunds,
  normalizeCommunityDonationSettings,
  normalizeDonationStats,
  type CommunityDonationFund,
  type CommunityDonationSettings,
  type DonationStats,
} from "@/lib/donations/community-donations";

export type DonateIndexPayload = {
  settings: CommunityDonationSettings | null;
  funds: CommunityDonationFund[];
  available: boolean;
};

export async function loadDonateIndex(communityId: string): Promise<DonateIndexPayload> {
  const [settingsRes, fundsRes] = await Promise.all([
    fetchCommunityDonationSettingsRaw(communityId),
    fetchCommunityDonationFundsRaw(communityId),
  ]);

  const settings = settingsRes.ok
    ? normalizeCommunityDonationSettings(settingsRes.data)
    : null;
  const funds = getActiveCommunityDonationFunds(
    fundsRes.ok ? normalizeCommunityDonationFunds(fundsRes.data) : [],
  );

  return {
    settings,
    funds,
    available: areCommunityDonationsAvailable(settings, funds),
  };
}

export type DonateFundPayload = {
  settings: CommunityDonationSettings | null;
  fund: CommunityDonationFund | null;
  stats: DonationStats | null;
  available: boolean;
};

export async function loadDonateFundPage(
  communityId: string,
  fundId: string,
): Promise<DonateFundPayload> {
  const [settingsRes, fundsRes, statsRes] = await Promise.all([
    fetchCommunityDonationSettingsRaw(communityId),
    fetchCommunityDonationFundsRaw(communityId),
    fetchCommunityDonationStatsRaw(communityId, fundId),
  ]);

  const settings = settingsRes.ok
    ? normalizeCommunityDonationSettings(settingsRes.data)
    : null;
  const funds = getActiveCommunityDonationFunds(
    fundsRes.ok ? normalizeCommunityDonationFunds(fundsRes.data) : [],
  );
  const fund = funds.find((f) => f.id === fundId) ?? null;
  const stats = statsRes.ok ? normalizeDonationStats(statsRes.data) : null;

  return {
    settings,
    fund,
    stats,
    available: Boolean(fund) && areCommunityDonationsAvailable(settings, fund ? [fund] : []),
  };
}
