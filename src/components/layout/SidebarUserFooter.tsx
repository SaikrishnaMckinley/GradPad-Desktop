"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { SidebarAccountMenu } from "@/components/layout/SidebarAccountMenu";
import type { ShellUser } from "@/types/shell-user";

type SidebarUserFooterProps = {
  shellUser: ShellUser;
};

export function SidebarUserFooter({ shellUser }: SidebarUserFooterProps) {
  const profileHref = shellUser.username
    ? `/profile/${shellUser.username}`
    : "/settings/profile";

  return (
    <div className="p-4 pt-3">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-page-secondary/70 p-3">
        <Avatar
          src={shellUser.avatarUrl}
          alt={shellUser.fullName}
          fallback={shellUser.fullName}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight text-foreground">
            {shellUser.fullName}
          </p>
          <Link
            href={profileHref}
            className="mt-0.5 inline-block text-xs text-muted-foreground hover:text-primary hover:underline"
          >
            View profile
          </Link>
        </div>
        <SidebarAccountMenu profileHref={profileHref} />
      </div>
    </div>
  );
}
