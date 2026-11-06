import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { isUsableImageUrl } from "@/lib/utils/initials";
import { cn } from "@/lib/utils/cn";

type PreviewMember = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
};

type Props = {
  communitySlug: string;
  members: PreviewMember[];
  memberCount: number;
  /** Active community members can open the full roster. */
  canOpenDirectory: boolean;
};

const FACEPILE_MAX = 5;

function facepileCandidates(members: PreviewMember[]): PreviewMember[] {
  const valid = members.filter((m) => {
    if (!m.id?.trim()) return false;
    const name = m.fullName?.trim();
    if (!name || name === "Member") return false;
    return isUsableImageUrl(m.avatarUrl);
  });

  return [...valid];
}

export function CommunityMembersFacepile({
  communitySlug,
  members,
  memberCount,
  canOpenDirectory,
}: Props) {
  if (members.length === 0 && memberCount === 0) {
    return null;
  }

  const withPhoto = facepileCandidates(members);
  const shown = withPhoto.slice(0, FACEPILE_MAX);
  if (shown.length === 0) {
    return null;
  }
  const extra = Math.max(memberCount - shown.length, 0);
  const overflowLabel = extra > 99 ? "+99" : extra > 0 ? `+${extra}` : null;

  const stack = (
    <div className="inline-flex items-center -space-x-2.5">
      {shown.map((m, index) => (
        <div
          key={m.id}
          className="relative rounded-full"
          style={{ zIndex: 10 - index }}
        >
          <Avatar src={m.avatarUrl} alt={m.fullName} fallback={m.fullName} size="sm" />
        </div>
      ))}
      {overflowLabel ? (
        <span className="relative z-[11] flex h-9 min-w-9 items-center justify-center rounded-full bg-primary-light px-2 text-xs font-semibold text-primary ring-2 ring-card">
          {overflowLabel}
        </span>
      ) : null}
    </div>
  );

  if (!canOpenDirectory) {
    return <div className="py-1">{stack}</div>;
  }

  return (
    <Link
      href={`/communities/${communitySlug}/members`}
      className={cn(
        "inline-flex rounded-full py-1 transition-opacity hover:opacity-90",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
      )}
      aria-label={`View all ${memberCount} community members`}
    >
      {stack}
    </Link>
  );
}
