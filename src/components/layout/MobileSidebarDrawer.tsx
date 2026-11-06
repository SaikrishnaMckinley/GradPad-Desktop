"use client";

import { X } from "lucide-react";
import { GradPadLogo } from "@/components/brand/GradPadLogo";
import { SidebarCommunityNav } from "@/components/layout/SidebarCommunityNav";
import { SidebarUserFooter } from "@/components/layout/SidebarUserFooter";
import type { ShellCommunityContext } from "@/lib/communities/shell-data";
import type { ShellUser } from "@/types/shell-user";
import { cn } from "@/lib/utils/cn";

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
  return (
    <>
      <button
        type="button"
        className={cn(
          "fixed inset-0 z-40 bg-foreground/20 backdrop-blur-[1px] transition-opacity duration-300 ease-out lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-label="Close menu"
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(300px,88vw)] max-w-[100vw] flex-col bg-card shadow-xl transition-transform duration-300 ease-out will-change-transform lg:hidden",
          open ? "translate-x-0" : "pointer-events-none -translate-x-full",
        )}
        aria-hidden={!open}
        inert={open ? undefined : true}
      >
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
