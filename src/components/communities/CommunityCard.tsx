import Link from "next/link";
import { CommunityMark } from "@/components/layout/CommunityMark";
import { Card } from "@/components/ui/card";
import { communityAccentColor, communityInitials } from "@/lib/communities/slug";
import type { CommunityListItem } from "@/types/community";

type Props = {
  community: CommunityListItem;
};

function membershipLabel(community: CommunityListItem) {
  if (community.membershipStatus === "active") {
    return `Member · ${community.memberCount.toLocaleString()} members`;
  }
  if (community.membershipStatus === "pending") {
    return "Request pending";
  }
  return `${community.memberCount.toLocaleString()} members`;
}

export function CommunityCard({ community }: Props) {
  return (
    <Link href={`/communities/${community.slug}`}>
      <Card className="flex h-full flex-col gap-4 p-5 transition-shadow hover:shadow-md">
        <div className="flex items-center gap-4">
          <CommunityMark
            name={community.name}
            initials={communityInitials(community.name)}
            accentColor={communityAccentColor(community.slug)}
            logoUrl={community.logoUrl}
          />
          <div className="min-w-0">
            <p className="truncate font-semibold">{community.name}</p>
            <p className="text-sm text-muted-foreground">{membershipLabel(community)}</p>
          </div>
        </div>
        {community.description ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">{community.description}</p>
        ) : null}
      </Card>
    </Link>
  );
}
