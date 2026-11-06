"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Repeat2, Send } from "lucide-react";
import { ProfileAvatarLink } from "@/components/profile/ProfileAvatarLink";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PostReactionLikeButton } from "@/components/posts/PostReactionLikeButton";
import { useShellData } from "@/components/layout/ShellDataProvider";
import {
  addPostComment,
  deletePostComment,
  editPostComment,
  sharePost,
  togglePostLike,
} from "@/lib/posts/interactions";
import { notifyHomeFeedInvalidate } from "@/lib/posts/home-feed-cache";
import {
  forgetOwnComment,
  isOwnComment,
  rememberOwnComment,
} from "@/lib/posts/post-comment-ownership-cache";
import type { PostCommentRow } from "@/lib/posts/map-post";
import {
  normalizeReactionType,
  type PostReactionType,
} from "@/lib/posts/post-reactions";
import { cn } from "@/lib/utils/cn";

type Props = {
  postId: string;
  communityId?: string | null;
  likesCount: number;
  likedByMe: boolean;
  reactionType?: string | null;
  commentAllow: boolean;
  comments: PostCommentRow[];
  shareCount: number;
  variant?: "feed" | "panel";
  className?: string;
};

export function PostEngagementBar({
  postId,
  communityId = null,
  likesCount: initialLikes,
  likedByMe: initialLiked,
  reactionType: initialReactionType,
  commentAllow,
  comments: initialComments,
  shareCount: initialShareCount,
  variant = "feed",
  className,
}: Props) {
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [likedByMe, setLikedByMe] = useState(initialLiked);
  const [reactionType, setReactionType] = useState<PostReactionType>(() =>
    normalizeReactionType(initialReactionType),
  );
  const [comments, setComments] = useState(initialComments);
  const [shareCount, setShareCount] = useState(initialShareCount);
  const [commentsOpen, setCommentsOpen] = useState(variant === "panel");
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [commentBusyId, setCommentBusyId] = useState<string | null>(null);
  const [deleteConfirmCommentId, setDeleteConfirmCommentId] = useState<string | null>(null);
  const likeInFlight = useRef(false);
  const { shellUser } = useShellData();
  const viewerId = shellUser.id ?? null;

  useEffect(() => {
    setLikesCount(initialLikes);
    setLikedByMe(initialLiked);
    setReactionType(normalizeReactionType(initialReactionType));
    setComments(initialComments);
    setShareCount(initialShareCount);
    for (const comment of initialComments) {
      if (
        comment.canEdit ||
        (viewerId && comment.authorUserId && comment.authorUserId === viewerId)
      ) {
        rememberOwnComment(postId, comment.id);
      }
    }
  }, [
    initialLikes,
    initialLiked,
    initialReactionType,
    initialComments,
    initialShareCount,
    postId,
    viewerId,
  ]);

  useEffect(() => {
    if (!viewerId) return;
    setComments((prev) => prev.map((c) => enrichOwnComment(c)));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- enrich when shell user id hydrates
  }, [viewerId, shellUser.fullName, shellUser.avatarUrl]);

  function canManageComment(comment: PostCommentRow): boolean {
    return Boolean(
      comment.canEdit ||
        isOwnComment(postId, comment.id) ||
        (viewerId && comment.authorUserId && comment.authorUserId === viewerId) ||
        comment.authorName === "You",
    );
  }

  function enrichOwnComment(comment: PostCommentRow): PostCommentRow {
    if (!canManageComment(comment)) return comment;
    return {
      ...comment,
      authorName: shellUser.fullName,
      authorAvatarUrl: comment.authorAvatarUrl ?? shellUser.avatarUrl,
      canEdit: true,
      authorUserId: comment.authorUserId ?? viewerId,
    };
  }

  function onReactionToggle(category: PostReactionType) {
    if (likeInFlight.current) return;

    const prevLiked = likedByMe;
    const prevCount = likesCount;
    const prevReaction = reactionType;
    const nextCategory = normalizeReactionType(category);

    let apiLikedByMe: boolean;
    let apiCategory: PostReactionType;

    if (!prevLiked) {
      apiLikedByMe = false;
      apiCategory = nextCategory;
      setLikedByMe(true);
      setLikesCount((c) => c + 1);
      setReactionType(nextCategory);
    } else if (prevReaction === nextCategory) {
      apiLikedByMe = true;
      apiCategory = prevReaction;
      setLikedByMe(false);
      setLikesCount((c) => Math.max(0, c - 1));
      setReactionType("like");
    } else {
      apiLikedByMe = false;
      apiCategory = nextCategory;
      setReactionType(nextCategory);
    }

    setError(null);
    likeInFlight.current = true;
    void (async () => {
      try {
        const result = await togglePostLike(postId, apiLikedByMe, apiCategory);
        if (result.error) {
          setLikedByMe(prevLiked);
          setLikesCount(prevCount);
          setReactionType(prevReaction);
          setError(result.error);
        }
      } finally {
        likeInFlight.current = false;
      }
    })();
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
      const result = await sharePost(postId, shareCount);
      if (!result.error) setShareCount((c) => c + 1);
    })();
  }

  async function onSubmitComment() {
    const text = draft.trim();
    if (!text || commentSubmitting) return;
    setCommentSubmitting(true);
    setError(null);
    const result = await addPostComment(postId, text);
    setCommentSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setDraft("");
    if (result.comment) {
      const next = enrichOwnComment(result.comment);
      rememberOwnComment(postId, next.id);
      setComments((prev) => [...prev, next]);
      notifyHomeFeedInvalidate(communityId ?? undefined);
    }
  }

  async function onSaveEdit(commentId: string) {
    const text = editDraft.trim();
    if (!text) return;
    setCommentBusyId(commentId);
    setError(null);
    const result = await editPostComment(postId, commentId, text);
    setCommentBusyId(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, text } : c)),
    );
    setEditingCommentId(null);
    setEditDraft("");
  }

  function requestDeleteComment(commentId: string) {
    setDeleteConfirmCommentId(commentId);
  }

  async function confirmDeleteComment() {
    const commentId = deleteConfirmCommentId;
    if (!commentId) return;
    setCommentBusyId(commentId);
    setError(null);
    const result = await deletePostComment(postId, commentId);
    setCommentBusyId(null);
    setDeleteConfirmCommentId(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    forgetOwnComment(postId, commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    notifyHomeFeedInvalidate(communityId ?? undefined);
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
              <button type="button" className="hover:text-primary hover:underline">
                {likesCount} {likesCount === 1 ? "reaction" : "reactions"}
              </button>
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
        <PostReactionLikeButton
          likedByMe={likedByMe}
          reactionType={reactionType}
          onToggle={onReactionToggle}
        />
        {commentAllow ? (
          <button
            type="button"
            className={actionBtn}
            onClick={() => setCommentsOpen((v) => !v)}
          >
            <MessageCircle className="h-[18px] w-[18px]" />
            Comment
          </button>
        ) : null}
        <button type="button" className={actionBtn} onClick={runShare}>
          <Repeat2 className="h-[18px] w-[18px]" />
          Repost
        </button>
        <button type="button" className={actionBtn} onClick={runShare}>
          <Send className="h-[18px] w-[18px]" />
          Send
        </button>
      </div>

      {commentsOpen && commentAllow ? (
        <div className="space-y-3 border-t border-border px-1 py-3">
          <div className="flex gap-2">
            <ProfileAvatarLink
              userId={shellUser.id}
              linkable={false}
              alt={shellUser.fullName}
              fallback={shellUser.fullName}
              src={shellUser.avatarUrl}
              size="sm"
              className="mt-1 shrink-0"
            />
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, 300))}
              placeholder="Add a comment…"
              rows={2}
              className="min-h-[44px] flex-1 resize-none rounded-full border border-input-border bg-page-secondary/50 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void onSubmitComment();
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              className="self-end rounded-full px-4"
              disabled={commentSubmitting || !draft.trim()}
              onClick={() => void onSubmitComment()}
            >
              {commentSubmitting ? "…" : "Post"}
            </Button>
          </div>
          <ul className="space-y-3">
            {comments.map((raw) => {
              const comment = enrichOwnComment(raw);
              const managing = canManageComment(comment);
              const editing = editingCommentId === comment.id;
              const busy = commentBusyId === comment.id;
              return (
                <li key={comment.id} className="flex gap-2">
                  <ProfileAvatarLink
                    userId={comment.authorUserId}
                    alt={comment.authorName}
                    fallback={comment.authorName}
                    src={comment.authorAvatarUrl}
                    size="sm"
                    className="shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="rounded-2xl bg-page-secondary px-3 py-2">
                      <p className="text-xs font-semibold">{comment.authorName}</p>
                      {editing ? (
                        <textarea
                          value={editDraft}
                          onChange={(e) => setEditDraft(e.target.value.slice(0, 300))}
                          rows={2}
                          className="mt-1 w-full resize-none rounded-lg border border-input-border bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                        />
                      ) : (
                        <p className="text-sm leading-relaxed">{comment.text}</p>
                      )}
                    </div>
                    {managing ? (
                      editing ? (
                        <div className="mt-1.5 flex gap-2 text-xs font-medium">
                          <button
                            type="button"
                            className="rounded-md bg-primary px-2.5 py-1 text-white disabled:opacity-60"
                            disabled={busy || !editDraft.trim()}
                            onClick={() => void onSaveEdit(comment.id)}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="rounded-md border border-border px-2.5 py-1 text-muted-foreground"
                            disabled={busy}
                            onClick={() => {
                              setEditingCommentId(null);
                              setEditDraft("");
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <p className="mt-1 text-xs font-medium text-muted-foreground">
                          <button
                            type="button"
                            className="hover:text-primary hover:underline"
                            disabled={busy}
                            onClick={() => {
                              setEditingCommentId(comment.id);
                              setEditDraft(comment.text);
                            }}
                          >
                            Edit
                          </button>
                          <span className="mx-1.5" aria-hidden>
                            |
                          </span>
                          <button
                            type="button"
                            className="hover:text-destructive hover:underline"
                            disabled={busy}
                            onClick={() => requestDeleteComment(comment.id)}
                          >
                            Delete
                          </button>
                        </p>
                      )
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <ConfirmDialog
        open={deleteConfirmCommentId != null}
        title="Delete comment?"
        description="This will permanently remove your comment from the post."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        busy={commentBusyId != null && commentBusyId === deleteConfirmCommentId}
        onCancel={() => setDeleteConfirmCommentId(null)}
        onConfirm={() => void confirmDeleteComment()}
      />
    </div>
  );
}
