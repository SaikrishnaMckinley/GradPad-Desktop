import Image from "next/image";
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
  const initials = fallback.slice(0, 2).toUpperCase();

  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        width={48}
        height={48}
        className={cn(
          "rounded-full object-cover ring-2 ring-card",
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
      aria-hidden={alt ? undefined : true}
    >
      <span aria-label={alt}>{initials}</span>
    </div>
  );
}
