"use client";

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
  const plain = plainTextFromPostHtml(html);
  if (!plain) return null;

  const safe = sanitizePostHtml(html);
  const showMore = collapseLines && !expanded && plain.length > 280;

  return (
    <div className={className}>
      <div
        className={cn(
          "text-sm leading-relaxed text-foreground [&_strong]:font-semibold",
          showMore && "line-clamp-6",
        )}
        dangerouslySetInnerHTML={{ __html: safe }}
      />
      {showMore && onExpand ? (
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
