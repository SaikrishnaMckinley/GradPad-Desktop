"use client";

import Link from "next/link";
import type { CommunityListItem } from "@/types/community";
import { cn } from "@/lib/utils/cn";

type Props = {
  memberships: CommunityListItem[];
  activeCommunityId: string | null;
};

export function HomeMembershipFilters({ memberships, activeCommunityId }: Props) {
  if (memberships.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {memberships.map((community) => {
        const active = community.id === activeCommunityId;
        return (
          <Link
            key={community.id}
            href={`/home?community=${encodeURIComponent(community.id)}`}
            scroll={false}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-white shadow-sm"
                : "border border-border bg-card text-muted-foreground hover:border-primary-border hover:text-foreground",
            )}
          >
            {community.name}
          </Link>
        );
      })}
    </div>
  );
}
