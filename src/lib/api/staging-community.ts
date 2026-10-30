import "server-only";

import type { ApiCommunityRecord } from "@/lib/api/map-community";
import { parseStagingError, stagingRequest } from "@/lib/api/staging-request";

export type StagingCreateCommunityInput = {
  name: string;
  description: string;
  isPrivate: boolean;
  logo?: File | null;
  image?: File | null;
};

export function extractCreatedCommunityRecord(data: unknown): ApiCommunityRecord | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;

  if (record.community && typeof record.community === "object") {
    return record.community as ApiCommunityRecord;
  }

  if (record.id != null && record.name) {
    return record as ApiCommunityRecord;
  }

  return null;
}

export function extractCreatedCommunityId(data: unknown): string | null {
  const community = extractCreatedCommunityRecord(data);
  return community?.id != null ? String(community.id) : null;
}

/** Mirrors gradpad-web `createCommunity` → POST `community/` (JSON or multipart). */
export async function stagingCreateCommunity(
  accessToken: string,
  input: StagingCreateCommunityInput,
): Promise<
  | { ok: true; status: number; data: unknown; community: ApiCommunityRecord }
  | { ok: false; status: number; error: string }
> {
  const hasFiles =
    (input.logo instanceof File && input.logo.size > 0) ||
    (input.image instanceof File && input.image.size > 0);

  let body: BodyInit;
  if (hasFiles) {
    const form = new FormData();
    form.append("name", input.name);
    form.append("description", input.description);
    form.append("is_private", input.isPrivate ? "true" : "false");
    if (input.logo instanceof File && input.logo.size > 0) {
      form.append("logo", input.logo);
    }
    if (input.image instanceof File && input.image.size > 0) {
      form.append("image", input.image);
    }
    body = form;
  } else {
    body = JSON.stringify({
      name: input.name,
      description: input.description,
      is_private: input.isPrivate,
    });
  }

  const response = await stagingRequest("community/", {
    method: "POST",
    body,
    accessToken,
  });

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const retry = new Response(text, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
    return { ok: false, status: response.status, error: await parseStagingError(retry) };
  }

  const community = extractCreatedCommunityRecord(data);
  if (!community?.id) {
    return {
      ok: false,
      status: response.status,
      error: "Community was created but the response shape was unexpected.",
    };
  }

  return { ok: true, status: response.status, data, community };
}
