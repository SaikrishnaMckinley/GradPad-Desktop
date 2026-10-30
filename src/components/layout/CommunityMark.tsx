import Image from "next/image";
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
  const dim =
    size === "sm"
      ? "h-9 w-9 text-xs"
      : size === "lg"
        ? "h-12 w-12 text-base"
        : "h-10 w-10 text-sm";
  const radius = shape === "rounded" ? "rounded-2xl" : "rounded-full";

  if (logoUrl) {
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
          alt=""
          fill
          className="object-contain p-1"
          sizes={size === "lg" ? "48px" : size === "sm" ? "36px" : "40px"}
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
      aria-hidden
    >
      {initials.slice(0, 1)}
    </div>
  );
}
