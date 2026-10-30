import Image from "next/image";
import Link from "next/link";
import { GRADPAD_ICON } from "@/lib/fixtures/dev-shell-data";
import { cn } from "@/lib/utils/cn";

type GradPadLogoProps = {
  className?: string;
  compact?: boolean;
};

export function GradPadLogo({ className, compact }: GradPadLogoProps) {
  return (
    <Link
      href="/home"
      className={cn("flex items-center gap-2.5 text-foreground", className)}
    >
      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl shadow-sm">
        <Image
          src={GRADPAD_ICON}
          alt=""
          fill
          className="object-contain p-0.5"
          sizes="48px"
          priority
        />
      </span>
      {!compact && (
        <span className="text-[20px] font-bold leading-none tracking-tight">
          Grad Pad
        </span>
      )}
    </Link>
  );
}
