/** Event checkout donations — mirrored from gradpad-web `lib/donations` + `lib/eventDonationFunds`. */

export type DonationSettings = {
  enabled: boolean;
  allow_donation_only?: boolean;
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
  allow_anonymous?: boolean;
  allow_donor_message?: boolean;
};

export type DonationSelection = {
  amount: number;
  isCustom: boolean;
  coverFees: boolean;
  isAnonymous: boolean;
  message: string;
  fundId?: string | null;
};

export type EventDonationFundOption = {
  id: string;
  name: string;
  description?: string;
  goal_amount?: number | null;
  suggested_amounts?: number[];
  allow_custom_amount?: boolean;
  min_amount?: number;
  max_amount?: number | null;
  total_raised?: number;
  progress_percent?: number | null;
  color?: "blue" | "green" | "purple" | "red" | "orange" | "teal";
  icon?: "trophy" | "book" | "lightning" | "globe" | "heart" | "general";
};

export type EventRegistrationDonationContext = {
  available: boolean;
  settings: DonationSettings | null;
  funds: EventDonationFundOption[];
  defaultFundId: string | null;
};

export const DEFAULT_SUGGESTED_AMOUNTS = [10, 25, 50, 100];

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function isDonationEnabled(
  settings?: DonationSettings | null,
): settings is DonationSettings {
  return Boolean(settings && settings.enabled);
}

export function normalizeEventDonationSettings(raw: unknown): DonationSettings | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  if (row.enabled !== true) return null;
  return {
    enabled: true,
    allow_donation_only: row.allow_donation_only === true,
    allow_custom_amount: row.allow_custom_amount !== false,
    suggested_amounts: Array.isArray(row.suggested_amounts)
      ? row.suggested_amounts.map((n) => Number(n)).filter((n) => Number.isFinite(n) && n > 0)
      : undefined,
    min_amount: typeof row.min_amount === "number" ? row.min_amount : undefined,
    max_amount: typeof row.max_amount === "number" ? row.max_amount : undefined,
    title: typeof row.title === "string" ? row.title : undefined,
    description: typeof row.description === "string" ? row.description : undefined,
    allow_fee_coverage: row.allow_fee_coverage !== false,
    goal_amount:
      typeof row.goal_amount === "number" || row.goal_amount === null
        ? (row.goal_amount as number | null)
        : undefined,
    show_goal_progress: row.show_goal_progress !== false,
    allow_anonymous: row.allow_anonymous !== false,
    allow_donor_message: row.allow_donor_message !== false,
  };
}

export function normalizeEventDonationFunds(raw: unknown): EventDonationFundOption[] {
  if (!Array.isArray(raw)) return [];
  const out: EventDonationFundOption[] = [];
  for (const item of raw) {
    const fund = item as Partial<EventDonationFundOption>;
    if (!fund?.id || !fund?.name) continue;
    out.push({
      id: String(fund.id),
      name: String(fund.name),
      description: fund.description ?? "",
      goal_amount: fund.goal_amount ?? null,
      suggested_amounts: Array.isArray(fund.suggested_amounts) ? fund.suggested_amounts : [],
      allow_custom_amount: fund.allow_custom_amount !== false,
      min_amount: fund.min_amount ?? 1,
      max_amount: fund.max_amount ?? null,
      total_raised: fund.total_raised,
      progress_percent: fund.progress_percent ?? null,
      color: fund.color,
      icon: fund.icon,
    });
  }
  return out;
}

export function resolveEventRegistrationDonation(
  donationSettings: DonationSettings | null,
  funds: EventDonationFundOption[],
): EventRegistrationDonationContext {
  const fundEnabled = funds.length > 0;
  const settingsEnabled = isDonationEnabled(donationSettings);
  const available = fundEnabled || settingsEnabled;
  const defaultFundId = funds[0]?.id ?? null;

  return {
    available,
    settings: settingsEnabled ? donationSettings : fundEnabled ? { enabled: true } : null,
    funds,
    defaultFundId,
  };
}

export function getSuggestedAmounts(settings?: DonationSettings | null): number[] {
  const amounts = settings?.suggested_amounts;
  if (Array.isArray(amounts) && amounts.length > 0) {
    return amounts.filter((a) => Number.isFinite(a) && a > 0);
  }
  return DEFAULT_SUGGESTED_AMOUNTS;
}

export function validateDonationAmount(
  amount: number,
  settings?: DonationSettings | null,
): string | null {
  if (amount <= 0) return null;
  const min = settings?.min_amount ?? 1;
  if (amount < min) return `Minimum donation is $${min.toFixed(2)}.`;
  const max = settings?.max_amount;
  if (max != null && max > 0 && amount > max) {
    return `Maximum donation is $${max.toFixed(2)}.`;
  }
  return null;
}

export function buildEventDonationPayload(donation: DonationSelection): Record<string, unknown> {
  if (!donation || donation.amount <= 0) return {};
  return {
    donation_amount: round2(donation.amount).toFixed(2),
    donation_cover_fees: donation.coverFees,
    donation_is_anonymous: donation.isAnonymous,
    donation_message: donation.message || "",
    ...(donation.fundId ? { donation_fund_id: donation.fundId } : {}),
  };
}

export function parseEventRegistrationDonationFromDetail(data: unknown): EventRegistrationDonationContext {
  if (!data || typeof data !== "object") {
    return { available: false, settings: null, funds: [], defaultFundId: null };
  }
  const row = data as Record<string, unknown>;
  const settings = normalizeEventDonationSettings(row.donation_settings);
  const funds = normalizeEventDonationFunds(row.donation_funds);
  return resolveEventRegistrationDonation(settings, funds);
}
