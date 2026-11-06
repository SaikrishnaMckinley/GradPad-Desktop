"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  normalizeReactionType,
  POST_REACTIONS,
  reactionMeta,
  type PostReactionType,
} from "@/lib/posts/post-reactions";
import { cn } from "@/lib/utils/cn";

type Props = {
  likedByMe: boolean;
  reactionType: PostReactionType;
  onToggle: (category: PostReactionType) => void;
  className?: string;
};

export function PostReactionLikeButton({
  likedByMe,
  reactionType,
  onToggle,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const active = normalizeReactionType(reactionType);
  const meta = reactionMeta(likedByMe ? active : "like");
  const label = likedByMe ? meta.label : "Like";

  useEffect(() => {
    if (!open) return;
    function onDocDown(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [open]);

  function clearCloseTimer() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function scheduleClose() {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setOpen(false), 180);
  }

  function pick(type: PostReactionType) {
    setOpen(false);
    onToggle(type);
  }

  function onMainClick() {
    if (likedByMe) {
      onToggle(active);
    } else {
      onToggle("like");
    }
  }

  return (
    <div
      ref={wrapRef}
      className={cn("relative flex flex-1", className)}
      onMouseEnter={() => {
        clearCloseTimer();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      {open ? (
        <div
          className="absolute bottom-[calc(100%+8px)] left-1/2 z-20 flex -translate-x-1/2 items-center gap-0.5 rounded-full border border-border bg-card px-1.5 py-1 shadow-lg"
          onMouseEnter={clearCloseTimer}
          onMouseLeave={scheduleClose}
        >
          {POST_REACTIONS.map((r) => (
            <button
              key={r.type}
              type="button"
              title={r.label}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-125"
              onClick={() => pick(r.type)}
            >
              <Image src={r.icon} alt="" width={22} height={22} className="h-[22px] w-[22px]" />
            </button>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        className={cn(
          "flex flex-1 items-center justify-center gap-2 rounded-md py-3 text-sm font-semibold transition-colors hover:bg-page-secondary",
          likedByMe ? "text-primary" : "text-muted-foreground",
        )}
        onClick={onMainClick}
      >
        <Image
          src={likedByMe ? meta.icon : "/svgs/unlike.svg"}
          alt=""
          width={18}
          height={18}
          className="h-[18px] w-[18px]"
        />
        {label}
      </button>
    </div>
  );
}
