"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import {
  fetchEventAttendeesRaw,
  fetchEventStatisticsRaw,
  stagingDeleteEventRaw,
  stagingManualCheckInRaw,
  stagingQrCheckInRaw,
} from "@/lib/api/events";
import { readStagingActionError } from "@/lib/api/server-fetch";
import { usesStagingApi } from "@/lib/demo-mode";
import {
  EVENTS_LIST_CACHE_TAG,
  eventDetailCacheTag,
} from "@/lib/events/cache-tags";
import {
  mapEventAttendeesSummary,
  mapEventStatistics,
} from "@/lib/events/map-event-manage";
import type { ActionResult } from "@/lib/communities/actions";

function requireStaging(): ActionResult | null {
  if (!usesStagingApi()) {
    return { error: "Event manage requires staging API (NEXT_PUBLIC_DEMO_STATIC_UI=false)." };
  }
  return null;
}

function invalidateEvent(eventId: string) {
  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/events/${eventId}/manage`);
  revalidatePath(`/events/${eventId}/manage/check-in`);
  revalidatePath(`/events/${eventId}/manage/statistics`);
  revalidatePath("/home");
  updateTag(EVENTS_LIST_CACHE_TAG);
  updateTag(eventDetailCacheTag(eventId));
}

export async function loadEventManageStatistics(eventId: string) {
  const blocked = requireStaging();
  if (blocked) return { error: blocked.error, stats: null };

  const result = await fetchEventStatisticsRaw(eventId);
  if (!result.ok) {
    return {
      error: readStagingActionError(result) ?? "Could not load event statistics.",
      stats: null,
    };
  }
  return { error: null, stats: mapEventStatistics(result.data) };
}

export async function loadEventAttendeesSummary(eventId: string) {
  const blocked = requireStaging();
  if (blocked) return { error: blocked.error, summary: null };

  const result = await fetchEventAttendeesRaw(eventId);
  if (!result.ok) {
    return {
      error: readStagingActionError(result) ?? "Could not load attendees.",
      summary: null,
    };
  }
  return { error: null, summary: mapEventAttendeesSummary(result.data) };
}

export async function deleteEventAction(
  eventId: string,
  _prev: ActionResult | null,
): Promise<ActionResult> {
  const blocked = requireStaging();
  if (blocked) return blocked;

  const result = await stagingDeleteEventRaw(eventId);
  if (!result.ok) {
    return { error: readStagingActionError(result) ?? "Could not delete event." };
  }

  invalidateEvent(eventId);
  redirect("/events");
}

export async function manualCheckInAction(
  eventId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const blocked = requireStaging();
  if (blocked) return blocked;

  const email = (formData.get("email") as string | null)?.trim() ?? "";
  if (!email) return { error: "Enter the attendee email." };

  const result = await stagingManualCheckInRaw(eventId, email);
  if (!result.ok) {
    return { error: readStagingActionError(result) ?? "Check-in failed." };
  }

  invalidateEvent(eventId);
  return { success: "Attendee checked in." };
}

function qrCheckInSuccessMessage(data: unknown): string {
  if (!data || typeof data !== "object") return "Check-in successful!";
  const row = data as Record<string, unknown>;
  if (row.type === "primary") {
    const name = typeof row.attendee_name === "string" ? row.attendee_name : "Attendee";
    return `Check-in successful! ${name} (Primary Ticket) has been checked in.`;
  }
  if (row.type === "plus_one") {
    const guest = typeof row.guest_name === "string" ? row.guest_name : "Guest";
    const primary =
      typeof row.primary_attendee === "string" ? ` of ${row.primary_attendee}` : "";
    return `Check-in successful! ${guest} (Plus One Guest${primary}) has been checked in.`;
  }
  const name = typeof row.attendee_name === "string" ? row.attendee_name : "Attendee";
  return `Check-in successful! ${name} has been checked in.`;
}

function qrCheckInErrorMessage(data: unknown, status: number): string {
  if (data && typeof data === "object") {
    const row = data as Record<string, unknown>;
    if (row.already_checked_in) {
      return "This attendee has already been checked in to the event.";
    }
    if (typeof row.error === "string" && row.error.trim()) return row.error;
  }
  if (status === 404) return "Registration not found. Please verify the QR code.";
  if (status === 401) return "Your session expired. Sign in again and retry.";
  return readStagingActionError({ data, status, ok: false }) ?? "QR check-in failed.";
}

export async function qrCheckInAction(
  eventId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const blocked = requireStaging();
  if (blocked) return blocked;

  const qr_data = (formData.get("qr_data") as string | null)?.trim() ?? "";
  if (!qr_data) return { error: "Scan a guest QR code to check in." };

  let qrJson: Record<string, unknown> | null = null;
  try {
    qrJson = JSON.parse(qr_data) as Record<string, unknown>;
  } catch {
    return {
      error:
        "Invalid QR code format. Scan a valid Grad Pad event registration QR code.",
    };
  }

  const qrEventId = qrJson.event_id != null ? String(qrJson.event_id) : null;
  if (qrEventId && qrEventId !== eventId) {
    const otherTitle =
      typeof qrJson.event_title === "string" ? ` (${qrJson.event_title})` : "";
    return {
      error: `This QR code is for a different event${otherTitle}. Scan a ticket for this event.`,
    };
  }

  const result = await stagingQrCheckInRaw(qr_data);
  if (!result.ok) {
    return { error: qrCheckInErrorMessage(result.data, result.status) };
  }

  invalidateEvent(eventId);
  return { success: qrCheckInSuccessMessage(result.data) };
}

/** Client scanner: submit decoded QR text without a form post. */
export async function submitQrCheckIn(eventId: string, qrData: string): Promise<ActionResult> {
  const formData = new FormData();
  formData.set("qr_data", qrData);
  return qrCheckInAction(eventId, null, formData);
}
