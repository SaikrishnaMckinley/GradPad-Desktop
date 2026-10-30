"use client";

import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { shareEventLink } from "@/lib/events/event-share";
import { cn } from "@/lib/utils/cn";

type Props = {
  eventId: string;
  title?: string;
  className?: string;
};

export function EventShareLinkButton({ eventId, title, className }: Props) {
  async function onShare() {
    try {
      const result = await shareEventLink(eventId, title);
      if (result === "copied") toast.success("Link copied to clipboard");
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return;
      toast.error("Unable to share link. Please try again.");
    }
  }

  return (
    <button
      type="button"
      onClick={() => void onShare()}
      className={cn(
        "flex h-10 w-[11.625rem] max-w-full shrink-0 items-center justify-center gap-2 rounded-[10px] border border-border bg-card px-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-page-secondary",
        className,
      )}
    >
      Share Link
      <ExternalLink className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}
