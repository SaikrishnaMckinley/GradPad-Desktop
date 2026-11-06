import { buildCommunityInviteUrl } from "@/lib/communities/community-invite-url";

export type CommunityInviteSharePayload = {
  url: string;
  title: string;
  text: string;
};

async function writeTextToClipboard(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      /* fallback */
    }
  }
  if (typeof document === "undefined") return;
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function getCommunityInviteSharePayload(
  communityId: string,
  communityName?: string,
): CommunityInviteSharePayload {
  const url = buildCommunityInviteUrl(communityId);
  const name = communityName?.trim() || "this community";
  const title = `Join ${name} on Grad Pad`;
  const text = `You're invited to join ${name} on Grad Pad.`;
  return { url, title, text };
}

export async function copyCommunityInviteLink(communityId: string): Promise<void> {
  const { url } = getCommunityInviteSharePayload(communityId);
  await writeTextToClipboard(url);
}

export function canUseNativeShare(): boolean {
  return typeof navigator !== "undefined" && Boolean(navigator.share);
}

export async function nativeShareCommunityInvite(
  communityId: string,
  communityName?: string,
): Promise<void> {
  if (!canUseNativeShare()) {
    throw new Error("Native share is not available");
  }
  const { url, title, text } = getCommunityInviteSharePayload(communityId, communityName);
  await navigator.share({ url, title, text });
}

export function whatsAppInviteShareUrl(communityId: string, communityName?: string): string {
  const { url, text } = getCommunityInviteSharePayload(communityId, communityName);
  return `https://wa.me/?text=${encodeURIComponent(`${text}\n\n${url}`)}`;
}

export function emailInviteShareUrl(communityId: string, communityName?: string): string {
  const { url, title, text } = getCommunityInviteSharePayload(communityId, communityName);
  return `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;
}

export function smsInviteShareUrl(communityId: string, communityName?: string): string {
  const { url, text } = getCommunityInviteSharePayload(communityId, communityName);
  return `sms:?&body=${encodeURIComponent(`${text}\n\n${url}`)}`;
}

/** @deprecated Prefer copy + menu actions; kept for simple call sites. */
export async function shareCommunityInviteLink(
  communityId: string,
  communityName?: string,
): Promise<"shared" | "copied"> {
  await copyCommunityInviteLink(communityId);
  return "copied";
}
