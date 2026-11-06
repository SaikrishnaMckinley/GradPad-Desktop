/**
 * Client-side fee estimate — same formula as gradpad-web `lib/stripeFees.ts`.
 * Used for instant summary updates; server quote remains source of truth at checkout.
 */

export const STRIPE_US_DOMESTIC_CARD_FEE_PERCENT = 2.9;
export const STRIPE_US_DOMESTIC_CARD_FEE_FLAT = 0.3;
export const DONATION_PLATFORM_FEE_PERCENT = 5;

export type DonationCheckoutBreakdown = {
  donationAmount: number;
  processingFeeAddon: number;
  totalCharge: number;
  communityReceives: number;
  coverFees: boolean;
};

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateDonationCheckout(
  donationAmount: number,
  coverFees: boolean,
): DonationCheckoutBreakdown {
  const amount = round2(Number.isFinite(donationAmount) ? donationAmount : 0);
  if (amount <= 0) {
    return {
      donationAmount: 0,
      processingFeeAddon: 0,
      totalCharge: 0,
      communityReceives: 0,
      coverFees,
    };
  }

  const platformFee = round2((amount * DONATION_PLATFORM_FEE_PERCENT) / 100);
  const p = STRIPE_US_DOMESTIC_CARD_FEE_PERCENT / 100;
  const f = STRIPE_US_DOMESTIC_CARD_FEE_FLAT;
  const totalChargeIfCovered = round2((amount + platformFee + f) / (1 - p));
  const processingFeeAddon = round2(totalChargeIfCovered - amount);

  if (coverFees) {
    return {
      donationAmount: amount,
      processingFeeAddon,
      totalCharge: totalChargeIfCovered,
      communityReceives: amount,
      coverFees: true,
    };
  }

  return {
    donationAmount: amount,
    processingFeeAddon: 0,
    totalCharge: amount,
    communityReceives: round2(Math.max(0, amount - processingFeeAddon)),
    coverFees: false,
  };
}
