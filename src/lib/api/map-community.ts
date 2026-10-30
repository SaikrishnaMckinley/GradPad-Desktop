import {
  communityAccentColor,
  communityInitials,
} from "@/lib/communities/slug";
import type {
  CommunityDetail,
  CommunityListItem,
  CommunityVisibility,
  MembershipRole,
  MembershipStatus,
  SidebarCommunity,
} from "@/types/community";

export type ApiCommunityRecord = Record<string, unknown> & {
  id?: string | number;
  name?: string;
  slug?: string;
  description?: string | null;
  institution?: string | null;
  location?: string | null;
  city?: string;
  state?: string;
  logo?: string | null;
  logo_url?: string | null;
  photo?: string | null;
  image?: string | null;
  cover_image_url?: string | null;
  visibility?: string;
  join_approval_required?: boolean;
  member_count?: number;
  members_count?: number;
  members?: unknown[];
  is_member?: boolean;
  is_admin?: boolean;
  is_owner?: boolean;
  applied?: boolean;
  role?: string;
  membership_role?: string;
  membership_status?: string;
  created_by?: string | null;
};

export function communityRouteKey(raw: ApiCommunityRecord): string {
  const id = raw.id != null ? String(raw.id) : "";
  const slug = typeof raw.slug === "string" ? raw.slug.trim() : "";
  return (slug || id).toLowerCase();
}

export function communityMemberCount(raw: ApiCommunityRecord): number {
  if (typeof raw.member_count === "number") return raw.member_count;
  if (typeof raw.members_count === "number") return raw.members_count;
  if (Array.isArray(raw.members)) return raw.members.length;
  return 0;
}

function mapVisibility(value: unknown): CommunityVisibility {
  if (value === "private" || value === "hidden") return value;
  return "public";
}

function mapMembershipFromApi(raw: ApiCommunityRecord): {
  role: MembershipRole | null;
  status: MembershipStatus | null;
} {
  if (raw.is_owner) return { role: "owner", status: "active" };
  if (raw.is_admin) return { role: "admin", status: "active" };
  if (raw.is_member) return { role: "member", status: "active" };
  if (raw.applied) return { role: null, status: "pending" };

  const roleRaw = (raw.membership_role ?? raw.role) as string | undefined;
  const statusRaw = raw.membership_status as string | undefined;

  const role =
    roleRaw === "owner" || roleRaw === "admin" || roleRaw === "moderator" || roleRaw === "member"
      ? roleRaw
      : null;
  const status =
    statusRaw === "pending" ||
    statusRaw === "active" ||
    statusRaw === "rejected" ||
    statusRaw === "banned"
      ? statusRaw
      : null;

  return { role, status };
}

export function mapCommunityListItem(raw: ApiCommunityRecord): CommunityListItem | null {
  if (raw.id == null || !raw.name) return null;
  const slug = communityRouteKey(raw);
  const membership = mapMembershipFromApi(raw);
  const location =
    (typeof raw.location === "string" && raw.location) ||
    [raw.city, raw.state].filter(Boolean).join(", ") ||
    null;

  return {
    id: String(raw.id),
    name: String(raw.name),
    slug,
    description: typeof raw.description === "string" ? raw.description : null,
    institution: typeof raw.institution === "string" ? raw.institution : null,
    location: location || null,
    logoUrl: (raw.logo_url ?? raw.logo ?? raw.photo ?? null) as string | null,
    coverImageUrl: (raw.cover_image_url ?? raw.image ?? null) as string | null,
    visibility: mapVisibility(raw.visibility),
    joinApprovalRequired: Boolean(raw.join_approval_required),
    memberCount: communityMemberCount(raw),
    membershipRole: membership.role,
    membershipStatus: membership.status,
  };
}

export function mapCommunityDetail(raw: ApiCommunityRecord): CommunityDetail | null {
  const base = mapCommunityListItem(raw);
  if (!base) return null;
  return {
    ...base,
    createdBy:
      typeof raw.created_by === "string"
        ? raw.created_by
        : raw.created_by != null
          ? String(raw.created_by)
          : null,
  };
}

export function mapSidebarCommunity(raw: ApiCommunityRecord): SidebarCommunity | null {
  const base = mapCommunityListItem(raw);
  if (!base) return null;
  return {
    id: base.id,
    name: base.name,
    slug: base.slug,
    logoUrl: base.logoUrl,
    initials: communityInitials(base.name),
    accentColor: communityAccentColor(base.slug),
    membershipStatus: base.membershipStatus,
  };
}
