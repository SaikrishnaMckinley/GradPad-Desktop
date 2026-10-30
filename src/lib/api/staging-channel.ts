import "server-only";

import { parseStagingError, stagingRequest } from "@/lib/api/staging-request";

export type StagingCreateChannelInput = {
  name: string;
  description: string;
  visibility: "public" | "private";
  passcode?: string;
  logo: File;
  image?: File | null;
};

export type CreatedChannelRecord = {
  id: string;
  slug: string;
};

function mapChannelRecord(data: unknown): CreatedChannelRecord | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  const raw =
    record.channel && typeof record.channel === "object"
      ? (record.channel as Record<string, unknown>)
      : record;

  if (raw.id == null) return null;
  const id = String(raw.id);
  const slug =
    typeof raw.slug === "string" && raw.slug.trim()
      ? raw.slug.trim().toLowerCase()
      : id;
  return { id, slug };
}

/** Mirrors gradpad-web `createChannel` → POST `community/{id}/channels/` (multipart). */
export async function stagingCreateChannel(
  accessToken: string,
  communityId: string,
  input: StagingCreateChannelInput,
): Promise<
  | { ok: true; status: number; channel: CreatedChannelRecord }
  | { ok: false; status: number; error: string }
> {
  const form = new FormData();
  form.append("visibility", input.visibility);
  form.append("name", input.name);
  form.append("description", input.description);
  form.append("terms_conditions", " ");
  form.append("passcode", input.passcode?.trim() ?? "");
  form.append("logo", input.logo);
  if (input.image instanceof File && input.image.size > 0) {
    form.append("image", input.image);
  }

  const response = await stagingRequest(`community/${communityId}/channels/`, {
    method: "POST",
    body: form,
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

  const channel = mapChannelRecord(data);
  if (!channel) {
    return {
      ok: false,
      status: response.status,
      error: "Channel was created but the response shape was unexpected.",
    };
  }

  return { ok: true, status: response.status, channel };
}
