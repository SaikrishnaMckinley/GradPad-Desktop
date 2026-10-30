"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { PRIMARY_NAV } from "@/types/navigation";
import type { ShellUser } from "@/types/shell-user";
import { cn } from "@/lib/utils/cn";

type TopNavigationProps = {
  shellUser: ShellUser;
};

export function TopNavigation({ shellUser }: TopNavigationProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 hidden border-b border-border bg-card/95 backdrop-blur-sm lg:block">
      <div className="flex h-[62px] items-center gap-4 px-6">
        <nav
          className="flex shrink-0 items-center gap-1"
          aria-label="Primary"
        >
          {PRIMARY_NAV.map((item) => {
            const active = item.match?.(pathname) ?? pathname === item.href;
            const Icon = item.icon;
            const isCreate = item.label === "Create";
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                {item.label}
                {active && (
                  <span className="absolute -bottom-[13px] left-3 right-3 h-0.5 rounded-full bg-primary" />
                )}
                {isCreate && !active && (
                  <span className="sr-only">Create</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
          <div className="relative w-full max-w-[min(100%,28rem)]">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground/80"
              strokeWidth={2}
            />
            <input
              type="search"
              readOnly
              placeholder="Search Grad Pad"
              className="h-11 w-full rounded-xl border border-border bg-page-secondary pl-11 pr-[4.75rem] text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              aria-label="Search Grad Pad"
            />
            <kbd className="pointer-events-none absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center rounded-lg border border-border bg-card px-2 py-1 text-[11px] font-medium leading-none text-muted-foreground">
              <span aria-hidden>⌘</span>
              <span className="ml-1" aria-hidden>
                K
              </span>
            </kbd>
          </div>

          <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" strokeWidth={2} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-error ring-2 ring-card" />
          </Link>
          <Link
            href={
              shellUser.username ? `/profile/${shellUser.username}` : "/settings/profile"
            }
            aria-label="Your profile"
          >
            <Avatar
              src={shellUser.avatarUrl}
              alt={shellUser.fullName}
              fallback={shellUser.fullName}
              size="md"
            />
          </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
