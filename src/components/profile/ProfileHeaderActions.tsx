"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { chatWithUserPath } from "@/lib/profiles/profile-links";
import { cn } from "@/lib/utils/cn";

type Props = {
  profileUserId: string;
  isOwnProfile: boolean;
};

export function ProfileHeaderActions({ profileUserId, isOwnProfile }: Props) {
  if (isOwnProfile) {
    return (
      <div className="flex w-full flex-wrap justify-center gap-2 sm:w-auto sm:justify-end">
        <Link href="/settings/profile" className={cn(buttonVariants({ size: "sm" }))}>
          Edit profile
        </Link>
        <Link
          href="/settings/account"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Account
        </Link>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-wrap justify-center gap-2 sm:w-auto sm:justify-end">
      <Link
        href={chatWithUserPath(profileUserId)}
        className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
      >
        <MessageCircle className="h-4 w-4" />
        Message
      </Link>
    </div>
  );
}
