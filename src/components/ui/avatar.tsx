"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { displayInitials, isUsableImageUrl } from "@/lib/utils/initials";
import { cn } from "@/lib/utils/cn";

type AvatarProps = {
  src?: string | null;
  alt: string;
  fallback: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizeMap = {
  xs: "h-7 w-7 text-[11px]",
  sm: "h-9 w-9 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

export function Avatar({
  src,
  alt,
  fallback,
  size = "md",
  className,
}: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const initials = displayInitials(fallback || alt);
  const showImage = isUsableImageUrl(src) && !failed;

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (showImage) {
    return (
      <Image
        src={src}
        alt={alt || fallback || "Profile photo"}
        width={64}
        height={64}
        unoptimized
        onError={() => setFailed(true)}
        className={cn(
          "shrink-0 rounded-full object-cover ring-2 ring-card",
          sizeMap[size],
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-secondary font-semibold text-muted-foreground ring-2 ring-card",
        sizeMap[size],
        className,
      )}
      role="img"
      aria-label={alt || fallback || "Profile"}
      title={alt || fallback}
    >
      {initials}
    </div>
  );
}
