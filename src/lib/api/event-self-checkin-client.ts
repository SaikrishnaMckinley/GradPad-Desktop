import { apiGet, apiPost } from "@/lib/api/http";

export type EventSelfCheckInStatus = {
  self_checkin?: {
    enabled?: boolean;
    is_open?: boolean;
    message?: string;
    opens_at?: string | null;
    closes_at?: string | null;
  };
  can_self_check_in?: boolean;
  has_registration?: boolean;
};

export async function fetchEventSelfCheckInStatus(eventId: string) {
  return apiGet<EventSelfCheckInStatus>(
    `events/payments/${eventId}/self-checkin/status/`,
  );
}

export async function fetchEventVenueCheckInQr(eventId: string) {
  return apiGet<{
    qr_code?: string;
    qr_payload?: Record<string, unknown>;
    self_checkin?: EventSelfCheckInStatus["self_checkin"];
  }>(`events/payments/${eventId}/self-checkin/venue-qr/`);
}

export async function submitEventSelfCheckInScan(
  eventId: string,
  qr_data: string | Record<string, unknown>,
) {
  return apiPost<{ success?: boolean; message?: string }>(
    `events/payments/${eventId}/self-checkin/scan/`,
    { qr_data },
  );
}
