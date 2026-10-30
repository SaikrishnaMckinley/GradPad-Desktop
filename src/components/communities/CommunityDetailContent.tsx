import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";
import { CommunityCoverImage } from "@/components/communities/CommunityCoverImage";
import { CommunityEmptyState } from "@/components/communities/CommunityEmptyState";
import { CommunityMembershipActions } from "@/components/communities/CommunityMembershipActions";
import { CommunityMoreMenu } from "@/components/communities/CommunityMoreMenu";
import { CommunityPostPreviewCard } from "@/components/communities/CommunityPostPreviewCard";
import { CommunityMark } from "@/components/layout/CommunityMark";
import { Avatar } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { communityAccentColor, communityInitials } from "@/lib/communities/slug";
import type { CommunityDetail } from "@/types/community";
import type { PostCommentRow } from "@/lib/posts/map-post";
import { cn } from "@/lib/utils/cn";

export type CommunityChannelRow = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
};

export type CommunityEventRow = {
  id: string;
  title: string;
  start_at: string;
  location?: string | null;
  event_type?: string | null;
};

export type CommunityPostRow = {
  id: string;
  title: string | null;
  content: string;
  authorName: string;
  authorAvatarUrl?: string | null;
  createdAt: string;
  canEdit?: boolean;
  channelName?: string | null;
  media?: { url: string; type: string }[];
  likesCount?: number;
  likedByMe?: boolean;
  commentAllow?: boolean;
  comments?: PostCommentRow[];
  shareCount?: number;
};

type MemberPreview = {
  fullName: string;
  avatarUrl: string | null;
};

type Props = {
  community: CommunityDetail;
  channels: CommunityChannelRow[];
  events: CommunityEventRow[];
  posts: CommunityPostRow[];
  membersPreview: MemberPreview[];
  canManage: boolean;
  isMember: boolean;
  useFixtureCover?: boolean;
};

function formatEventCard(iso: string) {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString("en-US", { day: "2-digit" }),
    month: d.toLocaleDateString("en-US", { month: "short" }),
    time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  };
}

export function CommunityDetailContent({
  community,
  channels,
  events,
  posts,
  membersPreview,
  canManage,
  isMember,
  useFixtureCover = false,
}: Props) {
  const initials = communityInitials(community.name);
  const accent = communityAccentColor(community.slug);
  const about =
    community.description?.trim() ||
    `A welcoming space for ${community.name} members to reconnect, exchange ideas, and take part in local events.`;
  const postsSubtitle = `Latest updates from ${community.name}`;
  const canSeeContent = isMember || community.visibility === "public";
  const extraMembers = Math.max(community.memberCount - membersPreview.length, 0);

  return (
    <>
      <div className="overflow-hidden rounded-[22px] border border-border bg-card shadow-card">
        <div className="relative h-44 md:h-52">
          {useFixtureCover ? (
            <Image
              src="/images/community-cover.jpg"
              alt=""
              fill
              className="object-cover object-center"
              priority
              sizes="(max-width: 768px) 100vw, 1200px"
            />
          ) : (
            <CommunityCoverImage
              name={community.name}
              slug={community.slug}
              coverImageUrl={community.coverImageUrl}
            />
          )}
        </div>
        <div className="relative px-5 pb-6 pt-0 md:px-8">
          <div className="-mt-10 flex gap-4">
            <CommunityMark
              name={community.name}
              initials={initials}
              accentColor={accent}
              logoUrl={community.logoUrl}
              shape="rounded"
              size="lg"
              className="h-20 w-20 shrink-0 text-xl ring-4 ring-card"
            />
            <div className="min-w-0 flex-1 pt-12 md:pt-10">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h1 className="text-2xl font-semibold">{community.name}</h1>
                  {community.location ? (
                    <p className="text-sm text-muted-foreground">{community.location}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-page-secondary"
                    aria-label="Share community"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                  <CommunityMoreMenu communitySlug={community.slug} canManage={canManage} />
                </div>
              </div>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">{about}</p>
          <div className="mt-4 flex items-center">
            {membersPreview.length > 0 ? (
              <div className="flex -space-x-2">
                {membersPreview.slice(0, 4).map((m) => (
                  <Avatar
                    key={m.fullName}
                    src={m.avatarUrl}
                    alt={m.fullName}
                    fallback={m.fullName}
                    size="sm"
                  />
                ))}
              </div>
            ) : null}
            {extraMembers > 0 ? (
              <span className="ml-2 flex h-8 min-w-8 items-center justify-center rounded-full bg-primary-light px-2 text-xs font-semibold text-primary">
                +{extraMembers > 99 ? "99" : extraMembers}
              </span>
            ) : community.memberCount > 0 ? (
              <span className="text-sm text-muted-foreground">
                {community.memberCount.toLocaleString()} member
                {community.memberCount === 1 ? "" : "s"}
              </span>
            ) : null}
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button variant="outline" className="h-11 w-full">
              Make a donation
            </Button>
            {canManage ? (
              <Link
                href={`/communities/${community.slug}/admin`}
                className={cn(buttonVariants({ variant: "outline" }), "h-11 w-full")}
              >
                Admin dashboard
              </Link>
            ) : (
              <div className="flex h-11 items-center">
                <CommunityMembershipActions community={community} canManage={false} />
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Channels</h2>
            <p className="text-sm text-muted-foreground">Discuss topics with your community</p>
          </div>
          <Link
            href={`/create?tab=channel&community=${encodeURIComponent(community.id)}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-primary hover:bg-primary-light"
            aria-label="Create channel"
          >
            <Plus className="h-4 w-4" />
          </Link>
        </div>
        {!canSeeContent ? (
          <Card className="p-5 text-sm text-muted-foreground shadow-card">
            Join this community to view channels.
          </Card>
        ) : channels.length === 0 ? (
          <CommunityEmptyState variant="channels" />
        ) : (
          <div className="space-y-3">
            {channels.map((channel) => (
              <Card key={channel.id} className="p-5 shadow-card">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-4">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-xl font-bold text-white"
                      aria-hidden
                    >
                      #
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold">{channel.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {channel.description?.trim() ||
                          "Join the latest conversations in this channel"}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/communities/${community.slug}/channels/${channel.slug}`}
                    className={cn(buttonVariants({ variant: "secondary" }), "shrink-0")}
                  >
                    Open channel
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Events</h2>
            <p className="text-sm text-muted-foreground">Gather with people from this community</p>
          </div>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-primary hover:bg-primary-light"
            aria-label="Add event"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {!isMember ? (
          <Card className="p-5 text-sm text-muted-foreground shadow-card">
            Join to see upcoming community events.
          </Card>
        ) : events.length === 0 ? (
          <CommunityEmptyState variant="events" />
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-1">
            {events.map((event) => {
              const { day, month, time } = formatEventCard(event.start_at);
              return (
                <Card
                  key={event.id}
                  className="flex min-w-[min(100%,280px)] shrink-0 gap-4 p-4 shadow-card sm:min-w-[300px]"
                >
                  <div className="flex h-[72px] w-[72px] shrink-0 flex-col items-center justify-center rounded-2xl border border-border bg-page-secondary">
                    <span className="text-xl font-bold leading-none">{day}</span>
                    <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {month}
                    </span>
                  </div>
                  <div className="min-w-0 py-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      {time}
                      {event.location ? ` · ${event.location}` : ""}
                    </p>
                    <p className="mt-1 font-semibold">{event.title}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section id="posts" className="mt-8 scroll-mt-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Posts</h2>
            <p className="text-sm text-muted-foreground">{postsSubtitle}</p>
          </div>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-primary hover:bg-primary-light"
            aria-label="Create post"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {!isMember ? (
          <Card className="p-5 text-sm text-muted-foreground shadow-card">
            Join to read and share posts.
          </Card>
        ) : posts.length === 0 ? (
          <CommunityEmptyState variant="posts" />
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <CommunityPostPreviewCard
                key={post.id}
                postId={post.id}
                communityId={community.id}
                communityName={community.name}
                channelName={post.channelName ?? null}
                authorName={post.authorName}
                authorAvatarUrl={post.authorAvatarUrl}
                createdAt={post.createdAt}
                title={post.title}
                content={post.content}
                media={post.media ?? []}
                canEdit={post.canEdit}
                likesCount={post.likesCount}
                likedByMe={post.likedByMe}
                commentAllow={post.commentAllow}
                comments={post.comments}
                shareCount={post.shareCount}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
