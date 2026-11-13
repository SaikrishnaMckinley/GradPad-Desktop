"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  fetchEventSelfCheckInStatus,
  submitEventSelfCheckInScan,
} from "@/lib/api/event-self-checkin-client";

const EventQrScannerPanel = dynamic(
  () =>
    import("@/components/events/EventQrScannerPanel").then((m) => m.EventQrScannerPanel),
  { ssr: false, loading: () => <p className="text-sm text-muted-foreground">Loading scanner…</p> },
);

type Props = {
  eventId: string;
  onCheckedIn?: () => void;
};

export function EventSelfCheckInPanel({ eventId, onCheckedIn }: Props) {
  const [statusLoading, setStatusLoading] = useState(true);
  const [canScan, setCanScan] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const { data } = await fetchEventSelfCheckInStatus(eventId);
      setCanScan(Boolean(data.can_self_check_in));
      setHint(data.self_checkin?.message ?? null);
    } catch {
      setCanScan(false);
      setHint("Sign in and register to use self check-in.");
    } finally {
      setStatusLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  const handleScan = useCallback(
    async (decodedText: string) => {
      setError(null);
      let qrPayload: string | Record<string, unknown> = decodedText;
      try {
        const parsed = JSON.parse(decodedText);
        qrPayload = (parsed.qr_payload || parsed.qr_data || parsed) as Record<
          string,
          unknown
        >;
      } catch {
        qrPayload = decodedText;
      }

      try {
        const { data } = await submitEventSelfCheckInScan(eventId, qrPayload);
        setMessage(data.message ?? "You are checked in!");
        setScannerOpen(false);
        onCheckedIn?.();
        await refreshStatus();
      } catch (err: unknown) {
        const raw =
          err &&
          typeof err === "object" &&
          "response" in err
            ? (err as { response?: { data?: { error?: unknown } } }).response?.data
                ?.error
            : undefined;
        const apiErr = typeof raw === "string" && raw.trim() ? raw : "Check-in failed.";
        setError(apiErr);
        throw new Error(apiErr);
      }
    },
    [eventId, onCheckedIn, refreshStatus],
  );

  return (
    <Card className="space-y-3 p-4">
      <h2 className="text-sm font-semibold">Self check-in</h2>
      {statusLoading && (
        <p className="text-sm text-muted-foreground">Checking eligibility…</p>
      )}
      {!statusLoading && (
        <p className="text-sm text-muted-foreground">
          {canScan
            ? "Scan the QR code posted at the venue."
            : hint ?? "Self check-in is not available right now."}
        </p>
      )}
      {message && <p className="text-sm font-medium text-emerald-700">{message}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {canScan && !scannerOpen && (
        <Button type="button" className="w-full" onClick={() => setScannerOpen(true)}>
          Open scanner
        </Button>
      )}
      {scannerOpen && (
        <div className="space-y-2">
          <EventQrScannerPanel onScan={handleScan} />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setScannerOpen(false)}
          >
            Close scanner
          </Button>
        </div>
      )}
    </Card>
  );
}
