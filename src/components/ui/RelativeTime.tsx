"use client";

import { useEffect, useState } from "react";
import { formatTimeAgo } from "@/lib/utils/time-ago";

type Props = {
  iso: string;
  className?: string;
};

/** Avoids Date.now() during SSR/prerender (Cache Components instant navigation). */
export function RelativeTime({ iso, className }: Props) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    setLabel(formatTimeAgo(iso));
    const id = window.setInterval(() => setLabel(formatTimeAgo(iso)), 60_000);
    return () => window.clearInterval(id);
  }, [iso]);

  return <span className={className}>{label || "…"}</span>;
}
