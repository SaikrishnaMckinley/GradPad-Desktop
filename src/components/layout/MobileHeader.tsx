"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { GRADPAD_ICON } from "@/lib/fixtures/dev-shell-data";
import type { ShellUser } from "@/types/shell-user";

type MobileHeaderProps = {
  onMenuOpen: () => void;
  shellUser: ShellUser;
};

export function MobileHeader({ onMenuOpen, shellUser }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-[52px] items-center gap-2 border-b border-border bg-card px-2 pr-3 lg:hidden">
      <button
        type="button"
        onClick={onMenuOpen}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-foreground hover:bg-secondary"
        aria-label="Open menu"
      >
        <Menu className="h-[18px] w-[18px]" strokeWidth={2.75} aria-hidden />
      </button>
      <Link
        href="/home"
        className="flex min-w-0 flex-1 items-center justify-center gap-2 py-1"
        aria-label="Grad Pad home"
      >
        <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg">
          <Image
            src={GRADPAD_ICON}
            alt=""
            fill
            className="object-contain p-0.5"
            sizes="32px"
          />
        </span>
        <span className="truncate text-base font-bold leading-none tracking-tight text-foreground">
          Grad Pad
        </span>
      </Link>
      <Link href="/settings" className="shrink-0" aria-label="Settings">
        <Avatar
          src={shellUser.avatarUrl}
          alt={shellUser.fullName}
          fallback={shellUser.fullName}
          size="sm"
        />
      </Link>
    </header>
  );
}
