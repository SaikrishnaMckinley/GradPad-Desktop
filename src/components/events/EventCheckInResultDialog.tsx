"use client";

import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Variant = "loading" | "success" | "error";

type Props = {
  open: boolean;
  variant: Variant;
  message: string;
  onClose: () => void;
};

export function EventCheckInResultDialog({ open, variant, message, onClose }: Props) {
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!open || variant === "loading") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, variant, onClose]);

  if (!open || typeof document === "undefined") return null;

  const title =
    variant === "loading"
      ? "Checking in…"
      : variant === "error"
        ? "Check-in failed"
        : "Check-in successful";

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/45 backdrop-blur-[2px]"
        aria-label="Dismiss"
        onClick={variant === "loading" ? undefined : onClose}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
      >
        <div className="px-6 pt-8 pb-2 text-center">
          {variant === "loading" ? (
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" aria-hidden />
          ) : variant === "error" ? (
            <XCircle className="mx-auto mb-4 h-12 w-12 text-error" aria-hidden />
          ) : (
            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-success" aria-hidden />
          )}
          <h2 id={titleId} className="text-lg font-semibold tracking-tight">
            {title}
          </h2>
          <p id={descId} className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {message}
          </p>
        </div>
        <div className="px-6 pb-6 pt-4">
          <Button
            type="button"
            className="w-full"
            disabled={variant === "loading"}
            onClick={onClose}
          >
            {variant === "loading" ? "Checking in…" : "Done"}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
