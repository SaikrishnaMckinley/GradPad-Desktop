"use client";

import Link from "next/link";
import { Suspense } from "react";
import { CalendarDays, FileText, Hash, Users } from "lucide-react";
import { ChannelForm } from "@/components/communities/ChannelForm";
import { CommunityForm } from "@/components/communities/CommunityForm";
import { PageContainer } from "@/components/layout/PageContainer";
import { useShellData } from "@/components/layout/ShellDataProvider";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { createChannel, createCommunity } from "@/lib/communities/actions";
import { EventCreateForm } from "@/components/events/EventCreateForm";
import { PostCreateForm } from "@/components/posts/PostCreateForm";
import { slugifyCommunityName } from "@/lib/communities/slug";
import { cn } from "@/lib/utils/cn";

export type CreateTab = "post" | "event" | "community" | "channel";

type Props = {
  activeTab: CreateTab;
  stagingApi: boolean;
  prefillCommunityId: string | null;
  prefillCommunityRouteKey: string | null;
  prefillChannelId: string | null;
  payoutSetupNotice: string | null;
};

const TABS: { id: CreateTab; label: string; icon: typeof FileText; href: string }[] = [
  { id: "post", label: "Post", icon: FileText, href: "/create" },
  { id: "event", label: "Event", icon: CalendarDays, href: "/create?tab=event" },
  { id: "community", label: "Community", icon: Users, href: "/create?tab=community" },
  { id: "channel", label: "Channel", icon: Hash, href: "/create?tab=channel" },
];

function RightRail({ tab }: { tab: CreateTab }) {
  if (tab === "community") {
    return (
      <Card className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Community tips
        </p>
        <h2 className="mt-2 text-base font-semibold">Build your alumni hub</h2>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>• Add a cover and logo so members recognize your space.</li>
          <li>• Write a short description of who the community is for.</li>
          <li>• You can refine branding anytime from edit community.</li>
        </ul>
      </Card>
    );
  }

  if (tab === "channel") {
    return (
      <Card className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Channel tips</p>
        <h2 className="mt-2 text-base font-semibold">Organize conversations</h2>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>• Pick a clear name members will recognize (#general, #careers).</li>
          <li>• Describe who should post and what belongs here.</li>
          <li>• Add a logo so the channel stands out in the sidebar.</li>
        </ul>
      </Card>
    );
  }

  if (tab === "event") {
    return (
      <Card className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Event tips</p>
        <h2 className="mt-2 text-base font-semibold">Bring people together</h2>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>• Pick a clear title and time zone.</li>
          <li>• Say whether the event is in person or online.</li>
          <li>• Paid events need a verified Stripe payout account (test mode on staging).</li>
        </ul>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">Post tips</p>
      <h2 className="mt-2 text-base font-semibold">Start a meaningful conversation</h2>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        <li>• Use a clear, descriptive title.</li>
        <li>• Share context with your community.</li>
        <li>• Be respectful and constructive.</li>
      </ul>
    </Card>
  );
}

export function CreateHub({
  activeTab,
  stagingApi,
  prefillCommunityId,
  prefillCommunityRouteKey,
  prefillChannelId,
  payoutSetupNotice,
}: Props) {
  const { shellUser, communityContext } = useShellData();
  const userDisplayName = shellUser.fullName;
  const defaultCommunityId =
    prefillCommunityId ?? communityContext.activeCommunity?.id ?? null;
  const defaultCommunityRouteKey =
    prefillCommunityRouteKey ?? communityContext.activeSlug ?? null;

  const tabBar = (
    <div className="flex w-full border-b border-border p-2">
      {TABS.map(({ id, label, icon: Icon, href }) => {
        const active = activeTab === id;
        return (
          <Link
            key={id}
            href={href}
            scroll={false}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-colors",
              active ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </div>
  );

  if (activeTab === "event") {
    return (
      <PageContainer withRightRail rightRail={<RightRail tab="event" />}>
        <Card className="w-full overflow-hidden">{tabBar}</Card>
        <div className="mt-4 w-full">
          <div className="mb-4 w-full">
            <h1 className="text-xl font-semibold tracking-tight">Create event</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Matches gradpad-web: schedule, location search, tickets, hosts, donations, and payout.
            </p>
          </div>
          {stagingApi ? (
            <Suspense fallback={<p className="text-sm text-muted-foreground">Loading form…</p>}>
              <EventCreateForm
                memberships={communityContext.memberships}
                defaultCommunityId={defaultCommunityId}
                payoutSetupNotice={payoutSetupNotice}
              />
            </Suspense>
          ) : (
            <p className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
              Event creation uses the staging API. Set NEXT_PUBLIC_DEMO_STATIC_UI=false and sign in.
            </p>
          )}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer withRightRail rightRail={<RightRail tab={activeTab} />}>
      <Card className="w-full overflow-hidden">
        {tabBar}

        {activeTab === "channel" ? (
          <div className="p-6 md:p-8">
            <div className="mb-6">
              <h1 className="text-xl font-semibold">Create a channel</h1>
              <p className="text-sm text-muted-foreground">
                Add a discussion space inside a community you manage or belong to.
              </p>
            </div>
            <ChannelForm
              action={createChannel}
              memberships={communityContext.memberships}
              defaultCommunityId={defaultCommunityId}
              defaultCommunityRouteKey={defaultCommunityRouteKey}
            />
          </div>
        ) : activeTab === "community" ? (
          <div className="p-6 md:p-8">
            <div className="mb-6">
              <h1 className="text-xl font-semibold">Create a community</h1>
              <p className="text-sm text-muted-foreground">
                Add cover, logo, and details — your hub will match what members see on the
                community page.
              </p>
            </div>
            <CommunityForm
              action={createCommunity}
              submitLabel="Create community"
              slugHint={
                stagingApi
                  ? "After creation you will land on your community hub (staging uses your community ID in the URL)."
                  : undefined
              }
              initial={{
                name: "",
                slug: slugifyCommunityName("my-community"),
                description: "",
                institution: "",
                location: "",
                visibility: "public",
                joinApprovalRequired: false,
              }}
            />
          </div>
        ) : (
          <div className="p-6 md:p-8">
            <div className="mb-6 flex items-center gap-4">
              <Avatar alt={userDisplayName} fallback={userDisplayName} size="lg" />
              <div>
                <h1 className="text-xl font-semibold">Create a post</h1>
                <p className="text-sm text-muted-foreground">Share an update with your community</p>
              </div>
            </div>
            <PostCreateForm
              key={`post-${defaultCommunityId ?? "none"}-${prefillChannelId ?? "none"}`}
              memberships={communityContext.memberships}
              channelsByCommunityId={communityContext.channelsByCommunityId}
              defaultCommunityId={defaultCommunityId}
              defaultChannelId={prefillChannelId}
            />
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
