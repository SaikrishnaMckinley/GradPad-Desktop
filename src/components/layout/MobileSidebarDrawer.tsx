"use client";

import { X } from "lucide-react";
import { GradPadLogo } from "@/components/brand/GradPadLogo";
import { SidebarCommunityNav } from "@/components/layout/SidebarCommunityNav";
import { SidebarUserFooter } from "@/components/layout/SidebarUserFooter";
import type { ShellCommunityContext } from "@/lib/communities/shell-data";
import type { ShellUser } from "@/types/shell-user";

type MobileSidebarDrawerProps = {
  open: boolean;
  onClose: () => void;
  shellUser: ShellUser;
  communityContext: ShellCommunityContext;
};

export function MobileSidebarDrawer({
  open,
  onClose,
  shellUser,
  communityContext,
}: MobileSidebarDrawerProps) {
  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-[1px] lg:hidden"
        aria-label="Close menu"
        onClick={onClose}
      />
      <aside className="fixed inset-y-0 left-0 z-50 flex w-[min(300px,88vw)] flex-col bg-card shadow-xl lg:hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <GradPadLogo />
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-secondary"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4" onClick={onClose}>
          <SidebarCommunityNav communityContext={communityContext} />
        </div>
        <SidebarUserFooter shellUser={shellUser} />
      </aside>
    </>
  );
}
