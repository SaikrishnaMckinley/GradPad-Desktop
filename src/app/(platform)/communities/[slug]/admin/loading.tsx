"use client";

import { usePathname } from "next/navigation";
import { CommunityAdminDashboard } from "@/components/communities/CommunityAdminDashboard";
import { PageContainer } from "@/components/layout/PageContainer";
import { readCommunityAdminCache } from "@/lib/communities/community-admin-cache";

function slugFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/communities\/([^/]+)\/admin\/?$/);
  return match?.[1] ?? null;
}

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-52 rounded-lg bg-page-secondary" />
        <div className="h-4 w-40 rounded bg-page-secondary/80" />
      </div>
      <div className="h-11 rounded-xl bg-page-secondary/60" />
      <div className="h-64 rounded-2xl bg-page-secondary/40" />
    </div>
  );
}

export default function CommunityAdminLoading() {
  const pathname = usePathname();
  const slug = slugFromPath(pathname ?? "");
  const cached = slug ? readCommunityAdminCache(slug) : null;

  if (cached) {
    return (
      <PageContainer>
        <CommunityAdminDashboard {...cached} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <AdminDashboardSkeleton />
    </PageContainer>
  );
}
