"use client";

import { isUuid } from "@/lib/utils/uuid";

const STORAGE_KEY = "gradpad_event_create_draft_v2";

export type EventTicketDraft = {
  id: string;
  name: string;
  type: "free" | "paid";
  price: string;
};

export type EventHostDraft = {
  id: string;
  name: string;
  email?: string;
  photo?: string;
};

export type EventCreateDraft = {
  communityId: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  location: string;
  locationId: string;
  isPrivate: boolean;
  capacity: string;
  capacityLimited: boolean;
  payoutAccountType: string;
  payoutAccountId: string;
  tickets: EventTicketDraft[];
  hosts: EventHostDraft[];
  donationsEnabled: boolean;
  donationGoal: string;
};

export const EMPTY_EVENT_DRAFT: EventCreateDraft = {
  communityId: "",
  title: "",
  description: "",
  startAt: "",
  endAt: "",
  location: "",
  locationId: "",
  isPrivate: false,
  capacity: "",
  capacityLimited: false,
  payoutAccountType: "",
  payoutAccountId: "",
  tickets: [{ id: "ticket-1", name: "General Admission", type: "free", price: "" }],
  hosts: [],
  donationsEnabled: false,
  donationGoal: "",
};

export function newTicketId() {
  return `ticket-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function loadEventCreateDraft(): EventCreateDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<EventCreateDraft>;
    const locationId =
      parsed.locationId && isUuid(parsed.locationId) ? parsed.locationId : "";

    return {
      ...EMPTY_EVENT_DRAFT,
      ...parsed,
      locationId,
      tickets:
        parsed.tickets && parsed.tickets.length > 0
          ? parsed.tickets
          : EMPTY_EVENT_DRAFT.tickets,
      hosts: parsed.hosts ?? [],
    };
  } catch {
    return null;
  }
}

export function saveEventCreateDraft(draft: EventCreateDraft) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    /* ignore quota */
  }
}

export function clearEventCreateDraft() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/** Call before leaving for Stripe so the return trip restores the form. */
export function persistEventCreateDraftForRedirect(draft: EventCreateDraft) {
  saveEventCreateDraft(draft);
  try {
    sessionStorage.setItem("gradpad_event_create_return", "1");
  } catch {
    /* ignore */
  }
}

export function consumeEventCreateReturnFlag(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const v = sessionStorage.getItem("gradpad_event_create_return");
    sessionStorage.removeItem("gradpad_event_create_return");
    return v === "1";
  } catch {
    return false;
  }
}
