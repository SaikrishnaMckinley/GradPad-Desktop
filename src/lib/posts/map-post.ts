import { unwrapList } from "@/lib/api/parse-list";
import { getPostMediaItems, type PostMediaItem } from "@/lib/posts/post-media";

export type PostCommentRow = {
  id: string;
  text: string;
  createdAt: string;
  authorName: string;
  authorAvatarUrl: string | null;
};

export type FeedPostRow = {
  id: string;
  title: string | null;
  content: string;
  authorName: string;
  authorAvatarUrl: string | null;
  createdAt: string;
  communityName: string | null;
  channelName: string | null;
  postType: "community" | "channel" | "event" | string;
  media: PostMediaItem[];
  canEdit: boolean;
  likesCount: number;
  likedByMe: boolean;
  commentAllow: boolean;
  comments: PostCommentRow[];
  shareCount: number;
};

type ApiOwner = {
  id?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  nickname?: string;
  photo?: string | null;
};

type ApiChildPost = {
  id: string;
  title?: string | null;
  created_at?: string;
  owner?: ApiOwner | ApiOwner[];
};

type ApiPost = {
  id: string;
  title?: string | null;
  content?: string | null;
  comment?: string | null;
  created_at?: string;
  is_owner?: boolean;
  post_type?: string;
  image?: string | null;
  media?: { file?: string | null; media_type?: string | null }[];
  likes_count?: number;
  likedby_me?: boolean;
  comment_allow?: boolean;
  level_count?: number;
  child_posts?: ApiChildPost[] | null;
  author?: ApiOwner;
  user?: ApiOwner;
  owner?: ApiOwner | ApiOwner[];
  community?: { name?: string } | string;
  channel?: { name?: string } | string;
  event?: { title?: string } | string;
};

function nameFromRelation(value: ApiPost["community"]): string | null {
  if (!value) return null;
  if (typeof value === "string") return null;
  return value.name?.trim() ?? null;
}

function resolveAuthor(post: ApiPost): { authorName: string; authorAvatarUrl: string | null } {
  const rawOwner = post.owner;
  const owner = Array.isArray(rawOwner) ? rawOwner[0] : rawOwner;

  const candidates = [owner, post.author, post.user].filter(Boolean) as ApiOwner[];

  for (const person of candidates) {
    const name =
      person.full_name?.trim() ||
      [person.first_name, person.last_name].filter(Boolean).join(" ").trim() ||
      person.nickname?.trim();
    if (name) {
      return { authorName: name, authorAvatarUrl: person.photo ?? null };
    }
  }

  return { authorName: "Member", authorAvatarUrl: null };
}

function authorFromOwner(owner: ApiChildPost["owner"]): {
  authorName: string;
  authorAvatarUrl: string | null;
} {
  const raw = owner;
  const person = Array.isArray(raw) ? raw[0] : raw;
  if (!person) return { authorName: "Member", authorAvatarUrl: null };
  const name =
    person.full_name?.trim() ||
    [person.first_name, person.last_name].filter(Boolean).join(" ").trim() ||
    person.nickname?.trim();
  return {
    authorName: name || "Member",
    authorAvatarUrl: person.photo ?? null,
  };
}

function mapComments(childPosts: ApiChildPost[] | null | undefined): PostCommentRow[] {
  if (!childPosts?.length) return [];
  return childPosts.map((row) => {
    const { authorName, authorAvatarUrl } = authorFromOwner(row.owner);
    return {
      id: row.id,
      text: row.title?.trim() ?? "",
      createdAt: row.created_at ?? new Date().toISOString(),
      authorName,
      authorAvatarUrl,
    };
  });
}

function mapSinglePost(row: unknown, fallbackCommunityName?: string | null): FeedPostRow {
  const post = row as ApiPost;
  const { authorName, authorAvatarUrl } = resolveAuthor(post);
  const content = post.content ?? post.comment ?? "";
  const postType = post.post_type ?? "community";

  let channelName: string | null = null;
  if (typeof post.channel === "object" && post.channel?.name) {
    channelName = post.channel.name;
  }

  return {
    id: post.id,
    title: post.title ?? null,
    content,
    authorName,
    authorAvatarUrl,
    createdAt: post.created_at ?? new Date().toISOString(),
    communityName: nameFromRelation(post.community) ?? fallbackCommunityName ?? null,
    channelName: postType === "channel" ? channelName : null,
    postType,
    media: getPostMediaItems(post),
    canEdit: Boolean(post.is_owner),
    likesCount: Number(post.likes_count ?? 0),
    likedByMe: Boolean(post.likedby_me),
    commentAllow: post.comment_allow !== false,
    comments: mapComments(post.child_posts),
    shareCount: Number(post.level_count ?? 0),
  };
}

export function mapPostsResponse(
  data: unknown,
  fallbackCommunityName?: string | null,
): FeedPostRow[] {
  return unwrapList(data).map((row) => mapSinglePost(row, fallbackCommunityName));
}
