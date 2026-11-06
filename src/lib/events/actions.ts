"use server";

import { revalidatePath, updateTag } from "next/cache";
import {
  EVENTS_LIST_CACHE_TAG,
  eventDetailCacheTag,
} from "@/lib/events/cache-tags";
import { redirect } from "next/navigation";
import {
  connectCommunityStripeRaw,
  createEventJoinRequestRaw,
  createEventPaymentLinkRaw,
  fetchEventCalculatePriceRaw,
  patchEventDonationSettingsRaw,
  fetchAvailablePayoutAccountsRaw,
  fetchCommunityPayoutStatusRaw,
  fetchEventRegistrationStatusRaw,
  linkPersonalBankAccountRaw,
  refreshCommunityStripeOnboardingRaw,
} from "@/lib/api/event-payments";
import {
  stagingCreateEventRaw,
  stagingPatchEventRaw,
  stagingRegisterPublicEventRaw,
} from "@/lib/api/events";
import { requireActiveCommunityMember } from "@/lib/communities/membership-guard";
import { readStagingActionError } from "@/lib/api/server-fetch";
import { getSessionTokens } from "@/lib/auth/session-cookies";
import { usesStagingApi } from "@/lib/demo-mode";
import { eventCreateReturnPath, siteOrigin } from "@/lib/events/site-url";
import { isUuid } from "@/lib/utils/uuid";
import {
  isSawubonaCommunity,
  resolveAttendeeIdentity,
  validateAttendeeIdentityValue,
  type AttendeeIdentityKind,
} from "@/lib/events/attendee-identity";
import { buildEventDonationPayload } from "@/lib/events/event-donation";
import { mapRegistrationStatusPayload } from "@/lib/events/map-event-tickets";
import {
  normalizeEventPricing,
  type EventPricingResponse,
} from "@/lib/events/event-pricing";
import {
  buildPayoutLoadResult,
  parseCommunityPayoutStatus,
  shouldRefreshStripeOnboarding,
} from "@/lib/events/payout-accounts";
import type { CommunityPayoutStatus } from "@/types/payment";
import type { ActionResult } from "@/lib/communities/actions";
import { eventCreateSchema } from "@/lib/validations/event";
import type { PayoutAccountsLoadResult } from "@/types/payment";

function requireStaging(): ActionResult | null {
  if (!usesStagingApi()) {
    return {
      error: "Events require staging API. Set NEXT_PUBLIC_DEMO_STATIC_UI=false and sign in.",
    };
  }
  return null;
}

function splitDateTime(value: string): { date: string; time: string } {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    const [date, time] = value.split("T");
    return { date: date ?? value, time: (time ?? "12:00").slice(0, 8) };
  }
  const date = d.toISOString().slice(0, 10);
  const time = d.toTimeString().slice(0, 8);
  return { date, time };
}

export async function loadCommunityPayoutStatus(
  communityId: string,
): Promise<{ status: CommunityPayoutStatus | null; error?: string }> {
  const blocked = requireStaging();
  if (blocked) return { status: null, error: blocked.error };

  const result = await fetchCommunityPayoutStatusRaw(communityId);
  if (!result.ok || !result.data || typeof result.data !== "object") {
    return {
      status: null,
      error: readStagingActionError(result) ?? "Could not load payout status",
    };
  }
  return { status: parseCommunityPayoutStatus(result.data as Record<string, unknown>) };
}

function extractStripeOnboardingUrl(data: Record<string, unknown>): string | null {
  return (
    (typeof data.onboarding_url === "string" && data.onboarding_url) ||
    (typeof data.url === "string" && data.url) ||
    null
  );
}

export async function loadPayoutAccounts(
  communityId: string,
): Promise<PayoutAccountsLoadResult & { error?: string }> {
  const blocked = requireStaging();
  if (blocked) return { ...blocked, accounts: [], apiError: blocked.error ?? null, hasCommunityAccount: false, allowPersonalPayoutAccounts: false, isPaymentOwner: false };

  const result = await fetchAvailablePayoutAccountsRaw(communityId);
  if (!result.ok || !result.data) {
    return {
      accounts: [],
      apiError: readStagingActionError(result) ?? "Could not load payout accounts",
      hasCommunityAccount: false,
      allowPersonalPayoutAccounts: false,
      isPaymentOwner: false,
      error: readStagingActionError(result) ?? undefined,
    };
  }
  return buildPayoutLoadResult(result.data as Record<string, unknown>);
}

export async function startCommunityStripeConnect(
  communityId: string,
  slug: string,
  returnPath: string,
): Promise<{ url?: string; error?: string }> {
  const blocked = requireStaging();
  if (blocked) return blocked;

  const origin = siteOrigin();
  const withQuery = (path: string, key: string, value: string) =>
    path.includes("?") ? `${path}&${key}=${value}` : `${path}?${key}=${value}`;
  const returnUrl = `${origin}${withQuery(returnPath, "payout_setup", "success")}`;
  const refreshUrl = `${origin}${withQuery(returnPath, "payout_setup", "refresh")}`;
  void slug;

  const statusResult = await fetchCommunityPayoutStatusRaw(communityId);
  const payoutStatus =
    statusResult.ok && statusResult.data && typeof statusResult.data === "object"
      ? parseCommunityPayoutStatus(statusResult.data as Record<string, unknown>)
      : null;

  const body = { refresh_url: refreshUrl, return_url: returnUrl };
  const useRefresh = shouldRefreshStripeOnboarding(payoutStatus);

  let result = useRefresh
    ? await refreshCommunityStripeOnboardingRaw(communityId, body)
    : await connectCommunityStripeRaw(communityId, body);

  if (!result.ok || !result.data) {
    const message = readStagingActionError(result) ?? "Could not start Stripe setup.";
    const alreadyConnected = /already connected/i.test(message);
    if (!useRefresh && alreadyConnected) {
      result = await refreshCommunityStripeOnboardingRaw(communityId, body);
      if (result.ok && result.data) {
        const url = extractStripeOnboardingUrl(result.data as Record<string, unknown>);
        if (url) return { url };
      }
    }
    return { error: message };
  }

  const url = extractStripeOnboardingUrl(result.data as Record<string, unknown>);
  if (!url) return { error: "Stripe did not return an onboarding link." };
  return { url };
}

export async function startPersonalStripeConnect(
  communityId: string,
): Promise<{ url?: string; error?: string }> {
  const blocked = requireStaging();
  if (blocked) return blocked;

  const origin = siteOrigin();
  const returnPath = eventCreateReturnPath(communityId, "success");
  const cancelPath = eventCreateReturnPath(communityId, "cancel");
  const result = await linkPersonalBankAccountRaw({
    success_url: `${origin}${returnPath}`,
    cancel_url: `${origin}${cancelPath}`,
    refresh_url: `${origin}${returnPath}`,
  });

  if (!result.ok || !result.data) {
    return { error: readStagingActionError(result) ?? "Could not start personal payout setup." };
  }

  const data = result.data as Record<string, unknown>;
  const url =
    (typeof data.url === "string" && data.url) ||
    (typeof data.onboarding_url === "string" && data.onboarding_url) ||
    null;
  if (!url) return { error: "Stripe did not return an onboarding link." };
  return { url };
}

function parseEventForm(formData: FormData) {
  const parsed = eventCreateSchema.safeParse({
    communityId: formData.get("communityId"),
    title: formData.get("title"),
    description: formData.get("description"),
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt"),
    location: formData.get("location"),
    isPrivate: formData.get("isPrivate") === "true",
    capacity: formData.get("capacity") ?? "",
    payoutAccountType: formData.get("payoutAccountType") ?? "",
    payoutAccountId: formData.get("payoutAccountId") ?? "",
    ticketsJson: formData.get("ticketsJson") ?? "[]",
    donationsEnabled: formData.get("donationsEnabled") === "true",
    donationGoal: formData.get("donationGoal") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid event details", data: null, body: null };
  }

  const data = parsed.data;
  const rawLocationId = formData.get("locationId");
  const locationLooksOnline = /^\s*online\s*$/i.test(data.location);
  if (
    !locationLooksOnline &&
    typeof rawLocationId === "string" &&
    rawLocationId.trim() &&
    !isUuid(rawLocationId)
  ) {
    return {
      error:
        "Choose your venue from the address suggestions (do not paste a Google place ID).",
      data: null,
      body: null,
    };
  }
  const start = splitDateTime(data.startAt);
  const end = splitDateTime(data.endAt);
  const timezone =
    (formData.get("timezone") as string | null)?.trim() ||
    "America/Los_Angeles";

  const body = new FormData();
  body.append("title", data.title);
  body.append("description", data.description);
  body.append("location", data.location);
  body.append("timezone_name", timezone);
  body.append("start_date", start.date);
  body.append("start_time", start.time);
  body.append("end_date", end.date);
  body.append("end_time", end.time);
  body.append("is_private", String(data.isPrivate));
  body.append("is_public", String(!data.isPrivate));
  body.append("allow_plus_one", "false");
  body.append("allow_guest", "false");

  if (data.capacity?.trim()) {
    body.append("capacity", data.capacity.trim());
  }

  type TicketRow = { name: string; type: "free" | "paid"; price: string };
  let tickets: TicketRow[] = [];
  try {
    tickets = JSON.parse(String(data.ticketsJson)) as TicketRow[];
  } catch {
    return { error: "Invalid ticket configuration.", data: null, body: null };
  }
  if (!tickets.length) {
    return { error: "Add at least one ticket.", data: null, body: null };
  }

  const hasPaid = tickets.some((t) => t.type === "paid");
  if (hasPaid) {
    if (!data.payoutAccountType || !data.payoutAccountId) {
      return { error: "Select a verified payout account for paid tickets.", data: null, body: null };
    }
    body.append("payout_account_type", data.payoutAccountType);
    body.append("payout_account_id", data.payoutAccountId);
    const firstPaid = tickets.find((t) => t.type === "paid");
    const price = Number(firstPaid?.price);
    if (!Number.isNaN(price) && price > 0) {
      body.append("price", String(price));
    }
  }

  tickets.forEach((ticket, index) => {
    const cost = ticket.type === "paid" ? Number(ticket.price) : 0;
    body.append(`tickets[${index}][name]`, ticket.name.trim() || "Ticket");
    body.append(`tickets[${index}][description]`, "");
    body.append(
      `tickets[${index}][cost]`,
      ticket.type === "paid" && !Number.isNaN(cost) ? String(cost) : "0",
    );
    body.append(`tickets[${index}][is_free]`, ticket.type === "free" ? "True" : "False");
  });

  const locationId = formData.get("locationId");
  if (typeof locationId === "string" && isUuid(locationId)) {
    body.append("address", locationId.trim());
  }

  for (const ownerId of formData.getAll("owner")) {
    if (typeof ownerId === "string" && ownerId.trim()) {
      body.append("owner", ownerId.trim());
    }
  }

  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    body.append("image", image);
  }

  return { error: null, data, body };
}

export async function createEvent(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const blocked = requireStaging();
  if (blocked) return blocked;

  const built = parseEventForm(formData);
  if (built.error || !built.data || !built.body) {
    return { error: built.error ?? "Invalid event details" };
  }

  const { data, body } = built;

  const membershipError = await requireActiveCommunityMember(data.communityId);
  if (membershipError) {
    return { error: membershipError };
  }

  const result = await stagingCreateEventRaw(data.communityId, body);
  if (!result.ok) {
    const err = readStagingActionError(result);
    if (result.data && typeof result.data === "object" && (result.data as Record<string, unknown>).setup_required) {
      return {
        error:
          "Payout account setup required. Add a community bank account from admin, then try again.",
      };
    }
    return { error: err ?? "Could not create event." };
  }

  const id =
    result.data && typeof result.data === "object"
      ? String((result.data as Record<string, unknown>).id ?? "")
      : "";

  if (id && data.donationsEnabled) {
    const goal = Number(data.donationGoal);
    await patchEventDonationSettingsRaw(id, {
      enabled: true,
      allow_donation_only: true,
      ...( !Number.isNaN(goal) && goal > 0 ? { fundraising_goal: goal } : {}),
    });
  }

  revalidatePath("/events");
  revalidatePath("/home");
  updateTag(EVENTS_LIST_CACHE_TAG);
  if (id) {
    updateTag(eventDetailCacheTag(id));
    return { success: "Event created.", redirectTo: `/events/${id}` };
  }
  return { success: "Event created.", redirectTo: "/events" };
}

export async function updateEvent(
  eventId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const blocked = requireStaging();
  if (blocked) return blocked;

  const built = parseEventForm(formData);
  if (built.error || !built.data || !built.body) {
    return { error: built.error ?? "Invalid event details" };
  }

  const { data, body } = built;
  const result = await stagingPatchEventRaw(eventId, body);
  if (!result.ok) {
    return { error: readStagingActionError(result) ?? "Could not update event." };
  }

  if (data.donationsEnabled) {
    const goal = Number(data.donationGoal);
    await patchEventDonationSettingsRaw(eventId, {
      enabled: true,
      allow_donation_only: true,
      ...(!Number.isNaN(goal) && goal > 0 ? { fundraising_goal: goal } : {}),
    });
  }

  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/home");
  updateTag(EVENTS_LIST_CACHE_TAG);
  updateTag(eventDetailCacheTag(eventId));
  return { success: "Event updated.", redirectTo: `/events/${eventId}` };
}

export async function requestEventJoin(
  eventId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult & { paymentUrl?: string }> {
  const blocked = requireStaging();
  if (blocked) return blocked;

  const message = (formData.get("message") as string | null)?.trim() ?? "";
  const body = new FormData();
  if (message) body.append("message", message);
  const ticketId = (formData.get("ticketId") as string | null)?.trim();
  if (ticketId) body.append("ticket_id", ticketId);

  const result = await createEventJoinRequestRaw(eventId, body);
  if (!result.ok) {
    return { error: readStagingActionError(result) ?? "Could not submit join request." };
  }
  revalidatePath(`/events/${eventId}`);
  updateTag(EVENTS_LIST_CACHE_TAG);
  updateTag(eventDetailCacheTag(eventId));
  return { success: "Request sent. The host will review your registration." };
}

/** Free events: public → instant open register; private community → join request (gradpad-web). */
export async function registerFreeEventAction(
  eventId: string,
  isPublicEvent: boolean,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  if (isPublicEvent) {
    const blocked = requireStaging();
    if (blocked) return blocked;

    const email = (formData.get("email") as string | null)?.trim() ?? "";
    const ticketId = (formData.get("ticketId") as string | null)?.trim() ?? "";
    const firstName = (formData.get("firstName") as string | null)?.trim() ?? "";
    const lastName = (formData.get("lastName") as string | null)?.trim() ?? "";

    if (!email) return { error: "Your account email is required to register." };
    if (!ticketId) return { error: "This event has no free ticket configured." };

    const communityName = (formData.get("communityName") as string | null)?.trim() ?? "";
    const sawubona = isSawubonaCommunity({ communityName });

    const displayName = `${firstName} ${lastName}`.trim() || firstName || "Guest";
    const registrationAnswers: Record<string, unknown> = {
      name: displayName,
      email,
    };

    if (!sawubona) {
      const kind =
        (formData.get("attendeeIdentityKind") as AttendeeIdentityKind | null) ?? "class_year";
      const classYearInput = (formData.get("classYearInput") as string | null)?.trim() ?? "";
      const attendeeIdentity = resolveAttendeeIdentity(kind, classYearInput);
      if (!validateAttendeeIdentityValue(attendeeIdentity)) {
        return { error: "Enter a 4-digit class year, Guest, or BLS Parent." };
      }
      registrationAnswers.class_year = attendeeIdentity;
      registrationAnswers.attendee_identity = attendeeIdentity;
      if (/^\d{4}$/.test(attendeeIdentity)) {
        registrationAnswers.graduation_year = attendeeIdentity;
      }
    }

    const payload: Record<string, unknown> = {
      first_name: firstName || "Guest",
      last_name: lastName,
      email,
      ticket_id: ticketId,
      has_plus_one: false,
      registration_answers: registrationAnswers,
    };

    if (!sawubona) {
      const identity = String(registrationAnswers.attendee_identity ?? "");
      payload.class_year = identity;
      payload.attendee_identity = identity;
      if (/^\d{4}$/.test(identity)) {
        payload.graduation_year = identity;
      }
    }

    const result = await stagingRegisterPublicEventRaw(eventId, payload);
    const row =
      result.data && typeof result.data === "object"
        ? (result.data as Record<string, unknown>)
        : null;
    const alreadyRegistered = row?.already_registered === true;

    if (!result.ok && !alreadyRegistered) {
      const apiError =
        (typeof row?.error === "string" && row.error) ||
        readStagingActionError(result) ||
        "Could not complete registration.";
      return { error: apiError };
    }

    revalidatePath(`/events/${eventId}`);
    revalidatePath("/events");
    updateTag(EVENTS_LIST_CACHE_TAG);
    updateTag(eventDetailCacheTag(eventId));
    return {
      success: alreadyRegistered
        ? "You're already registered for this event."
        : "You're registered for this event.",
    };
  }

  return requestEventJoin(eventId, _prev, formData);
}

export async function loadEventRegistrationStatus(eventId: string): Promise<{
  error: string | null;
  registration: ReturnType<typeof mapRegistrationStatusPayload>;
}> {
  const blocked = requireStaging();
  if (blocked) {
    return { error: blocked.error ?? "Staging API required.", registration: null };
  }

  const result = await fetchEventRegistrationStatusRaw(eventId);
  if (!result.ok) {
    return {
      error: readStagingActionError(result) ?? "Could not load your ticket.",
      registration: null,
    };
  }

  return {
    error: null,
    registration: mapRegistrationStatusPayload(result.data),
  };
}

export async function quoteEventRegistrationPrice(
  eventId: string,
  input: {
    ticketId: string;
    hasPlusOne: boolean;
    couponCode?: string;
    donationAmount?: number;
    donationCoverFees?: boolean;
    donationFundId?: string | null;
  },
): Promise<{ pricing: ReturnType<typeof normalizeEventPricing> } | { error: string }> {
  const blocked = requireStaging();
  if (blocked) return { error: blocked.error ?? "Staging API required." };

  if (!input.ticketId) return { error: "Select a ticket." };

  const result = await fetchEventCalculatePriceRaw(eventId, {
    ticket_id: input.ticketId,
    ticket_quantity: 1,
    has_plus_one: input.hasPlusOne,
    coupon_code: input.couponCode?.trim() || undefined,
    donation_amount:
      typeof input.donationAmount === "number" && input.donationAmount > 0
        ? input.donationAmount
        : undefined,
    donation_cover_fees: input.donationCoverFees,
    donation_fund_id: input.donationFundId ?? undefined,
  });

  if (!result.ok || !result.data) {
    return {
      error: readStagingActionError(result) ?? "Could not calculate checkout total.",
    };
  }

  const raw = result.data as EventPricingResponse;
  if (raw.coupon_error) {
    return { error: raw.coupon_error };
  }

  return { pricing: normalizeEventPricing(raw) };
}

export async function startEventCheckout(
  eventId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult & { paymentUrl?: string }> {
  const blocked = requireStaging();
  if (blocked) return blocked;

  const ticketId = formData.get("ticketId");
  const hasPlusOne = formData.get("hasPlusOne") === "true";
  const plusOneName =
    typeof formData.get("plusOneName") === "string"
      ? String(formData.get("plusOneName")).trim()
      : "";
  const plusOneEmail =
    typeof formData.get("plusOneEmail") === "string"
      ? String(formData.get("plusOneEmail")).trim()
      : "";
  const couponCode =
    typeof formData.get("couponCode") === "string"
      ? String(formData.get("couponCode")).trim().toUpperCase()
      : "";

  if (hasPlusOne && !plusOneName) {
    return { error: "Plus-one guest full name is required." };
  }
  if (hasPlusOne && !plusOneEmail) {
    return { error: "Plus-one guest email is required." };
  }

  const donationAmount = Number(formData.get("donationAmount") ?? 0);
  const donationCoverFees = formData.get("donationCoverFees") === "true";
  const donationFundId = formData.get("donationFundId");
  const donationIsAnonymous = formData.get("donationIsAnonymous") === "true";
  const donationMessage =
    typeof formData.get("donationMessage") === "string"
      ? String(formData.get("donationMessage"))
      : "";

  const body: Record<string, unknown> = {
    ticket_id: typeof ticketId === "string" ? ticketId : "",
    ticket_quantity: 1,
    has_plus_one: hasPlusOne,
    registration_answers: {},
  };

  if (hasPlusOne) {
    body.plus_one_name = plusOneName;
    body.plus_one_email = plusOneEmail;
    body.plus_one_guest = { full_name: plusOneName, email: plusOneEmail };
  }
  if (couponCode) body.coupon_code = couponCode;

  if (Number.isFinite(donationAmount) && donationAmount > 0) {
    Object.assign(
      body,
      buildEventDonationPayload({
        amount: donationAmount,
        isCustom: formData.get("donationIsCustom") === "true",
        coverFees: donationCoverFees,
        isAnonymous: donationIsAnonymous,
        message: donationMessage,
        fundId:
          typeof donationFundId === "string" && donationFundId ? donationFundId : null,
      }),
    );
  }

  const result = await createEventPaymentLinkRaw(eventId, body);
  if (!result.ok || !result.data) {
    return { error: readStagingActionError(result) ?? "Could not start checkout." };
  }

  const data = result.data as Record<string, unknown>;
  const paymentUrl =
    (typeof data.payment_link_url === "string" && data.payment_link_url) ||
    (typeof data.checkout_url === "string" && data.checkout_url) ||
    undefined;

  if (!paymentUrl) {
    return { error: "Stripe checkout URL was not returned." };
  }

  redirect(paymentUrl);
}
