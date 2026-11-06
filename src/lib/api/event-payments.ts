import "server-only";

import { serverFetchJson, serverFetchPost } from "@/lib/api/server-fetch";

export async function fetchAvailablePayoutAccountsRaw(communityId: string) {
  return serverFetchJson<unknown>(
    `events/payments/communities/${communityId}/available-payout-accounts/`,
  );
}

export async function fetchCommunityPayoutStatusRaw(communityId: string) {
  return serverFetchJson<unknown>(`bookings/${communityId}/payments/account-status/`);
}

export async function connectCommunityStripeRaw(
  communityId: string,
  body: { refresh_url: string; return_url: string },
) {
  return serverFetchPost<unknown>(`bookings/${communityId}/payments/connect-stripe/`, body);
}

export async function refreshCommunityStripeOnboardingRaw(
  communityId: string,
  body: { refresh_url: string; return_url: string },
) {
  return serverFetchPost<unknown>(`bookings/${communityId}/payments/refresh-onboarding/`, body);
}

export async function linkPersonalBankAccountRaw(body: {
  success_url: string;
  cancel_url: string;
  refresh_url: string;
}) {
  return serverFetchPost<unknown>("events/payments/link-account/", body);
}

export async function createEventPaymentLinkRaw(
  eventId: string,
  body: Record<string, unknown>,
) {
  return serverFetchPost<unknown>(`events/payments/${eventId}/payment-link/`, body);
}

export type EventCalculatePriceParams = {
  has_plus_one?: boolean;
  coupon_code?: string;
  ticket_id?: string;
  ticket_quantity?: number;
  donation_amount?: number;
  donation_cover_fees?: boolean;
  donation_fund_id?: string;
};

export async function fetchEventCalculatePriceRaw(
  eventId: string,
  params: EventCalculatePriceParams = {},
) {
  const search = new URLSearchParams();
  if (params.has_plus_one) search.set("has_plus_one", "true");
  if (params.coupon_code) search.set("coupon_code", params.coupon_code.toUpperCase().trim());
  if (params.ticket_id) search.set("ticket_id", params.ticket_id);
  if (typeof params.ticket_quantity === "number") {
    search.set("ticket_quantity", String(params.ticket_quantity));
  }
  if (typeof params.donation_amount === "number" && params.donation_amount > 0) {
    search.set("donation_amount", params.donation_amount.toFixed(2));
    if (params.donation_cover_fees) search.set("donation_cover_fees", "true");
    if (params.donation_fund_id) search.set("donation_fund_id", params.donation_fund_id);
  }
  const qs = search.toString();
  const path = `events/${eventId}/calculate-price/${qs ? `?${qs}` : ""}`;
  return serverFetchJson<unknown>(path, { method: "GET" });
}

export async function createEventJoinRequestRaw(eventId: string, formData: FormData) {
  return serverFetchJson<unknown>(`events/${eventId}/join-requests/`, {
    method: "POST",
    body: formData,
  });
}

export async function fetchEventRegistrationStatusRaw(eventId: string, guestEmail?: string) {
  const qs = guestEmail ? `?guest_email=${encodeURIComponent(guestEmail)}` : "";
  return serverFetchJson<unknown>(`events/payments/registration-status/${eventId}/${qs}`);
}

export async function patchEventDonationSettingsRaw(
  eventId: string,
  body: Record<string, unknown>,
) {
  return serverFetchJson<unknown>(`events/payments/${eventId}/donation-settings/`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
