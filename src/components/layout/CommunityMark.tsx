"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { displayInitials, isUsableImageUrl } from "@/lib/utils/initials";
import { cn } from "@/lib/utils/cn";

type CommunityMarkProps = {
  name: string;
  initials: string;
  accentColor: string;
  logoUrl?: string | null;
  size?: "sm" | "md" | "lg";
  shape?: "circle" | "rounded";
  className?: string;
};

export function CommunityMark({
  name,
  initials,
  accentColor,
  logoUrl,
  size = "md",
  shape = "circle",
  className,
}: CommunityMarkProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [logoUrl]);

  const dim =
    size === "sm"
      ? "h-9 w-9 text-xs"
      : size === "lg"
        ? "h-12 w-12 text-base"
        : "h-10 w-10 text-sm";
  const radius = shape === "rounded" ? "rounded-2xl" : "rounded-full";
  const label = (initials || displayInitials(name, 2)).slice(0, 2).toUpperCase();
  const showLogo = isUsableImageUrl(logoUrl) && !failed;

  if (showLogo) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden bg-white shadow-sm ring-1 ring-border/40",
          radius,
          dim,
          className,
        )}
        title={name}
      >
        <Image
          src={logoUrl}
          alt={name}
          fill
          unoptimized
          className="object-contain p-1"
          sizes={size === "lg" ? "48px" : size === "sm" ? "36px" : "40px"}
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center font-bold text-white shadow-sm",
        radius,
        dim,
        className,
      )}
      style={{ backgroundColor: accentColor }}
      title={name}
      role="img"
      aria-label={name}
    >
      {label.slice(0, 1)}
    </div>
  );
}
