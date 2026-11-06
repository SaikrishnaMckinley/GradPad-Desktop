/** Checkout pricing types/normalizers mirrored from gradpad-web `lib/event-pricing.ts`. */

export type ProcessingFeeInfo = {
  type: "flat" | "percent" | "combined";
  value: number | string;
  amount?: number | string;
};

export type EventPricingResponse = {
  subtotal: number | string;
  original_subtotal?: number | string;
  platform_fee: number | string;
  processing_fee_total?: number | string;
  total_amount: number | string;
  total?: number | string;
  has_plus_one?: boolean;
  coupon_applied?: boolean;
  coupon_error?: string;
  coupon?: {
    code: string;
    discount_amount: number;
  };
  processing_fee?: ProcessingFeeInfo;
  donation_amount?: number | string;
  donation_fee_coverage?: number | string;
  donation_cover_fee_addon?: number | string;
  organizer_donation_net?: number | string;
};

export type NormalizedEventPricing = {
  subtotal: number;
  original_subtotal: number;
  platform_fee: number;
  processing_fee_total: number;
  total_amount: number;
  coupon_applied: boolean;
  coupon?: EventPricingResponse["coupon"];
  donation_amount: number;
  donation_fee_coverage: number;
  donation_cover_fee_addon: number;
  organizer_donation_net: number;
};

export type CheckoutDisplayPricing = {
  ticketLine: number;
  discount: number;
  platformFee: number;
  donation: number;
  donationFeeCoverage: number;
  total: number;
  feeLabel: string;
  donationFeeLabel: string;
  organizerDonationNet: number;
  donationCoverFeeAddon: number;
};

export const EVENT_TRANSACTION_FEE_LABEL = "Event transaction fee";
export const EVENT_DONATION_PROCESSING_FEE_LABEL = "Donation processing fee";

/** gradpad-web `constants/payment.ts` */
const DUKE_COMMUNITY_ID = "ea7444de-7413-44ba-8bb2-e8073f0974b9";
const PROCESSING_FEE_FLAT = 1.0;
const PROCESSING_FEE_PERCENT = 3.0;
const STRIPE_FEE_PERCENT = 2.9;
const STRIPE_FEE_FLAT = 0.3;

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function getGradPadProcessingFee(communityId: string, amount: number): number {
  if (amount <= 0) return 0;
  if (communityId === DUKE_COMMUNITY_ID) return PROCESSING_FEE_FLAT;
  return roundMoney((amount * PROCESSING_FEE_PERCENT) / 100);
}

/** Stripe + Grad Pad — matches staging calculate-price closely for ticket checkout. */
export function estimateEventTransactionFee(subtotal: number, communityId: string): number {
  if (subtotal <= 0) return 0;
  const platform = getGradPadProcessingFee(communityId, subtotal);
  const stripe = roundMoney((subtotal * STRIPE_FEE_PERCENT) / 100 + STRIPE_FEE_FLAT);
  return roundMoney(platform + stripe);
}

export function buildLocalEventRegistrationPricing(opts: {
  ticketUnitCost: number;
  hasPlusOne?: boolean;
  communityId: string;
  donationAmount?: number;
  donationCoverFeeAddon?: number;
}): NormalizedEventPricing {
  const quantity = 1 + (opts.hasPlusOne ? 1 : 0);
  const subtotal = roundMoney(Math.max(0, opts.ticketUnitCost) * quantity);
  const eventFee = estimateEventTransactionFee(subtotal, opts.communityId);
  const donation = roundMoney(Math.max(0, opts.donationAmount ?? 0));
  const donationFee = roundMoney(Math.max(0, opts.donationCoverFeeAddon ?? 0));

  return {
    subtotal,
    original_subtotal: subtotal,
    platform_fee: eventFee,
    processing_fee_total: eventFee,
    total_amount: roundMoney(subtotal + eventFee + donation + donationFee),
    coupon_applied: false,
    donation_amount: donation,
    donation_fee_coverage: donationFee,
    donation_cover_fee_addon: donationFee,
    organizer_donation_net: donation,
  };
}

const toNumber = (value: unknown): number => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

export function normalizeEventPricing(
  raw: EventPricingResponse | null | undefined,
): NormalizedEventPricing | null {
  if (!raw) return null;

  const subtotal = toNumber(raw.subtotal);
  const originalSubtotal = toNumber(raw.original_subtotal ?? raw.subtotal);
  const processingFeeTotal = toNumber(
    raw.processing_fee_total ?? raw.processing_fee?.amount ?? raw.platform_fee,
  );
  const totalAmount = toNumber(raw.total_amount ?? raw.total);

  return {
    subtotal,
    original_subtotal: originalSubtotal,
    platform_fee: processingFeeTotal,
    processing_fee_total: processingFeeTotal,
    total_amount: totalAmount,
    coupon_applied: !!raw.coupon_applied,
    coupon: raw.coupon,
    donation_amount: toNumber(raw.donation_amount),
    donation_fee_coverage: toNumber(raw.donation_fee_coverage),
    donation_cover_fee_addon: toNumber(
      raw.donation_cover_fee_addon,
    ),
    organizer_donation_net: toNumber(raw.organizer_donation_net),
  };
}

export type ConfirmedPaymentDisplayPricing = {
  ticketLine: number;
  originalTicketLine: number | null;
  discount: number;
  ticketQuantity: number;
  donation: number;
  eventTransactionFee: number;
  donationProcessingFee: number;
  total: number;
};

type ConfirmedPaymentPricing = {
  subtotal: number;
  platformFee: number;
  total: number;
  originalPrice: number | null;
  discountAmount: number | null;
  hasDiscount: boolean;
  donation: number;
  donationFeeCoverage: number;
};

function parseConfirmedPaymentPricing(
  payment: Record<string, unknown> | null | undefined,
): ConfirmedPaymentPricing {
  if (!payment) {
    return {
      subtotal: 0,
      platformFee: 0,
      total: 0,
      originalPrice: null,
      discountAmount: null,
      hasDiscount: false,
      donation: 0,
      donationFeeCoverage: 0,
    };
  }

  const total = toNumber(payment.total ?? payment.total_amount ?? payment.amount);
  const platformFee = toNumber(payment.platform_fee);
  const donation = toNumber(payment.donation_amount);
  const donationFeeCoverage = toNumber(payment.donation_fee_coverage);
  const subtotal =
    payment.subtotal != null
      ? toNumber(payment.subtotal)
      : Math.max(0, total - platformFee - donation);

  const originalPrice =
    payment.original_price != null
      ? toNumber(payment.original_price)
      : payment.original_amount != null
        ? toNumber(payment.original_amount)
        : null;
  const discountAmount =
    payment.discount_applied != null || payment.discount_amount != null
      ? toNumber(payment.discount_applied ?? payment.discount_amount)
      : null;

  const hasDiscount =
    originalPrice !== null && discountAmount !== null && discountAmount > 0;

  return {
    subtotal,
    platformFee,
    total,
    originalPrice,
    discountAmount,
    hasDiscount,
    donation,
    donationFeeCoverage,
  };
}

/** Line items for view-ticket / confirmation (gradpad-web). */
export function getConfirmedPaymentDisplayPricing(
  payment: Record<string, unknown> | null | undefined,
  opts?: {
    ticketUnitCost?: number;
    ticketQuantity?: number;
  },
): ConfirmedPaymentDisplayPricing | null {
  const parsed = parseConfirmedPaymentPricing(payment);
  const total = parsed.total;
  if (!Number.isFinite(total) || total <= 0) return null;

  const donation = parsed.donation;
  const donationProcessingFee = parsed.donationFeeCoverage;
  const ticketQuantity = Math.max(
    1,
    opts?.ticketQuantity ??
      (toNumber(payment?.number_of_attendees) || toNumber(payment?.ticket_quantity) || 1),
  );
  const unitCost = Math.max(0, opts?.ticketUnitCost ?? 0);
  const discount = parsed.discountAmount ?? 0;

  let originalTicketLine: number | null = null;
  let ticketLine = 0;

  if (unitCost > 0) {
    originalTicketLine = roundMoney(unitCost * ticketQuantity);
    ticketLine = parsed.hasDiscount
      ? Math.max(0, roundMoney(originalTicketLine - discount))
      : originalTicketLine;
  }

  const eventTransactionFee = Math.max(
    0,
    roundMoney(total - donation - donationProcessingFee - ticketLine),
  );

  return {
    ticketLine,
    originalTicketLine: parsed.hasDiscount ? originalTicketLine : null,
    discount,
    ticketQuantity,
    donation,
    eventTransactionFee,
    donationProcessingFee,
    total,
  };
}

export function getCheckoutDisplayPricing(
  pricing: NormalizedEventPricing | null,
): CheckoutDisplayPricing | null {
  if (!pricing) return null;

  const discount = pricing.coupon_applied ? toNumber(pricing.coupon?.discount_amount) : 0;
  const ticketLine =
    pricing.original_subtotal > pricing.subtotal
      ? pricing.original_subtotal
      : pricing.subtotal + discount;

  const processingFee = pricing.processing_fee_total;

  return {
    ticketLine,
    discount,
    platformFee: processingFee,
    donation: pricing.donation_amount ?? 0,
    donationFeeCoverage: pricing.donation_fee_coverage ?? 0,
    total: pricing.total_amount,
    feeLabel: EVENT_TRANSACTION_FEE_LABEL,
    donationFeeLabel: EVENT_DONATION_PROCESSING_FEE_LABEL,
    organizerDonationNet: pricing.organizer_donation_net,
    donationCoverFeeAddon: pricing.donation_cover_fee_addon,
  };
}
