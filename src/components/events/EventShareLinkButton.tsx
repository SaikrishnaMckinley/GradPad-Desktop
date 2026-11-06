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
        "inline-flex h-9 min-h-0 w-[10.25rem] max-w-full shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-[9px] border border-border bg-card px-2.5 text-xs font-medium leading-none text-foreground shadow-sm transition-colors hover:bg-page-secondary md:h-10 md:w-[11.625rem] md:gap-2 md:rounded-[10px] md:px-3 md:text-sm",
        className,
      )}
    >
      Share Link
      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground md:h-4 md:w-4" />
    </button>
  );
}
