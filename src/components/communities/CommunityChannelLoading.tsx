"use client";

import { usePathname } from "next/navigation";
import { LiveCommunityChannel } from "@/components/communities/LiveCommunityChannel";
import { resolveChannelFallback } from "@/lib/communities/channel-cache";
import { Card } from "@/components/ui/card";

function parseChannelPath(pathname: string): { community: string; channel: string } | null {
  const match = pathname.match(/^\/communities\/([^/]+)\/channels\/([^/]+)/);
  if (!match?.[1] || !match[2]) return null;
  return { community: match[1], channel: match[2] };
}

export function CommunityChannelLoading() {
  const pathname = usePathname();
  const keys = parseChannelPath(pathname);
  if (!keys) return null;

  const cached = resolveChannelFallback(keys.community, keys.channel);
  if (cached) {
    return <LiveCommunityChannel initial={cached} />;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <Card className="p-6 shadow-card">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-page-secondary" />
        <div className="mt-4 h-24 animate-pulse rounded-xl bg-page-secondary" />
      </Card>
    </div>
  );
}
