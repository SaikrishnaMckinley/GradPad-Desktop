"use server";

import { revalidatePath } from "next/cache";
import {
  fetchPostByIdRaw,
  stagingCreatePostRaw,
  stagingDeletePostRaw,
  stagingUpdatePostRaw,
} from "@/lib/api/posts";
import { getPostMediaItems, type PostMediaItem } from "@/lib/posts/post-media";
import { readStagingActionError } from "@/lib/api/server-fetch";
import { getSessionTokens } from "@/lib/auth/session-cookies";
import { usesStagingApi } from "@/lib/demo-mode";
import type { ActionResult } from "@/lib/communities/actions";
import { postEditSchema, postFormSchema } from "@/lib/validations/post";

function revalidatePostSurfaces() {
  revalidatePath("/home");
  revalidatePath("/communities", "layout");
  revalidatePath("/create");
}

export async function createPost(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  if (!usesStagingApi()) {
    return {
      error:
        "Posts use the staging API. Set NEXT_PUBLIC_DEMO_STATIC_UI=false and sign in with staging.",
    };
  }

  const { access } = await getSessionTokens();
  if (!access) {
    return { error: "Sign in again — your session cookie is missing." };
  }

  const parsed = postFormSchema.safeParse({
    communityId: formData.get("communityId"),
    channelId: formData.get("channelId"),
    title: formData.get("title"),
    content: formData.get("content"),
    commentAllow: formData.get("commentAllow") === "on" || formData.get("commentAllow") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const channelId = parsed.data.channelId?.trim();
  const postType = channelId ? "channel" : "community";

  const body = new FormData();
  body.append("title", parsed.data.title);
  body.append("comment", parsed.data.content);
  body.append("is_active", "true");
  body.append("is_private", "false");
  body.append("post_type", postType);
  body.append("comment_allow", parsed.data.commentAllow ? "true" : "false");
  body.append("community", parsed.data.communityId);
  if (channelId) {
    body.append("channel", channelId);
  }

  const media = formData.getAll("media");
  for (const file of media) {
    if (file instanceof File && file.size > 0) {
      body.append("media_files", file);
      body.append("uploaded_files", file);
      body.append(
        "file_types",
        file.type.startsWith("video/") ? "video" : "image",
      );
    }
  }

  const result = await stagingCreatePostRaw(body);
  if (!result.ok) {
    return { error: readStagingActionError(result) ?? "Could not create post." };
  }

  revalidatePostSurfaces();

  return {
    success: "Post published.",
    redirectTo: "/home",
  };
}

export type PostEditSnapshot = {
  title: string;
  content: string;
  media: PostMediaItem[];
};

export async function fetchPostForEdit(postId: string): Promise<
  | { error: string }
  | PostEditSnapshot
> {
  if (!usesStagingApi()) {
    return { error: "Posts require staging API." };
  }

  const { access } = await getSessionTokens();
  if (!access) {
    return { error: "Sign in again — your session cookie is missing." };
  }

  const result = await fetchPostByIdRaw(postId);
  if (!result.ok || !result.data) {
    return { error: readStagingActionError(result) ?? "Could not load post." };
  }

  const post = result.data as {
    title?: string | null;
    content?: string | null;
    comment?: string | null;
    media?: { file?: string | null; media_type?: string | null }[];
    image?: string | null;
  };

  const html = post.content ?? post.comment ?? "";

  return {
    title: post.title?.trim() ?? "",
    content: html.trim(),
    media: getPostMediaItems(post),
  };
}

export async function updatePost(
  postId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  if (!usesStagingApi()) {
    return { error: "Posts require staging API." };
  }

  const { access } = await getSessionTokens();
  if (!access) {
    return { error: "Sign in again — your session cookie is missing." };
  }

  const parsed = postEditSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const body = new FormData();
  body.append("title", parsed.data.title);
  body.append("comment", parsed.data.content);
  body.append("is_active", "true");
  body.append("replace_media", "true");

  for (const url of formData.getAll("existing_media_urls")) {
    if (typeof url === "string" && url.trim()) {
      body.append("existing_media_urls", url.trim());
    }
  }
  for (const type of formData.getAll("existing_media_types")) {
    if (typeof type === "string" && type.trim()) {
      body.append("existing_media_types", type.trim());
    }
  }

  for (const file of formData.getAll("uploaded_files")) {
    if (file instanceof File && file.size > 0) {
      body.append("uploaded_files", file);
      body.append(
        "file_types",
        file.type.startsWith("video/") ? "video" : "image",
      );
    }
  }

  const result = await stagingUpdatePostRaw(postId, body);
  if (!result.ok) {
    return { error: readStagingActionError(result) ?? "Could not update post." };
  }

  revalidatePostSurfaces();
  return { success: "Post updated." };
}

export async function deletePost(postId: string): Promise<ActionResult> {
  if (!usesStagingApi()) {
    return { error: "Posts require staging API." };
  }

  const { access } = await getSessionTokens();
  if (!access) {
    return { error: "Sign in again — your session cookie is missing." };
  }

  const result = await stagingDeletePostRaw(postId);
  if (!result.ok) {
    return { error: readStagingActionError(result) ?? "Could not delete post." };
  }

  revalidatePostSurfaces();
  return { success: "Post deleted." };
}
