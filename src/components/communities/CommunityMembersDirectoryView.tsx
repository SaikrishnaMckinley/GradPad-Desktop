"use client";

import { ChevronDown, Search } from "lucide-react";
import Link from "next/link";
import { useLayoutEffect, useMemo, useState } from "react";
import { CommunityMemberDirectoryList } from "@/components/communities/CommunityMemberDirectoryList";
import { Input } from "@/components/ui/input";
import { writeCommunityMembersDirectoryCache } from "@/lib/communities/community-members-directory-cache";
import type { CommunityMembersDirectorySnapshot } from "@/lib/communities/load-community-members-directory";
import { sortMembersByDisplayRole } from "@/lib/communities/membership-role-ui";
import type { CommunityMemberDisplayRole } from "@/types/community";
import { cn } from "@/lib/utils/cn";

type Props = CommunityMembersDirectorySnapshot;

type RoleFilter = "all" | CommunityMemberDisplayRole;

const ROLE_OPTIONS: { value: RoleFilter; label: string }[] = [
  { value: "all", label: "All roles" },
  { value: "payment_owner", label: "Payment Owner" },
  { value: "community_owner", label: "Community Owner" },
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
];

export function CommunityMembersDirectoryView({
  slug,
  communityName,
  members,
  total,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");

  useLayoutEffect(() => {
    writeCommunityMembersDirectoryCache({ slug, communityName, members, total });
  }, [slug, communityName, members, total]);

  const filteredMembers = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    let list = members;

    if (roleFilter !== "all") {
      list = list.filter((m) => (m.displayRole ?? "member") === roleFilter);
    }

    if (term) {
      list = list.filter((m) => {
        const haystack = [m.fullName, m.username ?? ""].join(" ").toLowerCase();
        return haystack.includes(term);
      });
    }

    return sortMembersByDisplayRole(list);
  }, [members, roleFilter, searchQuery]);

  const roleFilterLabel =
    ROLE_OPTIONS.find((o) => o.value === roleFilter)?.label ?? "Role";

  return (
    <div className="flex w-full flex-col gap-5 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/communities/${slug}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          ← Back to {communityName}
        </Link>
      </div>

      <div className="flex h-11 items-stretch overflow-hidden rounded-[10px] bg-white shadow-[0_4px_14px_rgba(21,21,21,0.05)]">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search members"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 rounded-none border-0 bg-transparent pl-9 shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="relative flex shrink-0 items-center border-l border-border/60 px-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
            aria-label="Filter by role"
            className={cn(
              "h-9 min-w-[7.5rem] cursor-pointer appearance-none rounded-lg bg-page-secondary/80 pl-3 pr-8 text-sm font-medium text-primary",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
            )}
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary"
            aria-hidden
          />
          <span className="sr-only">{roleFilterLabel}</span>
        </div>
      </div>

      <p className="text-sm font-medium text-foreground/80">
        Members ({filteredMembers.length.toLocaleString()})
      </p>

      <CommunityMemberDirectoryList members={filteredMembers} />
    </div>
  );
}
