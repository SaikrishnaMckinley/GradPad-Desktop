import Link from "next/link";
import { CommunityEmptyState } from "@/components/communities/CommunityEmptyState";
import { CommunityPostPreviewCard } from "@/components/communities/CommunityPostPreviewCard";
import { HomeMembershipFilters } from "@/components/home/HomeMembershipFilters";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { HomeFeedPayload } from "@/lib/posts/load-home-feed";
import { cn } from "@/lib/utils/cn";

type Props = {
  feed: HomeFeedPayload;
};

export function HomeFeed({ feed }: Props) {
  const { activeCommunity, memberships, posts } = feed;

  return (
    <div className="space-y-5">
      <HomeMembershipFilters
        memberships={memberships}
        activeCommunityId={activeCommunity?.id ?? null}
      />

      {!activeCommunity ? (
        <Card className="p-6 text-sm text-muted-foreground shadow-card">
          Join a community to see posts on your home feed.{" "}
          <Link href="/communities" className="font-medium text-primary hover:underline">
            Go to communities
          </Link>
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">{activeCommunity.name}</h2>
              <p className="text-sm text-muted-foreground">Latest posts in this community</p>
            </div>
            <Link
              href={`/create?tab=post&community=${encodeURIComponent(activeCommunity.id)}`}
              className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
            >
              Create post
            </Link>
          </div>

          {posts.length === 0 ? (
            <CommunityEmptyState variant="posts" />
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <CommunityPostPreviewCard
                  key={post.id}
                  postId={post.id}
                  communityName={post.communityName ?? activeCommunity.name}
                  channelName={post.channelName}
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
        </>
      )}
    </div>
  );
}
