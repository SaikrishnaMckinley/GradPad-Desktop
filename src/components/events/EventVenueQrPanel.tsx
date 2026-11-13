"use client";

import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { fetchEventVenueCheckInQr } from "@/lib/api/event-self-checkin-client";

type Props = {
  eventId: string;
};

export function EventVenueQrPanel({ eventId }: Props) {
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await fetchEventVenueCheckInQr(eventId);
        if (cancelled) return;
        setQrCode(data.qr_code ?? null);
        setHint(data.self_checkin?.message ?? null);
      } catch {
        if (!cancelled) setError("Could not load venue QR.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  return (
    <Card className="space-y-3 p-4">
      <div>
        <h2 className="text-sm font-semibold">Venue self check-in QR</h2>
        <p className="text-sm text-muted-foreground">
          Display at the door. Attendees scan with Grad Pad to check themselves in.
        </p>
      </div>
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {qrCode && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={qrCode}
          alt="Venue self check-in QR"
          className="mx-auto w-full max-w-[240px]"
        />
      )}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {qrCode && (
        <a
          href={qrCode}
          download={`event-${eventId}-check-in-qr.png`}
          className={cn(buttonVariants({ variant: "outline" }), "w-full")}
        >
          Download QR
        </a>
      )}
    </Card>
  );
}
