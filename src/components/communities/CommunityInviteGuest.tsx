"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { LoginForm } from "@/components/auth/LoginForm";
import { CommunityMark } from "@/components/layout/CommunityMark";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { communityInviteCompletePath } from "@/lib/communities/community-invite-url";
import { saveCommunityInviteContext } from "@/lib/communities/community-invite-context";
import { shareCommunityInviteLink } from "@/lib/communities/community-share";
import { communityAccentColor, communityInitials } from "@/lib/communities/slug";
import { cn } from "@/lib/utils/cn";
import type { CommunityListItem } from "@/types/community";

type Props = {
  community: Pick<
    CommunityListItem,
    "id" | "name" | "slug" | "description" | "logoUrl" | "memberCount"
  >;
  initialView?: "login" | "signup";
  initialEmail?: string;
};

export function CommunityInviteGuest({
  community,
  initialView = "signup",
  initialEmail = "",
}: Props) {
  const [authView, setAuthView] = useState<"login" | "signup">(initialView);

  const completePath = communityInviteCompletePath(community.id);
  const authQuery = new URLSearchParams({
    next: completePath,
    communityId: community.id,
  });
  const loginHref = `/login?${authQuery.toString()}`;
  const signupHref = `/signup?${authQuery.toString()}`;

  const initials = communityInitials(community.name);
  const accent = communityAccentColor(community.slug);

  const about = useMemo(
    () =>
      community.description?.trim() ||
      `Join ${community.name} on Grad Pad to connect with members and stay up to date.`,
    [community.description, community.name],
  );

  useEffect(() => {
    saveCommunityInviteContext({
      communityId: community.id,
      redirect: completePath,
    });
  }, [community.id, completePath]);

  async function onShare() {
    try {
      const result = await shareCommunityInviteLink(community.id, community.name);
      if (result === "copied") toast.success("Invite link copied");
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return;
      toast.error("Could not share link");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {authView === "signup" ? "Join via invite link" : "Sign in to join"}
        </p>
        <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => void onShare()}>
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </div>

      <p className="text-base leading-relaxed text-foreground">
        Create your Grad Pad account to join <strong>{community.name}</strong>, or sign in if you
        already have one.
      </p>

      <Card className="overflow-hidden border-border p-0 shadow-card">
        <div className="relative h-28 bg-gradient-to-br from-primary/10 to-page-secondary">
          <Image
            src="/images/community-cover.jpg"
            alt=""
            fill
            className="object-cover opacity-80"
            sizes="560px"
          />
        </div>
        <div className="relative px-5 pb-5 pt-0">
          <div className="-mt-8">
            <CommunityMark
              name={community.name}
              initials={initials}
              accentColor={accent}
              logoUrl={community.logoUrl}
              shape="rounded"
              size="lg"
              className="h-16 w-16 ring-4 ring-card"
            />
          </div>
          <h1 className="mt-3 text-xl font-semibold">{community.name}</h1>
          {community.memberCount > 0 ? (
            <p className="text-sm text-muted-foreground">
              {community.memberCount.toLocaleString()} member
              {community.memberCount === 1 ? "" : "s"}
            </p>
          ) : null}
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{about}</p>
        </div>
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          {authView === "signup" ? "Create your account" : "Sign in"}
        </h2>
        {authView === "signup" ? (
          <Link href={signupHref} className={cn(buttonVariants(), "w-full")}>
            Continue to sign up →
          </Link>
        ) : (
          <LoginForm next={completePath} />
        )}
        <p className="text-center text-sm text-muted-foreground">
          {authView === "signup" ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="font-medium text-primary hover:underline"
                onClick={() => setAuthView("login")}
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                className="font-medium text-primary hover:underline"
                onClick={() => setAuthView("signup")}
              >
                Create account
              </button>
            </>
          )}
        </p>
        {initialEmail ? (
          <p className="text-center text-xs text-muted-foreground">
            Use <span className="font-medium">{initialEmail}</span> when you register.
          </p>
        ) : null}
      </div>

    </div>
  );
}
