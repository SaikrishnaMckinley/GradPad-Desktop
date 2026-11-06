export const publicGuestRegistrationKey = (eventId: string) =>
  `public_event_reg_${eventId}`;

export type StoredGuestRegistration = {
  first_name: string;
  last_name: string;
  email: string;
  qr_code?: string;
  registered?: boolean;
};

export function normalizeEventQrCode(qrCode?: string | null): string {
  if (!qrCode) return "";
  const trimmed = qrCode.trim();
  if (trimmed.startsWith("data:")) {
    const commaIndex = trimmed.indexOf(",");
    return commaIndex >= 0 ? trimmed.slice(commaIndex + 1) : trimmed;
  }
  return trimmed;
}

export function eventQrCodeDataUrl(qrCode?: string | null): string | null {
  const normalized = normalizeEventQrCode(qrCode);
  if (!normalized) return null;
  if (qrCode?.trim().startsWith("data:")) return qrCode.trim();
  return `data:image/png;base64,${normalized}`;
}

export function readStoredGuestRegistration(eventId: string): StoredGuestRegistration | null {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(publicGuestRegistrationKey(eventId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredGuestRegistration;
  } catch {
    return null;
  }
}

export function persistGuestRegistration(
  eventId: string,
  payload: StoredGuestRegistration,
): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(
    publicGuestRegistrationKey(eventId),
    JSON.stringify({ ...payload, registered: true }),
  );
}
