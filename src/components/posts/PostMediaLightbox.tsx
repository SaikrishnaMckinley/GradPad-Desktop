"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { PostMediaItem } from "@/lib/posts/post-media";
import { cn } from "@/lib/utils/cn";

type Props = {
  open: boolean;
  items: PostMediaItem[];
  initialIndex?: number;
  onClose: () => void;
  sidebar: React.ReactNode;
};

export function PostMediaLightbox({
  open,
  items,
  initialIndex = 0,
  onClose,
  sidebar,
}: Props) {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (open) setIndex(initialIndex);
  }, [open, initialIndex]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setIndex((i) => Math.min(items.length - 1, i + 1));
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, items.length, onClose]);

  const goPrev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const goNext = useCallback(
    () => setIndex((i) => Math.min(items.length - 1, i + 1)),
    [items.length],
  );

  if (!open || items.length === 0) return null;

  const current = items[index]!;
  const isVideo = current.type.startsWith("video");

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 md:p-6"
      role="dialog"
      aria-modal
      onClick={onClose}
    >
      <div
        className="flex h-[min(720px,92vh)] w-full max-w-6xl overflow-hidden rounded-lg bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex min-w-0 flex-1 items-center justify-center bg-black">
          {isVideo ? (
            <video src={current.url} controls className="max-h-full max-w-full object-contain" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={current.url} alt="" className="max-h-full max-w-full object-contain" />
          )}
          {items.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous image"
                className={cn(
                  "absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70",
                  index === 0 && "pointer-events-none opacity-30",
                )}
                onClick={goPrev}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                aria-label="Next image"
                className={cn(
                  "absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70",
                  index >= items.length - 1 && "pointer-events-none opacity-30",
                )}
                onClick={goNext}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              <p className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
                {index + 1} / {items.length}
              </p>
            </>
          ) : null}
        </div>

        <div className="flex w-full max-w-md flex-col border-l border-border bg-card">
          <div className="flex justify-end border-b border-border p-2">
            <button
              type="button"
              aria-label="Close"
              className="rounded-full p-2 text-muted-foreground hover:bg-page-secondary hover:text-foreground"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">{sidebar}</div>
        </div>
      </div>
    </div>
  );
}
