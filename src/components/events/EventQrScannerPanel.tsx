"use client";

import { Html5Qrcode } from "html5-qrcode";
import { Flashlight, ScanLine } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { submitQrCheckIn } from "@/lib/events/manage-actions";
import { cn } from "@/lib/utils/cn";

const SCANNER_ID = "gradpad-event-qr-reader";
const SCAN_DEBOUNCE_MS = 2500;

type Props = {
  eventId: string;
  onCheckedIn: () => void;
};

export function EventQrScannerPanel({ eventId, onCheckedIn }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingRef = useRef(false);
  const lastScanRef = useRef<{ text: string; at: number } | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [starting, setStarting] = useState(false);

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner) {
      setIsScanning(false);
      return;
    }
    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
      scanner.clear();
    } catch {
      /* ignore stop races */
    }
    scannerRef.current = null;
    setIsScanning(false);
  }, []);

  const handleDecoded = useCallback(
    async (decodedText: string) => {
      if (processingRef.current) return;

      const now = Date.now();
      const last = lastScanRef.current;
      if (last && last.text === decodedText && now - last.at < SCAN_DEBOUNCE_MS) {
        return;
      }

      processingRef.current = true;
      lastScanRef.current = { text: decodedText, at: now };

      await stopScanner();

      const result = await submitQrCheckIn(eventId, decodedText);
      if (result.error) {
        toast.error(result.error);
      } else if (result.success) {
        toast.success(result.success);
        onCheckedIn();
      }

      processingRef.current = false;
    },
    [eventId, onCheckedIn, stopScanner],
  );

  const startScanner = useCallback(async () => {
    if (isScanning || starting || processingRef.current) return;

    setStarting(true);
    try {
      await stopScanner();

      const scanner = new Html5Qrcode(SCANNER_ID);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          aspectRatio: 1,
          disableFlip: false,
        },
        (text) => {
          void handleDecoded(text);
        },
        () => {
          /* scan miss — ignore */
        },
      );

      setIsScanning(true);
    } catch (err) {
      scannerRef.current = null;
      setIsScanning(false);
      const message =
        err instanceof Error ? err.message : "Could not access the camera.";
      toast.error(
        message.includes("NotAllowed")
          ? "Camera permission is required for QR check-in."
          : `Camera error: ${message}`,
      );
    } finally {
      setStarting(false);
    }
  }, [handleDecoded, isScanning, starting, stopScanner]);

  useEffect(() => {
    return () => {
      void stopScanner();
    };
  }, [stopScanner]);

  async function toggleFlash() {
    const scanner = scannerRef.current;
    if (!scanner || !isScanning) {
      setFlashOn((v) => !v);
      return;
    }
    const next = !flashOn;
    try {
      await scanner.applyVideoConstraints({
        advanced: [{ torch: next }],
      } as unknown as MediaTrackConstraints);
      setFlashOn(next);
    } catch {
      setFlashOn(next);
    }
  }

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border bg-black/90",
          isScanning ? "min-h-[min(72vw,420px)]" : "min-h-[280px]",
        )}
      >
        <div id={SCANNER_ID} className="h-full w-full [&_video]:!h-full [&_video]:!object-cover" />
        {!isScanning ? (
          <button
            type="button"
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-page-secondary/95 text-foreground transition hover:bg-page-secondary"
            onClick={() => void startScanner()}
            disabled={starting}
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary">
              <ScanLine className="h-7 w-7" />
            </span>
            <span className="text-sm font-medium">
              {starting ? "Starting camera…" : "Tap to start scanning"}
            </span>
            <span className="text-xs text-muted-foreground">Use the rear camera like Grad Pad web</span>
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {isScanning ? (
          <Button type="button" variant="secondary" onClick={() => void stopScanner()}>
            Stop scanner
          </Button>
        ) : (
          <Button type="button" onClick={() => void startScanner()} disabled={starting}>
            {starting ? "Starting…" : "Start check-in scanner"}
          </Button>
        )}
        <Button type="button" variant="outline" className="gap-2" onClick={() => void toggleFlash()}>
          <Flashlight className="h-4 w-4" />
          {flashOn ? "Flash on" : "Flash off"}
        </Button>
      </div>
    </div>
  );
}
