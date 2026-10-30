import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CommunityAdminPanel } from "@/components/communities/CommunityAdminPanel";
import { PageContainer } from "@/components/layout/PageContainer";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { canManageCommunity } from "@/lib/communities/permissions";
import {
  getCommunityBySlug,
  getCommunityMembers,
  getPendingMembers,
} from "@/lib/communities/queries";

export const instant = false;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return { title: `Admin · ${slug}` };
}

export default async function CommunityAdminPage({ params }: Props) {
  const { slug } = await params;
  const session = await getSessionProfile();
  if (!session) {
    redirect("/login");
  }

  const community = await getCommunityBySlug(slug, session.id);
  if (!community) {
    notFound();
  }
  if (!canManageCommunity(community.membershipRole) || !community.membershipRole) {
    redirect(`/communities/${slug}`);
  }

  const [{ members }, pending] = await Promise.all([
    getCommunityMembers(community.id, 1, 100),
    getPendingMembers(community.id),
  ]);

  return (
    <PageContainer>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">{community.name}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/communities/${slug}/manage-payout`}
            className={cn(buttonVariants({ variant: "secondary" }))}
          >
            Bank account
          </Link>
          <Link
            href={`/communities/${slug}/edit`}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Edit community
          </Link>
          <Link
            href={`/communities/${slug}`}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            View community
          </Link>
        </div>
      </div>

      <CommunityAdminPanel
        communityId={community.id}
        slug={community.slug}
        actorRole={community.membershipRole}
        pending={pending}
        members={members}
      />
    </PageContainer>
  );
}
