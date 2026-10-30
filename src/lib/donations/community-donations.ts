/** Types + normalizers mirrored from gradpad-web `lib/donations.ts`. */

export type DonationFrequency = "one_time" | "monthly" | "quarterly" | "yearly";

export type FundColor = "blue" | "green" | "purple" | "red" | "orange" | "teal";
export type FundIcon = "trophy" | "book" | "lightning" | "globe" | "heart" | "general";

export type CommunityDonationSettings = {
  id?: string;
  community?: string;
  enabled: boolean;
  allow_custom_amount?: boolean;
  suggested_amounts?: number[];
  default_amount?: number | null;
  min_amount?: number;
  max_amount?: number;
  title?: string;
  description?: string;
  allow_fee_coverage?: boolean;
  goal_amount?: number | null;
  show_goal_progress?: boolean;
  show_recent_donors?: boolean;
  allow_anonymous?: boolean;
  allow_donor_message?: boolean;
};

export type PayoutAccountDisplay = {
  id: string;
  label: string;
  last4?: string | null;
};

export type CommunityDonationFund = {
  id: string;
  community?: string;
  name: string;
  description?: string | null;
  goal_amount?: number | null;
  color?: FundColor;
  icon?: FundIcon;
  payout_account?: string | null;
  payout_account_display?: PayoutAccountDisplay | null;
  suggested_amounts?: number[];
  allow_custom_amount?: boolean;
  min_amount?: number;
  max_amount?: number | null;
  show_goal_progress?: boolean;
  allow_anonymous?: boolean;
  allow_donor_message?: boolean;
  allow_recurring?: boolean;
  recurring_frequencies?: DonationFrequency[];
  is_active?: boolean;
  is_default?: boolean;
  sort_order?: number;
  total_raised?: number;
  donor_count?: number;
  progress_percent?: number | null;
};

export type DonationStats = {
  total_raised: number;
  donor_count: number;
  goal_amount?: number | null;
  progress_percent?: number | null;
};

export type DonationFundsSummary = {
  total_raised: number;
  total_donors: number;
  active_funds: number;
};

export type DonationFundsManageResponse = {
  summary: DonationFundsSummary;
  funds: CommunityDonationFund[];
  available_payout_accounts: PayoutAccountDisplay[];
};

export type CommunityDonationQuoteResponse = {
  donation_amount: number;
  processing_fee: number;
  processing_fee_addon: number;
  total_charge: number;
  community_receives: number;
  cover_fees: boolean;
};

export const DEFAULT_COMMUNITY_DONATION_AMOUNTS = [10, 25, 50, 100, 150];
export const DEFAULT_RECURRING_FREQUENCIES: DonationFrequency[] = [
  "monthly",
  "quarterly",
  "yearly",
];

export function toDonationNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const num = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(num) ? num : undefined;
}

export function formatDonationAmount(value: unknown, decimals = 0): string {
  const num = toDonationNumber(value);
  if (num === undefined) return "0";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function isDonationFundActive(fund: Pick<CommunityDonationFund, "is_active">): boolean {
  return fund.is_active !== false;
}

export function normalizeCommunityDonationSettings(data: unknown): CommunityDonationSettings {
  const record = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  return {
    ...(record as CommunityDonationSettings),
    enabled: Boolean(record.enabled),
    suggested_amounts: Array.isArray(record.suggested_amounts)
      ? record.suggested_amounts
          .map((amount) => toDonationNumber(amount) ?? 0)
          .filter((amount) => amount > 0)
      : [],
    default_amount: toDonationNumber(record.default_amount) ?? null,
    min_amount: toDonationNumber(record.min_amount) ?? 1,
    max_amount: toDonationNumber(record.max_amount),
    goal_amount: toDonationNumber(record.goal_amount) ?? null,
  };
}

export function normalizeCommunityDonationFund(data: unknown): CommunityDonationFund {
  const record = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  return {
    ...(record as CommunityDonationFund),
    id: String(record.id ?? ""),
    name: String(record.name ?? "Fund"),
    is_active: record.is_active !== false,
    goal_amount: toDonationNumber(record.goal_amount) ?? null,
    min_amount: toDonationNumber(record.min_amount) ?? 1,
    max_amount: toDonationNumber(record.max_amount) ?? null,
    total_raised: toDonationNumber(record.total_raised) ?? 0,
    donor_count: Number(record.donor_count) || 0,
    progress_percent: toDonationNumber(record.progress_percent) ?? null,
    suggested_amounts: Array.isArray(record.suggested_amounts)
      ? record.suggested_amounts
          .map((amount) => toDonationNumber(amount) ?? 0)
          .filter((amount) => amount > 0)
      : [],
    recurring_frequencies: Array.isArray(record.recurring_frequencies)
      ? (record.recurring_frequencies as DonationFrequency[]).filter((v) =>
          ["monthly", "quarterly", "yearly"].includes(v),
        )
      : DEFAULT_RECURRING_FREQUENCIES,
  };
}

export function normalizeCommunityDonationFunds(data: unknown): CommunityDonationFund[] {
  if (!Array.isArray(data)) return [];
  return data.map(normalizeCommunityDonationFund).filter((f) => f.id);
}

export function normalizeDonationStats(data: unknown): DonationStats {
  const record = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  return {
    total_raised: toDonationNumber(record.total_raised) ?? 0,
    donor_count: Number(record.donor_count) || 0,
    goal_amount: toDonationNumber(record.goal_amount) ?? null,
    progress_percent: toDonationNumber(record.progress_percent) ?? null,
  };
}

export function normalizeDonationFundsManageResponse(data: unknown): DonationFundsManageResponse {
  if (Array.isArray(data)) {
    const funds = normalizeCommunityDonationFunds(data);
    return {
      summary: {
        total_raised: funds.reduce((sum, f) => sum + (f.total_raised ?? 0), 0),
        total_donors: funds.reduce((sum, f) => sum + (f.donor_count ?? 0), 0),
        active_funds: funds.filter((f) => f.is_active !== false).length,
      },
      funds,
      available_payout_accounts: [],
    };
  }

  const record = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const summary =
    record.summary && typeof record.summary === "object"
      ? (record.summary as Record<string, unknown>)
      : {};

  return {
    summary: {
      total_raised: toDonationNumber(summary.total_raised) ?? 0,
      total_donors: Number(summary.total_donors) || 0,
      active_funds: Number(summary.active_funds) || 0,
    },
    funds: normalizeCommunityDonationFunds(record.funds),
    available_payout_accounts: Array.isArray(record.available_payout_accounts)
      ? (record.available_payout_accounts as PayoutAccountDisplay[])
      : [],
  };
}

export function normalizeDonationQuote(data: unknown): CommunityDonationQuoteResponse | null {
  if (!data || typeof data !== "object") return null;
  const r = data as Record<string, unknown>;
  const donation_amount = toDonationNumber(r.donation_amount);
  if (donation_amount === undefined) return null;
  return {
    donation_amount,
    processing_fee: toDonationNumber(r.processing_fee) ?? 0,
    processing_fee_addon: toDonationNumber(r.processing_fee_addon) ?? 0,
    total_charge: toDonationNumber(r.total_charge) ?? donation_amount,
    community_receives: toDonationNumber(r.community_receives) ?? donation_amount,
    cover_fees: Boolean(r.cover_fees),
  };
}

export function areCommunityDonationsAvailable(
  settings: CommunityDonationSettings | null | undefined,
  funds: CommunityDonationFund[],
): boolean {
  const active = getActiveCommunityDonationFunds(funds);
  if (active.length === 0) return false;
  if (settings?.enabled === false) return active.length > 0;
  return settings?.enabled === true || active.length > 0;
}

export function getActiveCommunityDonationFunds(
  funds: CommunityDonationFund[],
): CommunityDonationFund[] {
  return funds.filter((fund) => isDonationFundActive(fund));
}

export function resolveDonationSuggestedAmounts(
  fund?: CommunityDonationFund | null,
  settings?: CommunityDonationSettings | null,
): number[] {
  const fundAmounts = (fund?.suggested_amounts ?? []).filter((a) => a > 0);
  if (fundAmounts.length > 0) return fundAmounts;
  const settingsAmounts = (settings?.suggested_amounts ?? []).filter((a) => a > 0);
  if (settingsAmounts.length > 0) return settingsAmounts;
  return DEFAULT_COMMUNITY_DONATION_AMOUNTS;
}

export function resolveDonationMinAmount(
  fund?: CommunityDonationFund | null,
  settings?: CommunityDonationSettings | null,
): number {
  return fund?.min_amount ?? settings?.min_amount ?? 5;
}

export function resolveDonationMaxAmount(
  fund?: CommunityDonationFund | null,
  settings?: CommunityDonationSettings | null,
): number | undefined {
  const fundMax = fund?.max_amount;
  if (fundMax != null && fundMax > 0) return fundMax;
  return settings?.max_amount;
}

export function resolveAllowCustomDonationAmount(
  fund?: CommunityDonationFund | null,
  settings?: CommunityDonationSettings | null,
): boolean {
  if (typeof fund?.allow_custom_amount === "boolean") return fund.allow_custom_amount;
  return settings?.allow_custom_amount !== false;
}
