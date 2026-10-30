import type {
  MembershipRole,
  MembershipStatus,
  SidebarCommunity,
} from "@/types/community";

export function isActiveMember(
  status: MembershipStatus | null | undefined,
): boolean {
  return status === "active";
}

/** Post, event, and channel creation require an active membership (not pending). */
export function canCreateInCommunity(
  status: MembershipStatus | null | undefined,
): boolean {
  return isActiveMember(status);
}

export function activeSidebarMemberships(
  memberships: SidebarCommunity[],
): SidebarCommunity[] {
  return memberships.filter((m) => canCreateInCommunity(m.membershipStatus));
}

export function canManageCommunity(
  role: MembershipRole | null | undefined,
): boolean {
  return role === "owner" || role === "admin";
}

export function canAssignRole(
  actorRole: MembershipRole,
  nextRole: MembershipRole,
): boolean {
  if (nextRole === "owner") {
    return false;
  }
  if (actorRole === "owner") {
    return true;
  }
  if (actorRole === "admin") {
    return nextRole === "moderator" || nextRole === "member";
  }
  return false;
}
