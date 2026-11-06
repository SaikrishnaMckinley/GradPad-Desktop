"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { plainTextFromPostHtml, sanitizePostHtml } from "@/lib/posts/rich-text";
import { cn } from "@/lib/utils/cn";

type Props = {
  html: string;
  expanded?: boolean;
  onExpand?: () => void;
  collapseLines?: boolean;
  className?: string;
};

export function PostContentBody({
  html,
  expanded = true,
  onExpand,
  collapseLines = true,
  className,
}: Props) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);

  const plain = plainTextFromPostHtml(html);
  const safe = sanitizePostHtml(html);
  const clamped = collapseLines && !expanded && Boolean(plain);

  useLayoutEffect(() => {
    if (!clamped) {
      setOverflows(false);
      return;
    }
    const el = bodyRef.current;
    if (!el) return;

    const measure = () => {
      setOverflows(el.scrollHeight > el.clientHeight + 2);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [html, clamped, safe]);

  if (!plain) return null;

  const showMore = clamped && overflows && onExpand;

  return (
    <div className={className}>
      <div
        ref={bodyRef}
        className={cn(
          "text-sm leading-relaxed text-foreground [&_strong]:font-semibold",
          clamped && "line-clamp-6",
        )}
        dangerouslySetInnerHTML={{ __html: safe }}
      />
      {showMore ? (
        <button
          type="button"
          className="mt-1 text-sm font-semibold text-muted-foreground hover:text-primary hover:underline"
          onClick={onExpand}
        >
          …more
        </button>
      ) : null}
    </div>
  );
}
