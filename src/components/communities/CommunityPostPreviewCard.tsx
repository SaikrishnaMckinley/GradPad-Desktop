"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Globe, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PostContentBody } from "@/components/posts/PostContentBody";
import { PostDescriptionEditor } from "@/components/posts/PostDescriptionEditor";
import { PostEditMediaSection } from "@/components/posts/PostEditMediaSection";
import { PostEngagementBar } from "@/components/posts/PostEngagementBar";
import { PostMediaGallery } from "@/components/posts/PostMediaGallery";
import { PostMediaLightbox } from "@/components/posts/PostMediaLightbox";
import { deletePost, fetchPostForEdit, updatePost } from "@/lib/posts/actions";
import type { PostCommentRow } from "@/lib/posts/map-post";
import { notifyHomeFeedInvalidate } from "@/lib/posts/home-feed-cache";
import { getPostMediaItems, type PostMediaItem } from "@/lib/posts/post-media";
import { plainTextFromPostHtml } from "@/lib/posts/rich-text";
import { formatTimeAgo } from "@/lib/utils/time-ago";

type Props = {
  postId: string;
  communityId?: string | null;
  communityName: string;
  channelName?: string | null;
  authorName: string;
  authorAvatarUrl?: string | null;
  createdAt: string;
  title: string | null;
  content: string;
  media?: PostMediaItem[];
  canEdit?: boolean;
  likesCount?: number;
  likedByMe?: boolean;
  commentAllow?: boolean;
  comments?: PostCommentRow[];
  shareCount?: number;
};

export function CommunityPostPreviewCard({
  postId,
  communityId = null,
  communityName,
  channelName,
  authorName,
  authorAvatarUrl,
  createdAt,
  title,
  content,
  media = [],
  canEdit = false,
  likesCount = 0,
  likedByMe = false,
  commentAllow = true,
  comments = [],
  shareCount = 0,
}: Props) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [editTitle, setEditTitle] = useState(title ?? "");
  const [editContent, setEditContent] = useState(content);
  const [editExistingMedia, setEditExistingMedia] = useState<PostMediaItem[]>([]);
  const [editNewFiles, setEditNewFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);
  const [publishedTitle, setPublishedTitle] = useState<string | null>(null);
  const [publishedContent, setPublishedContent] = useState<string | null>(null);

  const viewTitle = publishedTitle ?? title;
  const viewContent = publishedContent ?? content;

  useEffect(() => {
    if (editing) return;
    setEditTitle(title ?? "");
    setEditContent(content);
  }, [title, content, editing]);

  useEffect(() => {
    if (publishedContent == null) return;
    const serverPlain = plainTextFromPostHtml(content);
    const localPlain = plainTextFromPostHtml(publishedContent);
    if (serverPlain === localPlain && (title ?? "") === (publishedTitle ?? title ?? "")) {
      setPublishedContent(null);
      setPublishedTitle(null);
    }
  }, [content, title, publishedContent, publishedTitle]);

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [menuOpen]);

  const displayMedia = useMemo(
    () =>
      getPostMediaItems({
        media: media.map((m) => ({ file: m.url, media_type: m.type })),
        content: viewContent,
        comment: viewContent,
      }),
    [media, viewContent],
  );

  const timeAgo = formatTimeAgo(createdAt);
  const contextLine = channelName
    ? `${communityName} · ${channelName}`
    : communityName;

  function onDelete() {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    setMenuOpen(false);
    startTransition(async () => {
      setError(null);
      const result = await deletePost(postId);
      if (result.error) {
        setError(result.error);
        return;
      }
      notifyHomeFeedInvalidate(communityId ?? undefined);
      router.refresh();
    });
  }

  function startEditing() {
    setMenuOpen(false);
    setLoadingEdit(true);
    setError(null);
    startTransition(async () => {
      const snapshot = await fetchPostForEdit(postId);
      setLoadingEdit(false);
      if ("error" in snapshot) {
        setEditTitle(title ?? "");
        setEditContent(content);
        setEditExistingMedia([...displayMedia]);
        setError(snapshot.error);
      } else {
        setEditTitle(snapshot.title);
        setEditContent(snapshot.content);
        setEditExistingMedia([...snapshot.media]);
      }
      setEditNewFiles([]);
      setEditing(true);
    });
  }

  function onSaveEdit() {
    startTransition(async () => {
      setError(null);
      const form = new FormData();
      form.set("title", editTitle);
      form.set("content", editContent);
      for (const item of editExistingMedia) {
        form.append("existing_media_urls", item.url);
        form.append(
          "existing_media_types",
          item.type.startsWith("video") ? "video" : "image",
        );
      }
      for (const file of editNewFiles) {
        form.append("uploaded_files", file);
      }
      const result = await updatePost(postId, null, form);
      if (result.error) {
        setError(result.error);
        return;
      }
      setPublishedTitle(editTitle);
      setPublishedContent(editContent);
      setEditing(false);
      setMenuOpen(false);
      setExpanded(true);
      notifyHomeFeedInvalidate(communityId ?? undefined);
      router.refresh();
    });
  }

  const engagementProps = {
    postId,
    likesCount,
    likedByMe,
    commentAllow,
    comments,
    shareCount,
  };

  return (
    <>
      <Card className="overflow-hidden rounded-lg border border-border shadow-sm">
        <div className="px-4 pt-4">
          {error ? (
            <p className="mb-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <div className="flex gap-3">
            <Avatar
              alt={authorName}
              fallback={authorName}
              src={authorAvatarUrl}
              size="md"
              className="h-12 w-12 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold leading-snug text-foreground">
                    {authorName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{contextLine}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <span>{timeAgo}</span>
                    <span>·</span>
                    <Globe className="h-3 w-3" aria-hidden />
                  </p>
                </div>
                {canEdit ? (
                  <div className="relative shrink-0" ref={menuRef}>
                    <button
                      type="button"
                      className="rounded-full p-1.5 text-muted-foreground hover:bg-page-secondary hover:text-foreground"
                      aria-label="Post options"
                      aria-expanded={menuOpen}
                      onClick={() => setMenuOpen((v) => !v)}
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                    {menuOpen ? (
                      <div
                        className="absolute right-0 top-full z-20 mt-1 min-w-[140px] overflow-hidden rounded-lg border border-border bg-card py-1 shadow-lg"
                        role="menu"
                      >
                        <button
                          type="button"
                          role="menuitem"
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-page-secondary disabled:opacity-50"
                          onClick={startEditing}
                          disabled={loadingEdit || pending}
                        >
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                          {loadingEdit ? "Loading…" : "Edit"}
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/5"
                          onClick={onDelete}
                          disabled={pending}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {editing ? (
            <div className="mt-4 space-y-4 rounded-xl border border-primary/20 bg-page-secondary/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Edit post
              </p>
              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor={`title-${postId}`}>
                  Title
                </label>
                <Input
                  id={`title-${postId}`}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>
              <PostDescriptionEditor
                id={`content-${postId}`}
                name="content"
                label="Description"
                value={editContent}
                onChange={setEditContent}
                maxPlainLength={10000}
                minRows={8}
                placeholder="Share your thoughts"
              />
              <PostEditMediaSection
                existing={editExistingMedia}
                onExistingChange={setEditExistingMedia}
                onNewFilesChange={setEditNewFiles}
              />
              <div className="flex justify-end gap-2 border-t border-border pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  onClick={() => {
                    setEditing(false);
                    setEditNewFiles([]);
                  }}
                >
                  Cancel
                </Button>
                <Button type="button" size="sm" disabled={pending} onClick={onSaveEdit}>
                  {pending ? "Saving…" : "Save"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {viewTitle ? (
                <p className="text-sm font-semibold leading-snug text-foreground">{viewTitle}</p>
              ) : null}
              <PostContentBody
                html={viewContent}
                expanded={expanded}
                onExpand={() => setExpanded(true)}
              />
            </div>
          )}
        </div>

        {!editing ? (
          <>
            <PostMediaGallery
              className="-mx-0"
              items={displayMedia}
              onOpen={(index) => {
                setLightboxIndex(index);
                setLightboxOpen(true);
              }}
            />
            <div className="px-2 pb-2 pt-1">
              <PostEngagementBar {...engagementProps} variant="feed" />
            </div>
          </>
        ) : null}
      </Card>

      <PostMediaLightbox
        open={lightboxOpen}
        items={displayMedia}
        initialIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        sidebar={
          <div className="flex h-full flex-col px-4 pb-4">
            <div className="flex gap-3 border-b border-border py-4">
              <Avatar alt={authorName} fallback={authorName} src={authorAvatarUrl} size="md" />
              <div>
                <p className="text-sm font-semibold">{authorName}</p>
                <p className="text-xs text-muted-foreground">
                  {contextLine} · {timeAgo}
                </p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto py-3">
              {viewTitle ? <p className="mb-2 text-sm font-semibold">{viewTitle}</p> : null}
              <PostContentBody html={viewContent} expanded />
            </div>
            <PostEngagementBar {...engagementProps} variant="panel" className="mt-auto" />
          </div>
        }
      />
    </>
  );
}
