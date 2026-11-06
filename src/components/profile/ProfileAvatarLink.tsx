"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { profilePath } from "@/lib/profiles/profile-links";
import { cn } from "@/lib/utils/cn";
import type { ComponentProps } from "react";

type AvatarProps = ComponentProps<typeof Avatar>;

type Props = AvatarProps & {
  userId?: string | null;
  /** When false, render avatar only (e.g. current user compose box). */
  linkable?: boolean;
};

const linkRing =
  "rounded-full ring-offset-2 transition hover:ring-2 hover:ring-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function ProfileAvatarLink({
  userId,
  linkable = true,
  className,
  ...avatarProps
}: Props) {
  const avatar = <Avatar className={className} {...avatarProps} />;

  if (!linkable || !userId?.trim()) {
    return avatar;
  }

  const label = avatarProps.alt || avatarProps.fallback || "View profile";

  return (
    <Link
      href={profilePath(userId)}
      className={cn("inline-flex shrink-0", linkRing)}
      aria-label={`View ${label}'s profile`}
    >
      {avatar}
    </Link>
  );
}
