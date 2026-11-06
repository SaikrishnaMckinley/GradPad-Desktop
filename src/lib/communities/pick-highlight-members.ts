import {
  isElevatedDisplayRole,
  sortMembersByDisplayRole,
  membershipRoleLabel,
} from "@/lib/communities/membership-role-ui";
import type { CommunityMemberRow } from "@/types/community";

export type HighlightMember = {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  roleLabel: string;
};

export function pickHighlightMembers(
  members: CommunityMemberRow[],
  options?: { limit?: number; excludeUserId?: string | null },
): HighlightMember[] {
  const limit = options?.limit ?? 3;
  const exclude = options?.excludeUserId?.trim() ?? "";

  const sorted = sortMembersByDisplayRole(
    members.filter((m) => m.status === "active" && m.userId !== exclude),
  );

  const picks: CommunityMemberRow[] = [];
  for (const member of sorted) {
    if (picks.length >= limit) break;
    const role = member.displayRole ?? "member";
    if (!isElevatedDisplayRole(role)) continue;
    if (picks.some((p) => p.userId === member.userId)) continue;
    picks.push(member);
  }
  if (picks.length < limit) {
    for (const member of sorted) {
      if (picks.length >= limit) break;
      if (picks.some((p) => p.userId === member.userId)) continue;
      picks.push(member);
    }
  }

  return picks.slice(0, limit).map((member) => ({
    userId: member.userId,
    fullName: member.fullName,
    avatarUrl: member.avatarUrl,
    roleLabel: membershipRoleLabel(member.displayRole ?? member.role),
  }));
}
