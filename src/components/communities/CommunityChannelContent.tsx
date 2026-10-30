import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CommunityEmptyState } from "@/components/communities/CommunityEmptyState";
import { CommunityPostPreviewCard } from "@/components/communities/CommunityPostPreviewCard";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ChannelDetail, ChannelPostRow } from "@/lib/communities/channel-api";
import type { CommunityDetail } from "@/types/community";
import { cn } from "@/lib/utils/cn";

type Props = {
  community: CommunityDetail;
  channel: ChannelDetail;
  posts: ChannelPostRow[];
  isMember: boolean;
};

export function CommunityChannelContent({ community, channel, posts, isMember }: Props) {
  const canSee = isMember || community.visibility === "public";
  const hubHref = `/communities/${community.slug}`;

  return (
    <>
      <div className="mb-6">
        <Link
          href={hubHref}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "mb-4 -ml-2 gap-2 text-muted-foreground",
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          {community.name}
        </Link>
        <Card className="overflow-hidden shadow-card">
          <div className="border-b border-border bg-primary-light/40 px-5 py-6 md:px-8">
            <div className="flex items-start gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-white"
                aria-hidden
              >
                #
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-primary">
                  Channel
                </p>
                <h1 className="text-2xl font-semibold">{channel.name}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {channel.description?.trim() ||
                    `Conversations in ${community.name}`}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Posts</h2>
            <p className="text-sm text-muted-foreground">
              Latest in #{channel.name}
            </p>
          </div>
          {canSee ? (
            <Link
              href={`/create?tab=post&community=${encodeURIComponent(community.id)}&channel=${encodeURIComponent(channel.id)}`}
              className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
            >
              Create post
            </Link>
          ) : null}
        </div>
        {!canSee ? (
          <Card className="p-5 text-sm text-muted-foreground shadow-card">
            Join {community.name} to read and post in this channel.
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
                channelName={channel.name}
                authorName={post.authorName}
                authorAvatarUrl={post.authorAvatarUrl}
                createdAt={post.createdAt}
                title={post.title}
                content={post.content}
                media={post.media}
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
