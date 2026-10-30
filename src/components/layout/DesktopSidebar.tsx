"use client";

import { GradPadLogo } from "@/components/brand/GradPadLogo";
import { SidebarCommunityNav } from "@/components/layout/SidebarCommunityNav";
import { SidebarUserFooter } from "@/components/layout/SidebarUserFooter";
import type { ShellCommunityContext } from "@/lib/communities/shell-data";
import type { ShellUser } from "@/types/shell-user";

type DesktopSidebarProps = {
  shellUser: ShellUser;
  communityContext: ShellCommunityContext;
};

export function DesktopSidebar({ shellUser, communityContext }: DesktopSidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden h-dvh w-[276px] flex-col border-r border-border bg-card lg:flex">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4 pt-5">
        <GradPadLogo className="mb-6 px-1" />
        <SidebarCommunityNav communityContext={communityContext} />
      </div>

      <SidebarUserFooter shellUser={shellUser} />
    </aside>
  );
}
