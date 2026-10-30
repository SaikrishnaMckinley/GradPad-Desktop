export type PayoutAccountType = "community" | "user";

export type AvailablePayoutAccount = {
  type: PayoutAccountType;
  id: string;
  name?: string;
  display_name?: string;
  stripe_account_id?: string;
  is_fully_setup?: boolean;
  payouts_enabled?: boolean;
  details_submitted?: boolean;
  payment_owner?: { id?: string; name?: string };
  user?: { name?: string };
};

export type PayoutAccountsLoadResult = {
  accounts: AvailablePayoutAccount[];
  apiError: string | null;
  hasCommunityAccount: boolean;
  allowPersonalPayoutAccounts: boolean;
  isPaymentOwner: boolean;
};

/** Mirrors bookings account-status (gradpad-web manage-payout). */
export type CommunityPayoutStatus = {
  exists?: boolean;
  stripe_account_id?: string;
  onboarding_completed?: boolean;
  payouts_enabled?: boolean;
  details_submitted?: boolean;
  charges_enabled?: boolean;
  is_fully_setup?: boolean;
  is_payment_owner?: boolean;
  allow_personal_payout_accounts?: boolean;
  message?: string;
};

export type CommunityPayoutUiState = "loading" | "no-account" | "incomplete" | "active";
