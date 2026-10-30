"use server";

import { revalidatePath } from "next/cache";
import {
  createCommunityDonationFundRaw,
  createCommunityDonationRaw,
  fetchCommunityDonationQuoteRaw,
  updateCommunityDonationSettingsRaw,
} from "@/lib/api/community-donations";
import { fetchCommunityPayoutStatusRaw } from "@/lib/api/event-payments";
import { readStagingActionError } from "@/lib/api/server-fetch";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { resolveCommunityId } from "@/lib/communities/api-queries";
import { canManageCommunity } from "@/lib/communities/permissions";
import { getCommunityBySlug } from "@/lib/communities/queries";
import { normalizeDonationQuote } from "@/lib/donations/community-donations";

export type DonationActionResult = {
  error?: string;
  success?: string;
  checkoutUrl?: string;
};

async function requireCommunityManager(routeKey: string) {
  const session = await getSessionProfile();
  if (!session) return { error: "Sign in to continue." as const };
  const community = await getCommunityBySlug(routeKey, session.id);
  if (!community) return { error: "Community not found." as const };
  if (!canManageCommunity(community.membershipRole)) {
    return { error: "Only community admins can manage donations." as const };
  }
  return { community, session };
}

export async function loadDonationPayoutReady(communityId: string): Promise<{
  ready: boolean;
  needsAccount: boolean;
  needsCompletion: boolean;
}> {
  const result = await fetchCommunityPayoutStatusRaw(communityId);
  if (!result.ok || !result.data) {
    return { ready: false, needsAccount: true, needsCompletion: false };
  }
  const data = result.data as Record<string, unknown>;
  const connected = Boolean(data.connected ?? data.is_connected ?? data.payouts_enabled);
  const complete = Boolean(data.details_submitted ?? data.onboarding_complete ?? connected);
  if (!connected) return { ready: false, needsAccount: true, needsCompletion: false };
  if (!complete) return { ready: false, needsAccount: false, needsCompletion: true };
  return { ready: true, needsAccount: false, needsCompletion: false };
}

export async function createDonationFundAction(
  routeKey: string,
  formData: FormData,
): Promise<DonationActionResult> {
  const gate = await requireCommunityManager(routeKey);
  if ("error" in gate) return gate;

  const payout = await loadDonationPayoutReady(gate.community.id);
  if (!payout.ready) {
    return {
      error: payout.needsAccount
        ? "Connect a bank account before creating donation funds."
        : "Finish bank account setup before creating donation funds.",
    };
  }

  const name = String(formData.get("name") ?? "").trim();
  const payoutAccount = String(formData.get("payout_account") ?? "").trim();
  if (!name) return { error: "Fund name is required." };
  if (!payoutAccount) return { error: "Select a payout bank account for this fund." };

  const goalRaw = String(formData.get("goal_amount") ?? "").trim();
  const goal = goalRaw ? Number(goalRaw) : null;

  const result = await createCommunityDonationFundRaw(gate.community.id, {
    name,
    description: String(formData.get("description") ?? "").trim() || null,
    color: String(formData.get("color") ?? "blue"),
    icon: String(formData.get("icon") ?? "general"),
    payout_account: payoutAccount,
    goal_amount: goal && Number.isFinite(goal) ? goal : null,
    show_goal_progress: formData.get("show_goal_progress") === "on",
    allow_custom_amount: formData.get("allow_custom_amount") !== "off",
    allow_anonymous: formData.get("allow_anonymous") !== "off",
    allow_donor_message: formData.get("allow_donor_message") !== "off",
    allow_recurring: formData.get("allow_recurring") === "on",
    is_active: true,
    suggested_amounts: [10, 25, 50, 100, 150],
    min_amount: 5,
  });

  if (!result.ok) {
    return { error: readStagingActionError(result) ?? "Could not create fund." };
  }

  revalidatePath(`/communities/${gate.community.slug}/admin/donations`);
  revalidatePath(`/communities/${gate.community.slug}/donate`);
  return { success: "Donation fund created." };
}

export async function updateDonationSettingsAction(
  routeKey: string,
  formData: FormData,
): Promise<DonationActionResult> {
  const gate = await requireCommunityManager(routeKey);
  if ("error" in gate) return gate;

  const enabled = formData.get("enabled") === "on";
  const description = String(formData.get("description") ?? "").trim();
  const allowFeeCoverage = formData.get("allow_fee_coverage") !== "off";

  const result = await updateCommunityDonationSettingsRaw(gate.community.id, {
    enabled,
    description: description || null,
    allow_fee_coverage: allowFeeCoverage,
    allow_custom_amount: true,
    allow_anonymous: true,
    allow_donor_message: true,
    show_goal_progress: true,
    min_amount: 5,
  });

  if (!result.ok) {
    return { error: readStagingActionError(result) ?? "Could not save settings." };
  }

  revalidatePath(`/communities/${gate.community.slug}/donate`);
  return { success: "Donation settings saved." };
}

export async function getDonationQuoteAction(
  routeKey: string,
  amount: number,
  coverFees: boolean,
) {
  const communityId = await resolveCommunityId(routeKey);
  if (!communityId) return { error: "Community not found." };
  if (!Number.isFinite(amount) || amount <= 0) return { quote: null };

  const result = await fetchCommunityDonationQuoteRaw(communityId, {
    amount,
    cover_fees: coverFees,
  });
  if (!result.ok) {
    return { error: readStagingActionError(result) ?? "Could not calculate fees." };
  }
  return { quote: normalizeDonationQuote(result.data) };
}

export async function startCommunityDonationAction(
  routeKey: string,
  payload: {
    fundId: string;
    amount: number;
    coverFees: boolean;
    isAnonymous: boolean;
    isRecurring: boolean;
    frequency: string;
    message?: string;
  },
): Promise<DonationActionResult> {
  const session = await getSessionProfile();
  if (!session) return { error: "Sign in to donate." };

  const communityId = await resolveCommunityId(routeKey);
  if (!communityId) return { error: "Community not found." };

  const result = await createCommunityDonationRaw({
    community_id: communityId,
    fund_id: payload.fundId,
    amount: payload.amount,
    is_recurring: payload.isRecurring,
    frequency: payload.isRecurring ? payload.frequency : "one_time",
    cover_fees: payload.coverFees,
    is_anonymous: payload.isAnonymous,
    donor_message: payload.message?.trim() || undefined,
  });

  if (!result.ok) {
    return { error: readStagingActionError(result) ?? "Could not start checkout." };
  }

  const checkoutUrl =
    result.data && typeof result.data === "object"
      ? (result.data as { checkout_url?: string }).checkout_url
      : undefined;

  if (!checkoutUrl) {
    return { error: "Payment session was not returned. Try again." };
  }

  return { checkoutUrl };
}
