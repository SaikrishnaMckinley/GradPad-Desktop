import type { MembershipRole, MembershipStatus } from "@/types/community";

export function isActiveMember(
  status: MembershipStatus | null | undefined,
): boolean {
  return status === "active";
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
