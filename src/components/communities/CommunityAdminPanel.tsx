"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  removeMemberAction,
  reviewMembershipRequest,
  updateMemberRoleAction,
} from "@/lib/communities/actions";
import type { CommunityMemberRow, MembershipRole } from "@/types/community";

type Props = {
  communityId: string;
  slug: string;
  actorRole: MembershipRole;
  pending: CommunityMemberRow[];
  members: CommunityMemberRow[];
};

const ASSIGNABLE: MembershipRole[] = ["admin", "moderator", "member"];

export function CommunityAdminPanel({
  communityId,
  slug,
  actorRole,
  pending,
  members,
}: Props) {
  const router = useRouter();
  const [busy, startTransition] = useTransition();

  function run(action: () => Promise<{ error?: string; success?: string }>) {
    startTransition(async () => {
      const result = await action();
      if (result.error) toast.error(result.error);
      else if (result.success) toast.success(result.success);
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-lg font-semibold">Pending membership requests</h2>
        {pending.length === 0 ? (
          <Card className="p-5 text-sm text-muted-foreground">No pending requests.</Card>
        ) : (
          <ul className="space-y-3">
            {pending.map((row) => (
              <li key={row.id}>
                <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={row.avatarUrl}
                      alt={row.fullName}
                      fallback={row.fullName}
                      size="md"
                    />
                    <div>
                      <p className="font-medium">{row.fullName}</p>
                      {row.username ? (
                        <p className="text-xs text-muted-foreground">@{row.username}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() =>
                        run(() =>
                          reviewMembershipRequest(row.id, communityId, slug, "active"),
                        )
                      }
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() =>
                        run(() =>
                          reviewMembershipRequest(row.id, communityId, slug, "rejected"),
                        )
                      }
                    >
                      Reject
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Active members</h2>
        <ul className="space-y-3">
          {members.map((row) => (
            <li key={row.id}>
              <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={row.avatarUrl}
                    alt={row.fullName}
                    fallback={row.fullName}
                    size="md"
                  />
                  <div>
                    <p className="font-medium">{row.fullName}</p>
                    <p className="text-xs capitalize text-muted-foreground">{row.role}</p>
                  </div>
                </div>
                {row.role === "owner" ? null : (
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      className="h-9 rounded-lg border border-input-border bg-card px-2 text-sm"
                      defaultValue={row.role}
                      disabled={busy}
                      onChange={(e) =>
                        run(() =>
                          updateMemberRoleAction(
                            row.id,
                            communityId,
                            slug,
                            e.target.value as MembershipRole,
                          ),
                        )
                      }
                    >
                      {ASSIGNABLE.filter((role) => {
                        if (actorRole === "admin" && role === "admin") return false;
                        return true;
                      }).map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() =>
                        run(() => removeMemberAction(row.id, communityId, slug))
                      }
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
