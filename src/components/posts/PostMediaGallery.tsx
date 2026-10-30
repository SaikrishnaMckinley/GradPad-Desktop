"use client";

import type { PostMediaItem } from "@/lib/posts/post-media";
import { cn } from "@/lib/utils/cn";

type Props = {
  items: PostMediaItem[];
  className?: string;
  onOpen?: (index: number) => void;
};

function MediaTile({
  item,
  index,
  className,
  overlay,
  onOpen,
}: {
  item: PostMediaItem;
  index: number;
  className?: string;
  overlay?: string;
  onOpen?: (index: number) => void;
}) {
  const isVideo = item.type.startsWith("video");
  const clickable = Boolean(onOpen) && !isVideo;

  return (
    <button
      type="button"
      className={cn(
        "relative block h-full w-full overflow-hidden bg-neutral-900",
        clickable && "cursor-pointer",
        !clickable && "cursor-default",
        className,
      )}
      onClick={clickable ? () => onOpen?.(index) : undefined}
      disabled={!clickable}
    >
      {isVideo ? (
        <video src={item.url} controls className="h-full w-full object-contain" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.url} alt="" className="h-full w-full object-cover" />
      )}
      {overlay ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-2xl font-semibold text-white">
          {overlay}
        </div>
      ) : null}
    </button>
  );
}

export function PostMediaGallery({ items, className, onOpen }: Props) {
  if (items.length === 0) return null;

  const count = items.length;

  if (count === 1) {
    const item = items[0]!;
    if (item.type.startsWith("video")) {
      return (
        <div className={cn("mt-3 overflow-hidden bg-black", className)}>
          <video src={item.url} controls className="max-h-[520px] w-full object-contain" />
        </div>
      );
    }
    return (
      <div className={cn("mt-3 overflow-hidden bg-neutral-100", className)}>
        <MediaTile item={item} index={0} className="max-h-[520px]" onOpen={onOpen} />
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className={cn("mt-3 grid h-[280px] grid-cols-2 gap-0.5 bg-neutral-200", className)}>
        {items.map((item, index) => (
          <MediaTile key={`${item.url}-${index}`} item={item} index={index} onOpen={onOpen} />
        ))}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className={cn("mt-3 grid h-[360px] grid-cols-2 gap-0.5 bg-neutral-200", className)}>
        <MediaTile item={items[0]!} index={0} className="row-span-2 h-full" onOpen={onOpen} />
        <MediaTile item={items[1]!} index={1} onOpen={onOpen} />
        <MediaTile item={items[2]!} index={2} onOpen={onOpen} />
      </div>
    );
  }

  const visible = items.slice(0, 4);
  const overflow = count > 4 ? count - 4 : 0;

  return (
    <div className={cn("mt-3 grid h-[360px] grid-cols-2 grid-rows-2 gap-0.5 bg-neutral-200", className)}>
      {visible.map((item, index) => {
        const isLast = index === 3 && overflow > 0;
        return (
          <MediaTile
            key={`${item.url}-${index}`}
            item={item}
            index={index}
            onOpen={onOpen}
            overlay={isLast ? `+${overflow}` : undefined}
          />
        );
      })}
    </div>
  );
}
