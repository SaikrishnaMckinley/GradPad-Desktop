"use client";

import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { shareCommunityInviteLink } from "@/lib/communities/community-share";
import { cn } from "@/lib/utils/cn";

type Props = {
  communityId: string;
  communityName: string;
  className?: string;
};

export function CommunityShareLinkButton({ communityId, communityName, className }: Props) {
  async function onShare() {
    try {
      const result = await shareCommunityInviteLink(communityId, communityName);
      if (result === "copied") toast.success("Invite link copied to clipboard");
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
        "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-page-secondary",
        className,
      )}
      aria-label="Share community invite link"
    >
      <ExternalLink className="h-4 w-4" />
    </button>
  );
}
