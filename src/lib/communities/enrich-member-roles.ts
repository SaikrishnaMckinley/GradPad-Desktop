import { memberDisplayNameFromApi } from "@/lib/communities/member-display-name";
import { sortMembersByDisplayRole } from "@/lib/communities/membership-role-ui";
import type { CommunityMemberDisplayRole, CommunityMemberRow } from "@/types/community";

type PersonRef = {
  id?: string | number;
  first_name?: string;
  last_name?: string;
  nickname?: string | null;
  photo?: string | null;
  email?: string;
};

function personUserId(person: PersonRef | null | undefined): string | null {
  if (!person || person.id == null) return null;
  return String(person.id);
}

function personName(person: PersonRef): string {
  return memberDisplayNameFromApi(person);
}

function idsFromPeople(list: unknown): Set<string> {
  const ids = new Set<string>();
  if (!Array.isArray(list)) return ids;
  for (const item of list) {
    const id = personUserId(item as PersonRef);
    if (id) ids.add(id);
  }
  return ids;
}

function rowFromPerson(
  person: PersonRef,
  membershipId: string,
  apiRole: CommunityMemberRow["role"],
): CommunityMemberRow {
  const userId = personUserId(person) ?? membershipId;
  return {
    id: membershipId,
    userId,
    fullName: personName(person),
    username: person.nickname?.trim() && person.nickname !== "undefined" ? person.nickname : null,
    avatarUrl: person.photo ?? null,
    role: apiRole,
    status: "active",
    joinedAt: new Date().toISOString(),
    displayRole: "member",
  };
}

function displayRoleForUser(
  userId: string,
  apiRole: CommunityMemberRow["role"],
  paymentOwnerId: string | null,
  ownerIds: Set<string>,
  adminIds: Set<string>,
): CommunityMemberDisplayRole {
  if (paymentOwnerId && userId === paymentOwnerId) return "payment_owner";
  if (ownerIds.has(userId) || apiRole === "owner") return "community_owner";
  if (adminIds.has(userId) || apiRole === "admin") return "admin";
  return "member";
}

/** Mirrors gradpad-web `getAllMembersWithRoles` for admin roster display. */
export function mergeAndEnrichCommunityMembers(
  members: CommunityMemberRow[],
  communityDetail: Record<string, unknown> | null,
): CommunityMemberRow[] {
  const detail = communityDetail ?? {};
  const paymentOwner = detail.payment_owner as PersonRef | undefined;
  const paymentOwnerId = personUserId(paymentOwner);
  const ownerIds = idsFromPeople(detail.owners);
  const adminIds = idsFromPeople(detail.admins);

  const byUserId = new Map<string, CommunityMemberRow>();
  for (const row of members) {
    byUserId.set(row.userId, row);
  }

  if (paymentOwnerId && !byUserId.has(paymentOwnerId)) {
    byUserId.set(
      paymentOwnerId,
      rowFromPerson(paymentOwner!, `user-${paymentOwnerId}`, "member"),
    );
  }

  if (Array.isArray(detail.owners)) {
    for (const owner of detail.owners as PersonRef[]) {
      const uid = personUserId(owner);
      if (!uid || byUserId.has(uid)) continue;
      byUserId.set(uid, rowFromPerson(owner, `user-${uid}`, "owner"));
    }
  }

  const detailMemberRows = Array.isArray(detail.members) ? detail.members : [];

  const enriched = Array.from(byUserId.values()).map((row) => {
    let fullName = row.fullName;
    if (fullName === "Member") {
      const raw = detailMemberRows.find((entry) => {
        if (!entry || typeof entry !== "object") return false;
        const r = entry as Record<string, unknown>;
        const uid = String(r.user_id ?? r.id ?? "");
        return uid === row.userId;
      });
      if (raw) fullName = memberDisplayNameFromApi(raw);
    }
    return {
      ...row,
      fullName,
      displayRole: displayRoleForUser(
        row.userId,
        row.role,
        paymentOwnerId,
        ownerIds,
        adminIds,
      ),
    };
  });

  return sortMembersByDisplayRole(enriched);
}
