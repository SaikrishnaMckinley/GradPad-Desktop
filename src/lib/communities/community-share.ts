import { buildCommunityInviteUrl } from "@/lib/communities/community-invite-url";

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

export async function shareCommunityInviteLink(
  communityId: string,
  communityName?: string,
): Promise<"shared" | "copied"> {
  const url = buildCommunityInviteUrl(communityId);
  const title = communityName?.trim()
    ? `Join ${communityName} on Grad Pad`
    : "Join this community on Grad Pad";

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ url, title });
      return "shared";
    } catch (err) {
      if ((err as Error)?.name === "AbortError") throw err;
    }
  }

  await writeTextToClipboard(url);
  return "copied";
}
