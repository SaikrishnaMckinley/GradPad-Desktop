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

export async function createEventPaymentLinkRaw(eventId: string, formData: FormData) {
  return serverFetchJson<unknown>(`events/payments/${eventId}/payment-link/`, {
    method: "POST",
    body: formData,
  });
}

export async function createEventJoinRequestRaw(eventId: string, formData: FormData) {
  return serverFetchJson<unknown>(`events/${eventId}/join-requests/`, {
    method: "POST",
    body: formData,
  });
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
