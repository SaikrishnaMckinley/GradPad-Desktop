"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Settings, User } from "lucide-react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { cn } from "@/lib/utils/cn";

type Props = {
  profileHref: string;
};

export function SidebarAccountMenu({ profileHref }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-card hover:text-foreground",
          open && "bg-card text-foreground",
        )}
        aria-label="Account menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>
      {open ? (
        <div className="absolute bottom-full right-0 z-50 mb-2 w-52 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-lg">
          <Link
            href={profileHref}
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-page-secondary"
            onClick={() => setOpen(false)}
          >
            <User className="h-4 w-4 text-muted-foreground" />
            View profile
          </Link>
          <Link
            href="/settings/profile"
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-page-secondary"
            onClick={() => setOpen(false)}
          >
            <Settings className="h-4 w-4 text-muted-foreground" />
            Profile settings
          </Link>
          <Link
            href="/settings/account"
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-page-secondary"
            onClick={() => setOpen(false)}
          >
            <Settings className="h-4 w-4 text-muted-foreground" />
            Account & password
          </Link>
          <div className="my-1 border-t border-border" />
          <div className="px-2 py-1">
            <SignOutButton
              variant="ghost"
              className="h-9 w-full justify-start gap-2 px-2 text-sm font-normal text-error hover:bg-error/10 hover:text-error"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
