"use client";

import { apiGet, apiPost } from "@/lib/api/http";
import type { PublicEventGuestView } from "@/lib/events/public-event-types";
import { mapPublicEventRecord } from "@/lib/events/map-public-event";

export async function fetchPublicEventClient(eventId: string): Promise<PublicEventGuestView> {
  const res = await apiGet<Record<string, unknown>>(`events/open/${eventId}/`);
  const mapped = mapPublicEventRecord(res.data ?? {});
  if (!mapped) throw new Error("Invalid event response");
  return mapped;
}

export type PublicRegisterPayload = {
  first_name: string;
  last_name?: string;
  email: string;
  ticket_id?: string;
  has_plus_one?: boolean;
  plus_one_name?: string;
  plus_one_email?: string;
  class_year?: string;
  graduation_year?: string;
  registration_answers?: Record<string, unknown>;
};

export async function registerPublicEventClient(
  eventId: string,
  payload: PublicRegisterPayload,
) {
  return apiPost<{
    qr_code?: string;
    error?: string;
    already_registered?: boolean;
  }>(`events/open/${eventId}/register/`, payload);
}

export async function resendPublicEventConfirmationClient(eventId: string, email: string) {
  return apiPost<{ success?: boolean; message?: string }>(
    `events/open/${eventId}/resend-confirmation/`,
    { email },
  );
}

export async function fetchPublicEventTicketClient(eventId: string, email: string) {
  return apiPost<{
    qr_code?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  }>(`events/open/${eventId}/ticket/`, { email });
}

export async function createGuestEventPaymentLinkClient(
  eventId: string,
  formData: Record<string, unknown>,
) {
  return apiPost<{ payment_link_url?: string; checkout_url?: string; error?: string }>(
    `events/payments/${eventId}/guest-payment-link/`,
    formData,
  );
}

export type GuestCalculatePriceParams = {
  ticket_id?: string;
  ticket_quantity?: number;
  has_plus_one?: boolean;
  donation_amount?: number;
  donation_cover_fees?: boolean;
  donation_fund_id?: string;
};

/** Same quote as Stripe guest checkout (gradpad-web `calculateEventPrice`). */
export async function fetchEventCalculatePriceClient(
  eventId: string,
  params: GuestCalculatePriceParams = {},
) {
  const search = new URLSearchParams();
  if (params.has_plus_one) search.set("has_plus_one", "true");
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
  return apiGet<Record<string, unknown>>(
    `events/${eventId}/calculate-price/${qs ? `?${qs}` : ""}`,
  );
}

export function paymentLinkFromResponse(data: {
  payment_link_url?: string;
  checkout_url?: string;
}): string | null {
  if (typeof data.payment_link_url === "string" && data.payment_link_url) {
    return data.payment_link_url;
  }
  if (typeof data.checkout_url === "string" && data.checkout_url) {
    return data.checkout_url;
  }
  return null;
}
