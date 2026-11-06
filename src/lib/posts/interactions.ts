"use server";

import { revalidatePath } from "next/cache";
import {
  stagingAddPostCommentRaw,
  stagingDeletePostCommentRaw,
  stagingEditPostCommentRaw,
  stagingLikePostRaw,
  stagingSharePostRaw,
  stagingUnlikePostRaw,
} from "@/lib/api/posts";
import { readStagingActionError } from "@/lib/api/server-fetch";
import { getSessionTokens } from "@/lib/auth/session-cookies";
import { usesStagingApi } from "@/lib/demo-mode";
import type { PostCommentRow } from "@/lib/posts/map-post";
import { normalizeReactionType } from "@/lib/posts/post-reactions";

export type InteractionResult = { error?: string; ok?: true; comment?: PostCommentRow };

function revalidatePostSurfaces() {
  revalidatePath("/home");
  revalidatePath("/communities", "layout");
}

async function requireSession(): Promise<{ error: string } | { access: string }> {
  if (!usesStagingApi()) {
    return { error: "Posts require staging API." };
  }
  const { access } = await getSessionTokens();
  if (!access) {
    return { error: "Sign in again — your session cookie is missing." };
  }
  return { access };
}

function mapCommentFromApi(data: unknown): PostCommentRow | null {
  if (!data || typeof data !== "object") return null;
  const row = data as Record<string, unknown>;
  const nested =
    row.data && typeof row.data === "object" ? (row.data as Record<string, unknown>) : row;
  const id = nested.id != null ? String(nested.id) : null;
  if (!id) return null;

  const ownerRaw = nested.owner;
  const owner = Array.isArray(ownerRaw) ? ownerRaw[0] : ownerRaw;
  const person =
    owner && typeof owner === "object" ? (owner as Record<string, unknown>) : null;
  const authorName =
    (typeof person?.full_name === "string" && person.full_name.trim()) ||
    [person?.first_name, person?.last_name].filter(Boolean).join(" ").trim() ||
    (typeof person?.nickname === "string" && person.nickname.trim()) ||
    "You";
  const text =
    (typeof nested.title === "string" && nested.title.trim()) ||
    (typeof nested.comment === "string" && nested.comment.trim()) ||
    "";

  return {
    id,
    text,
    createdAt:
      (typeof nested.created_at === "string" && nested.created_at) || new Date().toISOString(),
    authorName,
    authorAvatarUrl:
      person && typeof person.photo === "string" ? person.photo : null,
    authorUserId: person?.id != null ? String(person.id) : null,
    canEdit: nested.is_owner === true,
  };
}

export async function togglePostLike(
  postId: string,
  likedByMe: boolean,
  category = "like",
): Promise<InteractionResult> {
  const session = await requireSession();
  if ("error" in session) return { error: session.error };

  const reaction = normalizeReactionType(category);
  const result = likedByMe
    ? await stagingUnlikePostRaw(postId, reaction)
    : await stagingLikePostRaw(postId, reaction);

  if (!result.ok) {
    return { error: readStagingActionError(result) ?? "Could not update like." };
  }

  return { ok: true };
}

export async function addPostComment(
  postId: string,
  text: string,
): Promise<InteractionResult> {
  const session = await requireSession();
  if ("error" in session) return { error: session.error };

  const trimmed = text.trim();
  if (!trimmed) {
    return { error: "Write a comment first." };
  }
  if (trimmed.length > 300) {
    return { error: "Comments are limited to 300 characters." };
  }

  const result = await stagingAddPostCommentRaw(postId, trimmed);
  if (!result.ok) {
    return { error: readStagingActionError(result) ?? "Could not add comment." };
  }

  const parsed = mapCommentFromApi(result.data);
  return {
    ok: true,
    comment:
      parsed ??
      ({
        id: `local-${Date.now()}`,
        text: trimmed,
        createdAt: new Date().toISOString(),
        authorName: "You",
        authorAvatarUrl: null,
        canEdit: true,
      } satisfies PostCommentRow),
  };
}

export async function sharePost(postId: string, levelCount: number): Promise<InteractionResult> {
  const session = await requireSession();
  if ("error" in session) return { error: session.error };

  const result = await stagingSharePostRaw(postId, levelCount + 1);
  if (!result.ok) {
    return { error: readStagingActionError(result) ?? "Could not record share." };
  }

  revalidatePostSurfaces();
  return { ok: true };
}

export async function editPostComment(
  postId: string,
  commentId: string,
  text: string,
): Promise<InteractionResult> {
  const session = await requireSession();
  if ("error" in session) return { error: session.error };

  const trimmed = text.trim();
  if (!trimmed) {
    return { error: "Write a comment first." };
  }
  if (trimmed.length > 300) {
    return { error: "Comments are limited to 300 characters." };
  }

  const result = await stagingEditPostCommentRaw(postId, commentId, trimmed);
  if (!result.ok) {
    return { error: readStagingActionError(result) ?? "Could not update comment." };
  }

  return { ok: true };
}

export async function deletePostComment(
  postId: string,
  commentId: string,
): Promise<InteractionResult> {
  const session = await requireSession();
  if ("error" in session) return { error: session.error };

  const result = await stagingDeletePostCommentRaw(postId, commentId);
  if (!result.ok) {
    return { error: readStagingActionError(result) ?? "Could not delete comment." };
  }

  return { ok: true };
}
