"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Pencil } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Props = {
  communitySlug: string;
  canManage: boolean;
};

export function CommunityMoreMenu({ communitySlug, canManage }: Props) {
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

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-page-secondary"
        aria-label="More options"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>
      {open ? (
        <div
          className="absolute right-0 top-full z-50 mt-1 min-w-[180px] overflow-hidden rounded-xl border border-border bg-card py-1 shadow-card"
          role="menu"
        >
          {canManage ? (
            <Link
              href={`/communities/${communitySlug}/edit`}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-page-secondary",
              )}
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              <Pencil className="h-4 w-4 text-muted-foreground" />
              Edit community
            </Link>
          ) : (
            <p className="px-3 py-2 text-xs text-muted-foreground">No actions available</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
