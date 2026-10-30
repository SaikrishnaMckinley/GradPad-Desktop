export type MembershipRole = "owner" | "admin" | "moderator" | "member";
export type MembershipStatus = "pending" | "active" | "rejected" | "banned";
export type CommunityVisibility = "public" | "private" | "hidden";

export type CommunityListItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  institution: string | null;
  location: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  visibility: CommunityVisibility;
  joinApprovalRequired: boolean;
  memberCount: number;
  membershipStatus: MembershipStatus | null;
  membershipRole: MembershipRole | null;
};

export type SidebarCommunity = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  initials: string;
  accentColor: string;
};

export type SidebarChannel = {
  id: string;
  slug: string;
  name: string;
};

export type CommunityDetail = CommunityListItem & {
  createdBy: string | null;
};

export type CommunityMemberRow = {
  id: string;
  userId: string;
  fullName: string;
  username: string | null;
  avatarUrl: string | null;
  role: MembershipRole;
  status: MembershipStatus;
  joinedAt: string;
};
