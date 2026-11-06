"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

/** Sticky top offset so the rail’s bottom meets the viewport bottom, then it stops scrolling. */
const VIEWPORT_CHROME_PX = 62 + 24; // top nav (~3.875rem) + page padding

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function StickyScrollRail({ children, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [topPx, setTopPx] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      if (typeof window === "undefined") return;
      if (!window.matchMedia("(min-width: 1280px)").matches) {
        setTopPx(0);
        return;
      }
      const railHeight = el.offsetHeight;
      const next = Math.max(0, window.innerHeight - railHeight - VIEWPORT_CHROME_PX);
      setTopPx(next);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn("xl:sticky", className)}
      style={{ top: topPx }}
    >
      {children}
    </div>
  );
}
