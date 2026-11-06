"use client";

import Link from "next/link";
import { profilePath } from "@/lib/profiles/profile-links";
import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

type Props = {
  userId?: string | null;
  children: ReactNode;
  className?: string;
};

export function ProfileNameLink({ userId, children, className }: Props) {
  if (!userId?.trim()) {
    return <span className={className}>{children}</span>;
  }

  return (
    <Link
      href={profilePath(userId)}
      className={cn("hover:text-primary hover:underline", className)}
    >
      {children}
    </Link>
  );
}
