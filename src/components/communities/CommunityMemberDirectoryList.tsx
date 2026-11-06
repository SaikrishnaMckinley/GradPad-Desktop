import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  isElevatedDisplayRole,
  membershipRoleBadgeClass,
  membershipRoleLabel,
} from "@/lib/communities/membership-role-ui";
import type { CommunityMemberRow } from "@/types/community";
import { cn } from "@/lib/utils/cn";

type Props = {
  members: CommunityMemberRow[];
};

export function CommunityMemberDirectoryList({ members }: Props) {
  if (members.length === 0) {
    return (
      <Card className="border-0 bg-white p-8 text-center shadow-[0_4px_14px_rgba(21,21,21,0.05)]">
        <p className="text-sm font-medium text-foreground">No members found</p>
        <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or role filter.</p>
      </Card>
    );
  }

  return (
    <ul className="space-y-2">
      {members.map((member) => {
        const displayRole = member.displayRole ?? "member";
        const elevated = isElevatedDisplayRole(displayRole);
        return (
          <li key={member.id}>
            <Card className="flex items-center gap-3 border-0 bg-white p-4 shadow-[0_4px_14px_rgba(21,21,21,0.05)]">
              <Avatar
                src={member.avatarUrl}
                alt={member.fullName}
                fallback={member.fullName}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{member.fullName}</p>
                {member.username ? (
                  <p className="truncate text-xs text-muted-foreground">@{member.username}</p>
                ) : null}
                <span
                  className={cn(
                    "mt-1 inline-flex max-w-full rounded-[10px] px-2.5 py-0.5 text-xs font-normal",
                    membershipRoleBadgeClass(displayRole),
                    !elevated && "px-0 py-0",
                  )}
                >
                  {membershipRoleLabel(displayRole)}
                </span>
              </div>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
