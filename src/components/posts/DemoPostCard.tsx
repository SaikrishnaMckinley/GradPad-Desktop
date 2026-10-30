import Image from "next/image";
import {
  Bookmark,
  MessageCircle,
  MoreHorizontal,
  Share2,
  ThumbsUp,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

type DemoPostCardProps = {
  breadcrumb?: string;
};

export function DemoPostCard({
  breadcrumb = "Community > UCLA · General",
}: DemoPostCardProps) {
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
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex gap-3">
            <Avatar alt="Peter Jackson" fallback="Peter Jackson" size="md" />
            <div>
              <p className="text-sm font-semibold">Peter Jackson</p>
              <p className="text-xs text-muted-foreground">May 12 · 8:31 AM</p>
            </div>
          </div>
          <button type="button" className="text-muted-foreground" aria-label="Bookmark">
            <Bookmark className="h-5 w-5" />
          </button>
        </div>
        <p className="text-[15px] leading-relaxed text-foreground">
          Your source for logistics and Q&amp;A related to the networking event.
          We are welcoming all alumni to connect and share ideas.
        </p>
        <div className="relative mt-4 aspect-[16/9] max-h-[340px] w-full overflow-hidden rounded-2xl bg-secondary">
          <Image
            src="/images/post-networking.jpg"
            alt="Alumni networking in a classroom"
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 720px"
          />
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span className="font-medium text-foreground">12 likes</span>
          <span>4 comments</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3">
          {[
            { icon: ThumbsUp, label: "Like" },
            { icon: MessageCircle, label: "Comment" },
            { icon: Share2, label: "Share" },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              type="button"
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-xl bg-page-secondary py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
