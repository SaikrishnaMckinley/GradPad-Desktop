"use client";

import { useEffect, useRef, useState } from "react";
import {
  Copy,
  Mail,
  MessageCircle,
  Share2,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  canUseNativeShare,
  copyCommunityInviteLink,
  emailInviteShareUrl,
  nativeShareCommunityInvite,
  smsInviteShareUrl,
  whatsAppInviteShareUrl,
} from "@/lib/communities/community-share";
import { cn } from "@/lib/utils/cn";

type Props = {
  communityId: string;
  communityName: string;
  variant?: "icon" | "button";
  className?: string;
};

export function CommunityShareMenu({
  communityId,
  communityName,
  variant = "icon",
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  async function onCopy() {
    try {
      await copyCommunityInviteLink(communityId);
      toast.success("Invite link copied");
      setOpen(false);
    } catch {
      toast.error("Could not copy link");
    }
  }

  async function onNativeShare() {
    try {
      await nativeShareCommunityInvite(communityId, communityName);
      setOpen(false);
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return;
      toast.error("Sharing is not available on this device");
    }
  }

  function openExternal(href: string) {
    window.open(href, "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  const showNative = canUseNativeShare();

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {variant === "icon" ? (
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-page-secondary"
          aria-label="Share community invite"
          aria-expanded={open}
          title="Share invite link"
          onClick={() => setOpen((v) => !v)}
        >
          <Share2 className="h-4 w-4" />
        </button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 border-primary-border text-primary hover:bg-primary-light"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      )}

      {open ? (
        <div
          className="absolute right-0 top-full z-50 mt-1 min-w-[220px] overflow-hidden rounded-xl border border-border bg-card py-1 shadow-card"
          role="menu"
        >
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-foreground hover:bg-page-secondary"
            onClick={() => void onCopy()}
          >
            <Copy className="h-4 w-4 shrink-0 text-muted-foreground" />
            Copy link
          </button>

          {showNative ? (
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-foreground hover:bg-page-secondary"
              onClick={() => void onNativeShare()}
            >
              <Share2 className="h-4 w-4 shrink-0 text-muted-foreground" />
              Share to apps…
            </button>
          ) : null}

          <div className="my-1 border-t border-border" role="separator" />

          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-foreground hover:bg-page-secondary"
            onClick={() => openExternal(whatsAppInviteShareUrl(communityId, communityName))}
          >
            <MessageCircle className="h-4 w-4 shrink-0 text-[#25D366]" />
            WhatsApp
          </button>

          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-foreground hover:bg-page-secondary"
            onClick={() => {
              window.location.href = emailInviteShareUrl(communityId, communityName);
              setOpen(false);
            }}
          >
            <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
            Email
          </button>

          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-foreground hover:bg-page-secondary md:hidden"
            onClick={() => {
              window.location.href = smsInviteShareUrl(communityId, communityName);
              setOpen(false);
            }}
          >
            <Smartphone className="h-4 w-4 shrink-0 text-muted-foreground" />
            Messages
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** @deprecated Use CommunityShareMenu */
export function CommunityShareLinkButton(props: Omit<Props, "variant">) {
  return <CommunityShareMenu {...props} variant="icon" />;
}
