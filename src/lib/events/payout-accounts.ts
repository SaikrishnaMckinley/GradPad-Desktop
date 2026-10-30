import type {
  AvailablePayoutAccount,
  CommunityPayoutStatus,
  CommunityPayoutUiState,
  PayoutAccountsLoadResult,
} from "@/types/payment";

export function isPayoutAccountReady(account: AvailablePayoutAccount): boolean {
  if (account.is_fully_setup) return true;
  return account.payouts_enabled === true && account.details_submitted === true;
}

export function normalizeAvailablePayoutAccountsResponse(
  data: Record<string, unknown>,
): AvailablePayoutAccount[] {
  const raw = data.available_accounts;
  if (!Array.isArray(raw)) return [];
  return raw.map((row) => {
    const account = row as Record<string, unknown>;
    return {
      type: account.type as AvailablePayoutAccount["type"],
      id: String(account.id),
      name: typeof account.name === "string" ? account.name : undefined,
      display_name: typeof account.display_name === "string" ? account.display_name : undefined,
      stripe_account_id:
        typeof account.stripe_account_id === "string" ? account.stripe_account_id : undefined,
      is_fully_setup: account.is_fully_setup === true,
      payouts_enabled: account.payouts_enabled === true,
      details_submitted: account.details_submitted === true,
      payment_owner: account.payment_owner as AvailablePayoutAccount["payment_owner"],
      user: account.user as AvailablePayoutAccount["user"],
    };
  });
}

export function parseCommunityPayoutStatus(data: Record<string, unknown>): CommunityPayoutStatus {
  return {
    exists: data.exists === true,
    stripe_account_id:
      typeof data.stripe_account_id === "string" ? data.stripe_account_id : undefined,
    onboarding_completed: data.onboarding_completed === true,
    payouts_enabled: data.payouts_enabled === true,
    details_submitted: data.details_submitted === true,
    charges_enabled: data.charges_enabled === true,
    is_fully_setup: data.is_fully_setup === true,
    is_payment_owner: data.is_payment_owner === true,
    allow_personal_payout_accounts: data.allow_personal_payout_accounts === true,
    message: typeof data.message === "string" ? data.message : undefined,
  };
}

/** Same branching as gradpad-web manage-payout (connect vs refresh onboarding). */
export function communityPayoutUiState(status: CommunityPayoutStatus | null): CommunityPayoutUiState {
  if (!status) return "no-account";
  const stripeId = status.stripe_account_id?.trim();
  if (!stripeId) return "no-account";
  const complete =
    status.onboarding_completed === true ||
    (status.payouts_enabled === true && status.details_submitted === true) ||
    status.is_fully_setup === true;
  return complete ? "active" : "incomplete";
}

export function shouldRefreshStripeOnboarding(status: CommunityPayoutStatus | null): boolean {
  return communityPayoutUiState(status) !== "no-account";
}

export function buildPayoutLoadResult(data: Record<string, unknown>): PayoutAccountsLoadResult {
  const accounts = normalizeAvailablePayoutAccountsResponse(data);
  return {
    accounts,
    apiError: null,
    hasCommunityAccount:
      data.has_community_account === true ||
      accounts.some((account) => account.type === "community"),
    allowPersonalPayoutAccounts: data.allow_personal_payout_accounts === true,
    isPaymentOwner:
      data.is_payment_owner === true || data.is_payment_owner === "true",
  };
}
