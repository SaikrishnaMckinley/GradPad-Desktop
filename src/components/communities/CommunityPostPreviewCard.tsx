import { MoreHorizontal } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

type Props = {
  communityName: string;
  channelName?: string | null;
  authorName: string;
  createdAt: string;
  title: string | null;
  content: string;
};

export function CommunityPostPreviewCard({
  communityName,
  channelName,
  authorName,
  createdAt,
  title,
  content,
}: Props) {
  const breadcrumb = channelName
    ? `${communityName} · ${channelName}`
    : communityName;
  const when = new Date(createdAt).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Card className="overflow-hidden shadow-card">
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-3">
        <p className="text-xs font-medium text-primary">{breadcrumb}</p>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground"
          aria-label="Post options"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>
      <div className="p-5">
        <div className="mb-4 flex gap-3">
          <Avatar alt={authorName} fallback={authorName} size="md" />
          <div>
            <p className="text-sm font-semibold">{authorName}</p>
            <p className="text-xs text-muted-foreground">{when}</p>
          </div>
        </div>
        {title ? <p className="mb-2 font-semibold">{title}</p> : null}
        <p className="text-sm leading-relaxed text-muted-foreground line-clamp-4">{content}</p>
      </div>
    </Card>
  );
}
