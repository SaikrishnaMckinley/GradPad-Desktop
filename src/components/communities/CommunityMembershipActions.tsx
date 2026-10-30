"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import {
  joinCommunityAction,
  leaveCommunityAction,
} from "@/lib/communities/actions";
import type { CommunityListItem } from "@/types/community";

type Props = {
  community: Pick<
    CommunityListItem,
    "id" | "slug" | "membershipRole" | "membershipStatus" | "joinApprovalRequired"
  >;
  canManage: boolean;
};

export function CommunityMembershipActions({ community, canManage }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const isActive = community.membershipStatus === "active";
  const isPending = community.membershipStatus === "pending";

  function run(action: () => Promise<{ error?: string; success?: string }>) {
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.success) {
        toast.success(result.success);
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {canManage ? (
        <>
          <Link
            href={`/communities/${community.slug}/admin`}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Admin dashboard
          </Link>
          <Link
            href={`/communities/${community.slug}/edit`}
            className={cn(buttonVariants({ variant: "secondary" }))}
          >
            Edit community
          </Link>
        </>
      ) : null}
      {isActive ? (
        community.membershipRole !== "owner" ? (
          <Button
            variant="secondary"
            disabled={pending}
            onClick={() =>
              run(() => leaveCommunityAction(community.id, community.slug))
            }
          >
            Leave community
          </Button>
        ) : null
      ) : isPending ? (
        <Button variant="secondary" disabled>
          Request pending
        </Button>
      ) : (
        <Button
          disabled={pending}
          onClick={() =>
            run(() => joinCommunityAction(community.id, community.slug))
          }
        >
          {community.joinApprovalRequired ? "Request to join" : "Join community"}
        </Button>
      )}
    </div>
  );
}
