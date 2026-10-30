"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { CommunityEmptyState } from "@/components/communities/CommunityEmptyState";
import { CommunityPostPreviewCard } from "@/components/communities/CommunityPostPreviewCard";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { HomeFeedPayload } from "@/lib/posts/load-home-feed";
import {
  HOME_FEED_INVALIDATE_EVENT,
  invalidateHomeFeedCache,
  readHomeFeedCache,
  writeHomeFeedCache,
} from "@/lib/posts/home-feed-cache";
import type { FeedPostRow } from "@/lib/posts/map-post";
import { cn } from "@/lib/utils/cn";

type Props = {
  initial: HomeFeedPayload;
};

export function HomeFeedClient({ initial }: Props) {
  const { memberships } = initial;
  const initialId = initial.activeCommunity?.id ?? memberships[0]?.id ?? null;

  const [activeCommunityId, setActiveCommunityId] = useState(initialId);
  const [postsByCommunity, setPostsByCommunity] = useState<Record<string, FeedPostRow[]>>(() => {
    const seed: Record<string, FeedPostRow[]> = {};
    if (initial.activeCommunity && initial.posts) {
      seed[initial.activeCommunity.id] = initial.posts;
      writeHomeFeedCache(initial.activeCommunity.id, initial.posts);
    }
    return seed;
  });
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const prefetchStarted = useRef(false);

  const activeCommunity = useMemo(
    () => memberships.find((m) => m.id === activeCommunityId) ?? null,
    [memberships, activeCommunityId],
  );

  const posts = activeCommunityId ? (postsByCommunity[activeCommunityId] ?? []) : [];

  useEffect(() => {
    if (!initial.activeCommunity?.id || !initial.posts) return;
    const id = initial.activeCommunity.id;
    setPostsByCommunity((prev) => ({ ...prev, [id]: initial.posts }));
    writeHomeFeedCache(id, initial.posts);
  }, [initial.activeCommunity?.id, initial.posts]);

  const fetchPosts = useCallback(
    async (communityId: string, communityName: string, force = false) => {
      if (!force) {
        const cached = readHomeFeedCache(communityId);
        if (cached) {
          setPostsByCommunity((prev) => ({ ...prev, [communityId]: cached }));
          return;
        }
      }

      setLoadingId(communityId);
      try {
        const params = new URLSearchParams({ community: communityId, name: communityName });
        const res = await fetch(`/api/home/feed?${params.toString()}`, {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) return;
        const body = (await res.json()) as { posts?: FeedPostRow[] };
        const next = body.posts ?? [];
        writeHomeFeedCache(communityId, next);
        setPostsByCommunity((prev) => ({ ...prev, [communityId]: next }));
      } finally {
        setLoadingId((current) => (current === communityId ? null : current));
      }
    },
    [],
  );

  useEffect(() => {
    function onInvalidate(event: Event) {
      const detail = (event as CustomEvent<{ communityId?: string }>).detail;
      const targetId = detail?.communityId ?? activeCommunityId;
      if (!targetId) return;
      invalidateHomeFeedCache(targetId);
      const name = memberships.find((m) => m.id === targetId)?.name ?? "";
      startTransition(() => {
        void fetchPosts(targetId, name, true);
      });
    }
    window.addEventListener(HOME_FEED_INVALIDATE_EVENT, onInvalidate);
    return () => window.removeEventListener(HOME_FEED_INVALIDATE_EVENT, onInvalidate);
  }, [activeCommunityId, fetchPosts, memberships]);

  const selectCommunity = useCallback(
    (communityId: string) => {
      if (communityId === activeCommunityId) return;
      setActiveCommunityId(communityId);
      const name = memberships.find((m) => m.id === communityId)?.name ?? "";
      const url = `/home?community=${encodeURIComponent(communityId)}`;
      window.history.replaceState(null, "", url);

      if (postsByCommunity[communityId]) return;

      const cached = readHomeFeedCache(communityId);
      if (cached) {
        setPostsByCommunity((prev) => ({ ...prev, [communityId]: cached }));
        return;
      }

      startTransition(() => {
        void fetchPosts(communityId, name);
      });
    },
    [activeCommunityId, fetchPosts, memberships, postsByCommunity],
  );

  useEffect(() => {
    if (prefetchStarted.current || memberships.length === 0) return;
    prefetchStarted.current = true;

    const idle =
      typeof requestIdleCallback !== "undefined"
        ? requestIdleCallback
        : (cb: () => void) => window.setTimeout(cb, 400);

    idle(() => {
      for (const m of memberships) {
        if (m.id === initialId) continue;
        if (postsByCommunity[m.id] || readHomeFeedCache(m.id)) continue;
        void fetchPosts(m.id, m.name);
      }
    });
  }, [fetchPosts, initialId, memberships, postsByCommunity]);

  if (memberships.length === 0) {
    return (
      <Card className="p-6 text-sm text-muted-foreground shadow-card">
        Join a community to see posts on your home feed.{" "}
        <Link href="/communities" className="font-medium text-primary hover:underline">
          Go to communities
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {memberships.map((community) => {
          const active = community.id === activeCommunityId;
          return (
            <button
              key={community.id}
              type="button"
              onClick={() => selectCommunity(community.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-white shadow-sm"
                  : "border border-border bg-card text-muted-foreground hover:border-primary-border hover:text-foreground",
              )}
            >
              {community.name}
            </button>
          );
        })}
      </div>

      {!activeCommunity ? null : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">{activeCommunity.name}</h2>
              <p className="text-sm text-muted-foreground">
                {loadingId === activeCommunity.id ? "Updating feed…" : "Latest posts in this community"}
              </p>
            </div>
            <Link
              href={`/create?tab=post&community=${encodeURIComponent(activeCommunity.id)}`}
              className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
            >
              Create post
            </Link>
          </div>

          {loadingId === activeCommunity.id && posts.length === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground shadow-card">
              Loading posts…
            </Card>
          ) : posts.length === 0 ? (
            <CommunityEmptyState variant="posts" />
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <CommunityPostPreviewCard
                  key={post.id}
                  postId={post.id}
                  communityId={activeCommunity.id}
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
