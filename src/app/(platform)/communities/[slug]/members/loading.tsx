"use client";

import { usePathname } from "next/navigation";
import { CommunityMembersDirectorySkeleton } from "@/components/communities/CommunityMembersDirectorySkeleton";
import { CommunityMembersDirectoryView } from "@/components/communities/CommunityMembersDirectoryView";
import { CommunityMembersPageFrame } from "@/components/communities/CommunityMembersPageFrame";
import { readCommunityMembersDirectoryCache } from "@/lib/communities/community-members-directory-cache";

function slugFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/communities\/([^/]+)\/members\/?$/);
  return match?.[1] ?? null;
}

export default function CommunityMembersLoading() {
  const pathname = usePathname();
  const slug = slugFromPath(pathname ?? "");
  const cached = slug ? readCommunityMembersDirectoryCache(slug) : null;

  return (
    <CommunityMembersPageFrame slug={slug ?? ""}>
      {cached ? (
        <CommunityMembersDirectoryView {...cached} />
      ) : (
        <CommunityMembersDirectorySkeleton />
      )}
    </CommunityMembersPageFrame>
  );
}
