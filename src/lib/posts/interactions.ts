"use server";

import { revalidatePath } from "next/cache";
import {
  stagingAddPostCommentRaw,
  stagingLikePostRaw,
  stagingSharePostRaw,
  stagingUnlikePostRaw,
} from "@/lib/api/posts";
import { readStagingActionError } from "@/lib/api/server-fetch";
import { getSessionTokens } from "@/lib/auth/session-cookies";
import { usesStagingApi } from "@/lib/demo-mode";

export type InteractionResult = { error?: string; ok?: true };

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

export async function togglePostLike(
  postId: string,
  likedByMe: boolean,
  category = "like",
): Promise<InteractionResult> {
  const session = await requireSession();
  if ("error" in session) return { error: session.error };

  const result = likedByMe
    ? await stagingUnlikePostRaw(postId, category)
    : await stagingLikePostRaw(postId, category);

  if (!result.ok) {
    return { error: readStagingActionError(result) ?? "Could not update like." };
  }

  revalidatePostSurfaces();
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

  revalidatePostSurfaces();
  return { ok: true };
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
