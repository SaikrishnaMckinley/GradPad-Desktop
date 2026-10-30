import * as apiCommunities from "@/lib/communities/api-queries";
import {
  communityAccentColor,
  communityInitials,
} from "@/lib/communities/slug";
import { isDemoStaticUi } from "@/lib/demo-mode";
import { DEV_CHANNELS, DEV_COMMUNITIES } from "@/lib/fixtures/dev-shell-data";
import type {
  CommunityDetail,
  CommunityListItem,
  CommunityMemberRow,
  SidebarChannel,
  SidebarCommunity,
} from "@/types/community";

function demoCommunityListItems(): CommunityListItem[] {
  return DEV_COMMUNITIES.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: null,
    institution: null,
    location: null,
    logoUrl: c.logoUrl,
    coverImageUrl: null,
    visibility: "public" as const,
    joinApprovalRequired: false,
    memberCount: 0,
    membershipRole: "member" as const,
    membershipStatus: "active" as const,
  }));
}

export async function listDiscoverableCommunities(
  userId: string | null,
  search?: string,
): Promise<CommunityListItem[]> {
  if (!isDemoStaticUi()) {
    return apiCommunities.listDiscoverableCommunities(userId, search);
  }

  let items = demoCommunityListItems();
  const term = search?.trim().toLowerCase();
  if (term) {
    items = items.filter((c) => c.name.toLowerCase().includes(term));
  }
  return items;
}

export async function getUserSidebarCommunities(
  userId: string,
): Promise<SidebarCommunity[]> {
  if (!isDemoStaticUi()) {
    const list = await apiCommunities.listDiscoverableCommunities(userId);
    return list.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      logoUrl: c.logoUrl,
      initials: communityInitials(c.name),
      accentColor: communityAccentColor(c.slug),
    }));
  }

  return DEV_COMMUNITIES.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    logoUrl: c.logoUrl,
    initials: c.initials,
    accentColor: c.accentColor,
  }));
}

export async function getSidebarChannels(
  communityId: string,
): Promise<SidebarChannel[]> {
  if (!isDemoStaticUi()) {
    const channels = await apiCommunities.getCommunityChannels(communityId);
    return channels.map((ch) => ({
      id: ch.id,
      slug: ch.slug,
      name: ch.name,
    }));
  }

  return DEV_CHANNELS.map((ch) => ({
    id: ch.id,
    slug: ch.slug,
    name: ch.name,
  }));
}

export async function getCommunityBySlug(
  slug: string,
  userId: string | null,
): Promise<CommunityDetail | null> {
  if (!isDemoStaticUi()) {
    return apiCommunities.getCommunityByRouteKey(slug, userId);
  }

  const demo = DEV_COMMUNITIES.find((c) => c.slug === slug);
  if (!demo) return null;

  return {
    id: demo.id,
    name: demo.name,
    slug: demo.slug,
    description: "Demo community — enable staging data with NEXT_PUBLIC_DEMO_STATIC_UI=false.",
    institution: null,
    location: null,
    logoUrl: demo.logoUrl,
    coverImageUrl: null,
    visibility: "public",
    joinApprovalRequired: false,
    memberCount: 0,
    membershipRole: "member",
    membershipStatus: "active",
    createdBy: null,
  };
}

export async function getCommunityMembers(
  communityId: string,
  page: number,
  pageSize: number,
): Promise<{ members: CommunityMemberRow[]; total: number }> {
  if (!isDemoStaticUi()) {
    return apiCommunities.getCommunityMembers(communityId, page, pageSize);
  }
  return { members: [], total: 0 };
}

export async function getPendingMembers(communityId: string) {
  if (!isDemoStaticUi()) {
    return apiCommunities.getCommunityJoinRequests(communityId);
  }
  return [];
}

export async function getCommunityChannels(communityId: string) {
  if (!isDemoStaticUi()) {
    return apiCommunities.getCommunityChannels(communityId);
  }

  return DEV_CHANNELS.map((ch) => ({
    id: ch.id,
    name: ch.name,
    slug: ch.slug,
    description: null as string | null,
  }));
}

export async function getCommunityEventsPreview(communityId: string, limit = 4) {
  if (!isDemoStaticUi()) {
    return apiCommunities.getCommunityEventsPreview(communityId, limit);
  }
  return [];
}

export async function getCommunityPostsPreview(communityId: string, limit = 5) {
  if (!isDemoStaticUi()) {
    return apiCommunities.getCommunityPostsPreview(communityId, limit);
  }
  return [];
}
