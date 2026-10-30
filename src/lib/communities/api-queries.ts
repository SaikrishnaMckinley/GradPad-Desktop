import "server-only";

import { flattenCommunityListResponse } from "@/lib/api/community-list";
import {
  communitiesFromResponse,
  fetchAllCommunitiesRaw,
  fetchCommunityChannelsRaw,
  fetchCommunityDetailRaw,
  fetchCommunityListRaw,
  fetchCommunityMembersRaw,
  fetchCommunityPostsRaw,
  fetchCommunityUpcomingEventsRaw,
} from "@/lib/api/communities";
import {
  communityRouteKey,
  mapCommunityDetail,
  mapCommunityListItem,
  type ApiCommunityRecord,
} from "@/lib/api/map-community";
import { unwrapList } from "@/lib/api/parse-list";
import { parseEventStartIso } from "@/lib/events/format-event-datetime";
import { mapPostsResponse } from "@/lib/posts/map-post";
import type { CommunityDetail, CommunityListItem, CommunityMemberRow } from "@/types/community";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function loadUserCommunities(): Promise<CommunityListItem[]> {
  const result = await fetchCommunityListRaw();
  if (!result.ok || !result.data) return [];
  return communitiesFromResponse(result.data)
    .map(mapCommunityListItem)
    .filter(Boolean) as CommunityListItem[];
}

export async function resolveCommunityId(routeKey: string): Promise<string | null> {
  const key = routeKey.trim().toLowerCase();
  if (UUID_RE.test(key)) return key;

  const memberships = await loadUserCommunities();
  const match = memberships.find((c) => c.slug === key || c.id.toLowerCase() === key);
  if (match) return match.id;

  const detail = await fetchCommunityDetailRaw(key);
  if (detail.ok && detail.data?.id != null) {
    return String(detail.data.id);
  }

  return null;
}

export async function getCommunityByRouteKey(
  routeKey: string,
  _userId: string | null,
): Promise<CommunityDetail | null> {
  const communityId = await resolveCommunityId(routeKey);
  if (!communityId) return null;

  const result = await fetchCommunityDetailRaw(communityId);
  if (!result.ok || !result.data) return null;
  return mapCommunityDetail(result.data);
}

export async function listDiscoverableCommunities(
  _userId: string | null,
  search?: string,
): Promise<CommunityListItem[]> {
  let items = await loadUserCommunities();

  const term = search?.trim().toLowerCase();
  if (term) {
    items = items.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.description?.toLowerCase().includes(term) ||
        c.institution?.toLowerCase().includes(term) ||
        c.location?.toLowerCase().includes(term),
    );
  }

  return items;
}

export async function listAllDiscoverCommunities(search?: string): Promise<CommunityListItem[]> {
  const result = await fetchAllCommunitiesRaw();
  if (!result.ok || !result.data) return [];

  let items = communitiesFromResponse(result.data)
    .map(mapCommunityListItem)
    .filter(Boolean) as CommunityListItem[];

  const term = search?.trim().toLowerCase();
  if (term) {
    items = items.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.description?.toLowerCase().includes(term) ||
        c.institution?.toLowerCase().includes(term) ||
        c.location?.toLowerCase().includes(term),
    );
  }

  return items;
}

type ApiChannel = {
  id: string;
  name?: string;
  slug?: string;
  title?: string;
  description?: string | null;
};

export async function getCommunityChannels(communityId: string) {
  const result = await fetchCommunityChannelsRaw(communityId);
  if (!result.ok || !result.data) return [];
  return unwrapList(result.data).map((row) => {
    const ch = row as ApiChannel;
    const name = ch.name?.trim() || ch.title?.trim() || "Channel";
    const slug = (ch.slug?.trim() || ch.id).toLowerCase();
    return {
      id: ch.id,
      name,
      slug,
      description: ch.description ?? null,
    };
  });
}

type ApiEvent = {
  id: string;
  title?: string;
  name?: string;
  start_at?: string;
  start_date?: string;
  start_time?: string;
  end_date?: string;
  end_time?: string;
  location?: string | null | Record<string, unknown>;
  address?: string | null | Record<string, unknown>;
  event_type?: string | null;
  description?: string | null;
  comment?: string | null;
};

function eventLocationLabel(raw: ApiEvent["location"] | ApiEvent["address"]): string | null {
  if (!raw) return null;
  if (typeof raw === "string") {
    const t = raw.trim();
    return t.length > 0 ? t : null;
  }
  if (typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    const parts = [obj.name, obj.city, obj.state, obj.formatted_address, obj.address]
      .filter((p) => typeof p === "string" && p.trim().length > 0)
      .map((p) => (p as string).trim());
    return parts.length > 0 ? parts.join(", ") : null;
  }
  return null;
}

export async function getCommunityEventsPreview(communityId: string, limit = 4) {
  const result = await fetchCommunityUpcomingEventsRaw(communityId);
  if (!result.ok || !result.data) return [];
  return unwrapList(result.data)
    .map((row) => {
      const event = row as ApiEvent;
      const start_at =
        parseEventStartIso({
          start_at: event.start_at,
          start_date: event.start_date,
          start_time: event.start_time,
        }) ?? "";
      const rawDescription = event.description ?? event.comment ?? null;
      return {
        id: event.id,
        title: event.title ?? event.name ?? "Event",
        start_at,
        location: eventLocationLabel(event.location) ?? eventLocationLabel(event.address),
        event_type: event.event_type ?? null,
        description:
          typeof rawDescription === "string"
            ? rawDescription.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
            : null,
      };
    })
    .filter((event) => event.start_at.length > 0)
    .slice(0, limit);
}

export async function getCommunityPostsPreview(communityId: string, limit = 5) {
  const result = await fetchCommunityPostsRaw(communityId, limit);
  if (!result.ok || !result.data) return [];
  return mapPostsResponse(result.data).map((post) => ({
    id: post.id,
    title: post.title,
    content: post.content,
    createdAt: post.createdAt,
    authorName: post.authorName,
    authorAvatarUrl: post.authorAvatarUrl,
    canEdit: post.canEdit,
    channelName: post.channelName,
    media: post.media,
    likesCount: post.likesCount,
    likedByMe: post.likedByMe,
    commentAllow: post.commentAllow,
    comments: post.comments,
    shareCount: post.shareCount,
  }));
}

type ApiMember = {
  id?: string;
  user_id?: string;
  first_name?: string;
  last_name?: string;
  nickname?: string;
  photo?: string | null;
  role?: string;
  status?: string;
  joined_at?: string;
};

export async function getCommunityMembers(
  communityId: string,
  page: number,
  pageSize: number,
): Promise<{ members: CommunityMemberRow[]; total: number }> {
  const result = await fetchCommunityMembersRaw(communityId);
  if (!result.ok || !result.data) {
    return { members: [], total: 0 };
  }

  const all = unwrapList(result.data).map((row, index) => {
    const m = row as ApiMember;
    const fullName =
      [m.first_name, m.last_name].filter(Boolean).join(" ").trim() ||
      m.nickname?.trim() ||
      "Member";
    const role =
      m.role === "owner" || m.role === "admin" || m.role === "moderator" || m.role === "member"
        ? m.role
        : "member";
    const status =
      m.status === "pending" ||
      m.status === "active" ||
      m.status === "rejected" ||
      m.status === "banned"
        ? m.status
        : "active";

    return {
      id: m.id ?? m.user_id ?? `member-${index}`,
      userId: String(m.user_id ?? m.id ?? index),
      fullName,
      username: m.nickname ?? null,
      avatarUrl: m.photo ?? null,
      role,
      status,
      joinedAt: m.joined_at ?? new Date().toISOString(),
    } satisfies CommunityMemberRow;
  });

  const from = (page - 1) * pageSize;
  return {
    members: all.slice(from, from + pageSize),
    total: all.length,
  };
}

export async function findCommunityInUserList(
  routeKey: string,
): Promise<ApiCommunityRecord | null> {
  const result = await fetchCommunityListRaw();
  if (!result.ok || !result.data) return null;
  const key = routeKey.trim().toLowerCase();
  return (
    communitiesFromResponse(result.data).find(
      (c) => communityRouteKey(c) === key || String(c.id).toLowerCase() === key,
    ) ?? null
  );
}
