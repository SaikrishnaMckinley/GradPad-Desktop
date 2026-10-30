"use client";

import { useState, useTransition } from "react";
import {
  MessageCircle,
  Repeat2,
  Send,
  ThumbsUp,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  addPostComment,
  sharePost,
  togglePostLike,
} from "@/lib/posts/interactions";
import type { PostCommentRow } from "@/lib/posts/map-post";
import { cn } from "@/lib/utils/cn";

type Props = {
  postId: string;
  likesCount: number;
  likedByMe: boolean;
  commentAllow: boolean;
  comments: PostCommentRow[];
  shareCount: number;
  variant?: "feed" | "panel";
  className?: string;
};

export function PostEngagementBar({
  postId,
  likesCount: initialLikes,
  likedByMe: initialLiked,
  commentAllow,
  comments: initialComments,
  shareCount: initialShareCount,
  variant = "feed",
  className,
}: Props) {
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [likedByMe, setLikedByMe] = useState(initialLiked);
  const [comments, setComments] = useState(initialComments);
  const [shareCount, setShareCount] = useState(initialShareCount);
  const [commentsOpen, setCommentsOpen] = useState(variant === "panel");
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onLike() {
    startTransition(async () => {
      setError(null);
      const nextLiked = !likedByMe;
      const result = await togglePostLike(postId, likedByMe);
      if (result.error) {
        setError(result.error);
        return;
      }
      setLikedByMe(nextLiked);
      setLikesCount((c) => (nextLiked ? c + 1 : Math.max(0, c - 1)));
    });
  }

  function runShare() {
    const shareUrl = `https://gradpad.io/home/${postId}/share`;
    void (async () => {
      if (typeof navigator !== "undefined" && navigator.share) {
        try {
          await navigator.share({ title: "Check out this post on Grad Pad", url: shareUrl });
        } catch {
          /* cancelled */
        }
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(shareUrl);
        } catch {
          setError("Could not copy link.");
          return;
        }
      }
      startTransition(async () => {
        const result = await sharePost(postId, shareCount);
        if (!result.error) setShareCount((c) => c + 1);
      });
    })();
  }

  function onSubmitComment() {
    const text = draft.trim();
    if (!text) return;
    startTransition(async () => {
      setError(null);
      const result = await addPostComment(postId, text);
      if (result.error) {
        setError(result.error);
        return;
      }
      setDraft("");
      setComments((prev) => [
        ...prev,
        {
          id: `local-${Date.now()}`,
          text,
          createdAt: new Date().toISOString(),
          authorName: "You",
          authorAvatarUrl: null,
        },
      ]);
    });
  }

  const actionBtn =
    "flex flex-1 items-center justify-center gap-2 rounded-md py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-page-secondary disabled:opacity-60";

  const showStats = likesCount > 0 || comments.length > 0 || shareCount > 0;

  return (
    <div className={cn(variant === "feed" && "border-t border-border", className)}>
      {error ? <p className="px-1 py-2 text-xs text-destructive">{error}</p> : null}

      {showStats ? (
        <div className="flex items-center justify-between px-1 py-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            {likesCount > 0 ? (
              <>
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                  <ThumbsUp className="h-2.5 w-2.5 fill-current" />
                </span>
                <button type="button" className="hover:text-primary hover:underline">
                  {likesCount}
                </button>
              </>
            ) : (
              <span />
            )}
          </div>
          <div className="flex items-center gap-2">
            {comments.length > 0 ? (
              <button
                type="button"
                className="hover:text-primary hover:underline"
                onClick={() => setCommentsOpen(true)}
              >
                {comments.length} comment{comments.length === 1 ? "" : "s"}
              </button>
            ) : null}
            {shareCount > 0 ? (
              <span>
                {comments.length > 0 ? " · " : ""}
                {shareCount} repost{shareCount === 1 ? "" : "s"}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="flex border-t border-border">
        <button
          type="button"
          className={cn(actionBtn, likedByMe && "text-primary")}
          disabled={pending}
          onClick={onLike}
        >
          <ThumbsUp className={cn("h-[18px] w-[18px]", likedByMe && "fill-current")} />
          Like
        </button>
        {commentAllow ? (
          <button
            type="button"
            className={actionBtn}
            disabled={pending}
            onClick={() => setCommentsOpen((v) => !v)}
          >
            <MessageCircle className="h-[18px] w-[18px]" />
            Comment
          </button>
        ) : null}
        <button type="button" className={actionBtn} disabled={pending} onClick={runShare}>
          <Repeat2 className="h-[18px] w-[18px]" />
          Repost
        </button>
        <button type="button" className={actionBtn} disabled={pending} onClick={runShare}>
          <Send className="h-[18px] w-[18px]" />
          Send
        </button>
      </div>

      {commentsOpen && commentAllow ? (
        <div className="space-y-3 border-t border-border px-1 py-3">
          <div className="flex gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, 300))}
              placeholder="Add a comment…"
              rows={2}
              className="min-h-[44px] flex-1 resize-none rounded-full border border-input-border bg-page-secondary/50 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            />
            <Button
              type="button"
              size="sm"
              className="self-end rounded-full px-4"
              disabled={pending || !draft.trim()}
              onClick={onSubmitComment}
            >
              Post
            </Button>
          </div>
          <ul className="space-y-3">
            {comments.map((comment) => (
              <li key={comment.id} className="flex gap-2">
                <Avatar
                  alt={comment.authorName}
                  fallback={comment.authorName}
                  src={comment.authorAvatarUrl}
                  size="sm"
                />
                <div className="min-w-0 flex-1 rounded-2xl bg-page-secondary px-3 py-2">
                  <p className="text-xs font-semibold">{comment.authorName}</p>
                  <p className="text-sm leading-relaxed">{comment.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
