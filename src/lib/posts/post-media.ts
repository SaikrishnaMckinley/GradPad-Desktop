export type PostMediaItem = { url: string; type: "image" | "video" | string };

function isValidMediaUrl(url?: string | null): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  return trimmed.length > 0 && trimmed !== "null" && trimmed !== "undefined";
}

function normalizeMediaType(raw?: string | null, url?: string): string {
  if (raw?.startsWith("video")) return "video";
  if (raw?.startsWith("image") || raw === "gif") return "image";
  if (url && /\.(mp4|webm|mov)(\?|$)/i.test(url)) return "video";
  return "image";
}

export function extractInlineImages(html: string): string[] {
  const urls: string[] = [];
  const re = /<img[^>]+src=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    if (match[1]) urls.push(match[1]);
  }
  return urls;
}

type ApiMediaRow = {
  file?: string | null;
  media_type?: string | null;
};

export function getPostMediaItems(post: {
  media?: ApiMediaRow[] | null;
  image?: string | null;
  content?: string | null;
  comment?: string | null;
}): PostMediaItem[] {
  const seen = new Set<string>();
  const items: PostMediaItem[] = [];

  function add(url: string, type?: string | null) {
    const trimmed = url.trim();
    if (!isValidMediaUrl(trimmed) || seen.has(trimmed)) return;
    seen.add(trimmed);
    items.push({ url: trimmed, type: normalizeMediaType(type, trimmed) });
  }

  if (post.media && Array.isArray(post.media)) {
    for (const item of post.media) {
      if (isValidMediaUrl(item.file)) {
        add(item.file!, item.media_type);
      }
    }
  }

  if (isValidMediaUrl(post.image)) {
    add(post.image!, "image");
  }

  const html = post.content ?? post.comment ?? "";
  if (html.includes("<img")) {
    for (const url of extractInlineImages(html)) {
      add(url, "image");
    }
  }

  return items;
}
