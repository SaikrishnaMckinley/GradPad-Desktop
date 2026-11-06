import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { CommunityShareMenu } from "@/components/communities/CommunityShareMenu";
import { CommunityCoverImage } from "@/components/communities/CommunityCoverImage";
import { CommunityEmptyState } from "@/components/communities/CommunityEmptyState";
import { CommunityMembershipActions } from "@/components/communities/CommunityMembershipActions";
import { CommunityMembersFacepile } from "@/components/communities/CommunityMembersFacepile";
import { CommunityMoreMenu } from "@/components/communities/CommunityMoreMenu";
import { CommunityPostPreviewCard } from "@/components/communities/CommunityPostPreviewCard";
import { CommunityMark } from "@/components/layout/CommunityMark";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { communityAccentColor, communityInitials } from "@/lib/communities/slug";
import { formatEventCard } from "@/lib/events/format-event-datetime";
import type { CommunityDetail } from "@/types/community";
import type { PostCommentRow } from "@/lib/posts/map-post";
import { cn } from "@/lib/utils/cn";

const hideScrollbarMobile =
  "max-md:[scrollbar-width:none] max-md:[-ms-overflow-style:none] max-md:[&::-webkit-scrollbar]:hidden";

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
  description?: string | null;
};

function eventFormatLabel(event: CommunityEventRow): string {
  const type = event.event_type?.trim();
  if (type) return type.replace(/_/g, " ").toUpperCase();
  if (event.location) return "IN PERSON";
  return "EVENT";
}

export type CommunityPostRow = {
  id: string;
  title: string | null;
  content: string;
  authorName: string;
  authorAvatarUrl?: string | null;
  authorUserId?: string | null;
  createdAt: string;
  canEdit?: boolean;
  channelName?: string | null;
  media?: { url: string; type: string }[];
  likesCount?: number;
  likedByMe?: boolean;
  reactionType?: string | null;
  commentAllow?: boolean;
  comments?: PostCommentRow[];
  shareCount?: number;
};

type MemberPreview = {
  id: string;
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
  const isPendingJoin = community.membershipStatus === "pending";


  return (
    <>
      {isPendingJoin ? (
        <div
          className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          role="status"
        >
          <p className="font-semibold">Join request pending</p>
          <p className="mt-0.5 text-amber-900/90">
            Your request to join {community.name} was sent. An admin will review it soon—you&apos;ll
            get full access once approved.
          </p>
        </div>
      ) : null}
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
        <div className="relative px-4 pb-5 pt-0 md:px-8 md:pb-6">
          <div className="absolute right-4 top-14 z-10 flex shrink-0 gap-1 md:right-8 md:top-12">
            <CommunityShareMenu communityId={community.id} communityName={community.name} />
            <CommunityMoreMenu communitySlug={community.slug} canManage={canManage} />
          </div>
          <CommunityMark
            name={community.name}
            initials={initials}
            accentColor={accent}
            logoUrl={community.logoUrl}
            shape="rounded"
            size="lg"
            className="-mt-9 h-[4.5rem] w-[4.5rem] shrink-0 text-lg ring-4 ring-card md:-mt-10 md:h-20 md:w-20 md:text-xl"
          />
          <div className="mt-3 min-w-0 pr-14 md:mt-4 md:pr-16">
            <h1 className="text-xl font-semibold md:text-2xl">{community.name}</h1>
            {community.location ? (
              <p className="mt-0.5 text-xs text-muted-foreground md:text-sm">{community.location}</p>
            ) : null}
          </div>
          <p className="mt-3 w-full text-justify text-[13px] leading-relaxed text-muted-foreground [text-align-last:left] md:mt-4 md:text-sm">
            {about}
          </p>
          <div className="mt-4">
            <CommunityMembersFacepile
              communitySlug={community.slug}
              members={membersPreview}
              memberCount={community.memberCount}
              canOpenDirectory={isMember}
            />
          </div>
          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 md:gap-3">
            {isMember || canManage ? (
              <Link
                href={`/communities/${community.id}/donate`}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-9 w-full text-xs md:h-11 md:text-sm",
                )}
              >
                Make a donation
              </Link>
            ) : (
              <Button
                variant="outline"
                className="h-9 w-full text-xs md:h-11 md:text-sm"
                disabled
              >
                Make a donation
              </Button>
            )}
            {canManage ? (
              <Link
                href={`/communities/${community.slug}/admin`}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-9 w-full text-xs md:h-11 md:text-sm",
                )}
              >
                Admin dashboard
              </Link>
            ) : (
              <div className="flex h-9 items-center md:h-11">
                <CommunityMembershipActions community={community} canManage={false} />
              </div>
            )}
          </div>

        </div>
      </div>

      <section className="mt-6 md:mt-8">
        <div className="mb-3 flex items-center justify-between md:mb-4">
          <div>
            <h2 className="text-base font-semibold md:text-lg">Channels</h2>
            <p className="text-xs text-muted-foreground md:text-sm">
              Discuss topics with your community
            </p>
          </div>
          {canManage ? (
            <Link
              href={`/create?tab=channel&community=${encodeURIComponent(community.id)}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-primary hover:bg-primary-light"
              aria-label="Create channel"
            >
              <Plus className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
        {!canSeeContent ? (
          <Card className="p-5 text-sm text-muted-foreground shadow-card">
            Join this community to view channels.
          </Card>
        ) : channels.length === 0 ? (
          <CommunityEmptyState variant="channels" />
        ) : (
          <div
            className={cn(
              "flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 md:snap-none md:flex-col md:gap-3 md:overflow-visible",
              hideScrollbarMobile,
            )}
          >
            {channels.map((channel) => (
              <Card
                key={channel.id}
                className={cn(
                  "shrink-0 snap-start shadow-card",
                  "w-[min(88vw,260px)] min-w-[min(88vw,260px)] max-w-[280px] p-3",
                  "md:w-full md:max-w-none md:min-w-0 md:p-5 md:shrink",
                )}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:gap-4">
                  <div className="flex gap-3 md:gap-4">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-lg font-bold text-white md:h-12 md:w-12 md:rounded-xl md:text-xl"
                      aria-hidden
                    >
                      #
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold md:text-base">{channel.name}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground md:mt-0 md:line-clamp-none md:text-sm">
                        {channel.description?.trim() ||
                          "Join the latest conversations in this channel"}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/communities/${community.slug}/channels/${channel.slug}`}
                    className={cn(
                      buttonVariants({ variant: "secondary", size: "sm" }),
                      "h-9 w-full shrink-0 text-xs md:h-10 md:w-auto md:text-sm",
                    )}
                  >
                    Open channel
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 md:mt-8">
        <div className="mb-3 flex items-center justify-between md:mb-4">
          <div>
            <h2 className="text-base font-semibold md:text-lg">Events</h2>
            <p className="text-xs text-muted-foreground md:text-sm">
              Gather with people from this community
            </p>
          </div>
          {isMember ? (
            <Link
              href={`/create?tab=event&community=${encodeURIComponent(community.id)}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-primary hover:bg-primary-light"
              aria-label="Create event"
            >
              <Plus className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
        {!isMember ? (
          <Card className="p-5 text-sm text-muted-foreground shadow-card">
            Join to see upcoming community events.
          </Card>
        ) : events.length === 0 ? (
          <CommunityEmptyState variant="events" />
        ) : (
          <div
            className={cn(
              "flex gap-3 overflow-x-auto pb-1 md:gap-4",
              hideScrollbarMobile,
            )}
          >
            {events.map((event) => {
              const { day, month, time } = formatEventCard(event.start_at);
              const formatLabel = eventFormatLabel(event);
              return (
                <Card
                  key={event.id}
                  className={cn(
                    "flex shrink-0 flex-col shadow-card",
                    "min-w-[min(82vw,248px)] max-w-[268px] gap-3 p-3",
                    "md:min-w-[min(100%,300px)] md:max-w-[320px] md:gap-4 md:p-5",
                  )}
                >
                  <div className="flex gap-3 md:gap-4">
                    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-border bg-page-secondary md:h-[72px] md:w-[72px] md:rounded-2xl">
                      <span className="text-lg font-bold leading-none md:text-xl">{day}</span>
                      <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground md:mt-1 md:text-[10px]">
                        {month}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground md:text-xs">
                        {time} · {formatLabel}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold leading-snug md:mt-1 md:text-base">
                        {event.title}
                      </p>
                      {event.description ? (
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground md:mt-2 md:line-clamp-3 md:text-sm">
                          {event.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <Link
                    href={`/events/${event.id}`}
                    prefetch
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "h-8 w-full text-xs md:h-10 md:text-sm",
                    )}
                  >
                    RSVP
                  </Link>
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
          {isMember ? (
            <Link
              href={`/create?tab=post&community=${encodeURIComponent(community.id)}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-primary hover:bg-primary-light"
              aria-label="Create post"
            >
              <Plus className="h-4 w-4" />
            </Link>
          ) : null}
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
                authorUserId={post.authorUserId}
                createdAt={post.createdAt}
                title={post.title}
                content={post.content}
                media={post.media ?? []}
                canEdit={post.canEdit}
                likesCount={post.likesCount}
                likedByMe={post.likedByMe}
                reactionType={post.reactionType}
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
