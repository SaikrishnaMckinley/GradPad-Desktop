"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Users } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { GradPadLogo } from "@/components/brand/GradPadLogo";
import { CommunityMark } from "@/components/layout/CommunityMark";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GradPadBlueHero } from "@/components/ui/GradPadBlueHero";
import { communityInviteCompletePath } from "@/lib/communities/community-invite-url";
import { saveCommunityInviteContext } from "@/lib/communities/community-invite-context";
import { CommunityShareMenu } from "@/components/communities/CommunityShareMenu";
import { communityAccentColor, communityInitials } from "@/lib/communities/slug";
import { cn } from "@/lib/utils/cn";
import type { CommunityListItem } from "@/types/community";

type Props = {
  community: Pick<
    CommunityListItem,
    | "id"
    | "name"
    | "slug"
    | "description"
    | "logoUrl"
    | "coverImageUrl"
    | "memberCount"
    | "institution"
    | "location"
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
  const [aboutExpanded, setAboutExpanded] = useState(false);

  const completePath = communityInviteCompletePath(community.id);
  const authQuery = new URLSearchParams({
    next: completePath,
    communityId: community.id,
  });
  const signupHref = `/signup?${authQuery.toString()}`;

  const initials = communityInitials(community.name);
  const accent = communityAccentColor(community.slug);
  const coverSrc = community.coverImageUrl || "/images/community-cover.jpg";

  const about = useMemo(
    () =>
      community.description?.trim() ||
      `Join ${community.name} on Grad Pad to connect with members, events, and updates.`,
    [community.description, community.name],
  );
  const aboutLong = about.length > 220;
  const aboutDisplay =
    aboutLong && !aboutExpanded ? `${about.slice(0, 220).trim()}…` : about;

  useEffect(() => {
    saveCommunityInviteContext({
      communityId: community.id,
      redirect: completePath,
    });
  }, [community.id, completePath]);

  return (
    <div className="w-full max-w-5xl">
      <header className="flex items-center justify-between gap-4 border-b border-border pb-4 md:pb-5">
        <GradPadLogo />
        <CommunityShareMenu
          communityId={community.id}
          communityName={community.name}
          variant="button"
        />
      </header>

      <div className="mt-6 lg:mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_min(100%,400px)] lg:items-start lg:gap-10 xl:gap-12">
        <div className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Community invite
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Join {community.name}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Create a Grad Pad account to request membership, or sign in if you already have one.
            </p>
          </div>

          <Card className="overflow-hidden border-border p-0 shadow-card">
            <div className="relative h-36 sm:h-44">
              <Image
                src={coverSrc}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 640px"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            </div>
            <div className="relative px-5 pb-5 sm:px-6 sm:pb-6">
              <div className="-mt-10 sm:-mt-11">
                <CommunityMark
                  name={community.name}
                  initials={initials}
                  accentColor={accent}
                  logoUrl={community.logoUrl}
                  shape="rounded"
                  size="lg"
                  className="h-16 w-16 ring-4 ring-card sm:h-[4.5rem] sm:w-[4.5rem]"
                />
              </div>
              <h2 className="mt-3 text-xl font-semibold">{community.name}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                {community.memberCount > 0 ? (
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" aria-hidden />
                    {community.memberCount.toLocaleString()} members
                  </span>
                ) : null}
                {community.institution ? <span>{community.institution}</span> : null}
                {community.location ? <span>{community.location}</span> : null}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{aboutDisplay}</p>
              {aboutLong ? (
                <button
                  type="button"
                  className="mt-2 text-sm font-medium text-primary hover:underline"
                  onClick={() => setAboutExpanded((v) => !v)}
                >
                  {aboutExpanded ? "Show less" : "Read more"}
                </button>
              ) : null}
            </div>
          </Card>
        </div>

        <div className="mt-8 lg:sticky lg:top-8 lg:mt-0">
          <Card className="overflow-hidden border-primary-border/50 p-0 shadow-card">
            <GradPadBlueHero size="compact" className="rounded-none">
              <p className="text-sm font-medium text-white/90">
                {authView === "signup" ? "New to Grad Pad?" : "Welcome back"}
              </p>
              <p className="mt-0.5 text-lg font-semibold text-white">
                {authView === "signup" ? "Create your account" : "Sign in to continue"}
              </p>
            </GradPadBlueHero>

            <div className="space-y-4 p-5 sm:p-6">
              {authView === "signup" ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    You&apos;ll finish joining <strong className="text-foreground">{community.name}</strong>{" "}
                    after sign-up.
                  </p>
                  <Link
                    href={signupHref}
                    className={cn(buttonVariants({ size: "lg" }), "w-full gap-1")}
                  >
                    Continue to sign up
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </>
              ) : (
                <LoginForm next={completePath} />
              )}

              <p className="text-center text-sm text-muted-foreground">
                {authView === "signup" ? (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      className="font-semibold text-primary hover:underline"
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
                      className="font-semibold text-primary hover:underline"
                      onClick={() => setAuthView("signup")}
                    >
                      Create account
                    </button>
                  </>
                )}
              </p>

              {initialEmail ? (
                <p className="rounded-lg bg-primary-light/50 px-3 py-2 text-center text-xs text-foreground">
                  Use <span className="font-semibold">{initialEmail}</span> when you register.
                </p>
              ) : null}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
