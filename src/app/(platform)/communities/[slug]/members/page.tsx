import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/layout/PageContainer";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { isActiveMember } from "@/lib/communities/permissions";
import { getCommunityBySlug, getCommunityMembers } from "@/lib/communities/queries";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

const PAGE_SIZE = 20;

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return { title: `Members · ${slug}` };
}

export default async function CommunityMembersPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const session = await getSessionProfile();
  const community = await getCommunityBySlug(slug, session?.id ?? null);
  if (!community) {
    notFound();
  }

  if (!isActiveMember(community.membershipStatus)) {
    notFound();
  }

  const { members, total } = await getCommunityMembers(community.id, page, PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <PageContainer>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {community.name} · {total.toLocaleString()} active members
          </p>
        </div>
        <Link
          href={`/communities/${slug}`}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Back to community
        </Link>
      </div>

      <ul className="space-y-3">
        {members.map((member) => (
          <li key={member.id}>
            <Card className="flex items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <Avatar
                  src={member.avatarUrl}
                  alt={member.fullName}
                  fallback={member.fullName}
                  size="md"
                />
                <div>
                  <p className="font-medium">{member.fullName}</p>
                  {member.username ? (
                    <Link
                      href={`/profile/${member.username}`}
                      className="text-xs text-primary hover:underline"
                    >
                      @{member.username}
                    </Link>
                  ) : null}
                </div>
              </div>
              <p className="text-sm capitalize text-muted-foreground">{member.role}</p>
            </Card>
          </li>
        ))}
      </ul>

      {totalPages > 1 ? (
        <div className="mt-6 flex items-center justify-center gap-2">
          {page > 1 ? (
            <Link
              href={`/communities/${slug}/members?page=${page - 1}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Previous
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={`/communities/${slug}/members?page=${page + 1}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Next
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          )}
        </div>
      ) : null}
    </PageContainer>
  );
}
