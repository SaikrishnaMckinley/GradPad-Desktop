"use client";

import Link from "next/link";
import { Bell, Menu, Search } from "lucide-react";
import { GradPadLogo } from "@/components/brand/GradPadLogo";
import { Avatar } from "@/components/ui/avatar";
import type { ShellUser } from "@/types/shell-user";

type MobileHeaderProps = {
  onMenuOpen: () => void;
  shellUser: ShellUser;
};

export function MobileHeader({ onMenuOpen, shellUser }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-border bg-card px-4 lg:hidden">
      <button
        type="button"
        onClick={onMenuOpen}
        className="flex h-10 w-10 items-center justify-center rounded-xl text-foreground hover:bg-secondary"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <GradPadLogo compact className="absolute left-1/2 -translate-x-1/2" />
      <div className="flex items-center gap-1">
        <Link
          href="/search"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </Link>
        <Link
          href="/notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2.5 top-2 h-1.5 w-1.5 rounded-full bg-error" />
        </Link>
        <Link href="/settings" aria-label="Settings">
          <Avatar
            src={shellUser.avatarUrl}
            alt={shellUser.fullName}
            fallback={shellUser.fullName}
            size="sm"
          />
        </Link>
      </div>
    </header>
  );
}
