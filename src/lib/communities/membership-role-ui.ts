import type {
  CommunityMemberDisplayRole,
  CommunityMemberRow,
  MembershipRole,
} from "@/types/community";

const DISPLAY_RANK: Record<CommunityMemberDisplayRole, number> = {
  payment_owner: 0,
  community_owner: 1,
  admin: 2,
  member: 3,
};

export function membershipRoleLabel(
  role: CommunityMemberDisplayRole | MembershipRole,
): string {
  switch (role) {
    case "payment_owner":
      return "Payment Owner";
    case "community_owner":
    case "owner":
      return "Community Owner";
    case "admin":
      return "Admin";
    case "moderator":
      return "Moderator";
    case "member":
      return "Member";
    default:
      return "Member";
  }
}

export function isElevatedDisplayRole(role: CommunityMemberDisplayRole): boolean {
  return role !== "member";
}

export function sortMembersByDisplayRole(
  members: CommunityMemberRow[],
): CommunityMemberRow[] {
  return [...members].sort((a, b) => {
    const aRank = DISPLAY_RANK[a.displayRole ?? "member"];
    const bRank = DISPLAY_RANK[b.displayRole ?? "member"];
    if (aRank !== bRank) return aRank - bRank;
    return a.fullName.localeCompare(b.fullName, undefined, { sensitivity: "base" });
  });
}

/** @deprecated use sortMembersByDisplayRole */
export function sortMembersByRole(members: CommunityMemberRow[]): CommunityMemberRow[] {
  return sortMembersByDisplayRole(members);
}

export function membershipRoleBadgeClass(
  role: CommunityMemberDisplayRole | MembershipRole,
): string {
  switch (role) {
    case "payment_owner":
      return "bg-primary text-white";
    case "community_owner":
    case "owner":
      return "bg-primary-light text-primary ring-1 ring-primary-border/40";
    case "admin":
      return "bg-page-secondary text-foreground ring-1 ring-border";
    case "moderator":
      return "bg-sky-50 text-sky-900 ring-1 ring-sky-200";
    default:
      return "bg-transparent text-muted-foreground";
  }
}

export function membershipRowHighlightClass(
  role: CommunityMemberDisplayRole | MembershipRole,
): string {
  if (role === "payment_owner") {
    return "border-primary/40 bg-primary-light/25";
  }
  if (role === "community_owner" || role === "owner") {
    return "border-primary-border/50 bg-primary-light/15";
  }
  if (role === "admin" || role === "moderator") {
    return "border-border bg-page-secondary/20";
  }
  return "";
}

export const ADMIN_MEMBER_ROLE_SELECT_CLASS =
  "h-9 min-w-[9.5rem] appearance-none rounded-lg border border-input-border bg-card bg-[length:1rem] bg-[position:right_0.65rem_center] bg-no-repeat pl-3 pr-9 text-sm [background-image:url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')]";
