import "server-only";

import { serverFetchJson, serverFetchPost } from "@/lib/api/server-fetch";
import type { CommunityDonationQuoteResponse } from "@/lib/donations/community-donations";

export async function fetchCommunityDonationSettingsRaw(communityId: string) {
  return serverFetchJson<unknown>(`community/${communityId}/donations/settings/`);
}

export async function fetchCommunityDonationFundsRaw(communityId: string) {
  return serverFetchJson<unknown>(`community/${communityId}/donations/funds/`);
}

export async function fetchCommunityDonationStatsRaw(communityId: string, fundId?: string) {
  const path = fundId
    ? `community/${communityId}/donations/stats/?fund_id=${encodeURIComponent(fundId)}`
    : `community/${communityId}/donations/stats/`;
  return serverFetchJson<unknown>(path);
}

export async function fetchCommunityDonationFundsManageRaw(communityId: string) {
  return serverFetchJson<unknown>(`community/${communityId}/donations/funds/manage/`);
}

export async function createCommunityDonationFundRaw(
  communityId: string,
  fund: Record<string, unknown>,
) {
  return serverFetchPost<unknown>(`community/${communityId}/donations/funds/manage/`, fund);
}

export async function updateCommunityDonationSettingsRaw(
  communityId: string,
  settings: Record<string, unknown>,
) {
  return serverFetchJson<unknown>(`community/${communityId}/donations/settings/`, {
    method: "PUT",
    body: JSON.stringify(settings),
  });
}

export async function fetchCommunityDonationQuoteRaw(
  communityId: string,
  body: { amount: number; cover_fees: boolean },
) {
  return serverFetchPost<CommunityDonationQuoteResponse>(
    `community/${communityId}/donations/quote/`,
    body,
  );
}

export async function createCommunityDonationRaw(payload: {
  community_id: string;
  fund_id: string;
  amount: number;
  is_recurring: boolean;
  frequency: string;
  cover_fees: boolean;
  is_anonymous: boolean;
  donor_message?: string;
}) {
  return serverFetchPost<{ checkout_url?: string }>(`community/donations/create/`, payload);
}

export async function verifyDonationSessionRaw(sessionId: string) {
  return serverFetchJson<unknown>(
    `community/donations/verify-session/?session_id=${encodeURIComponent(sessionId)}`,
  );
}
