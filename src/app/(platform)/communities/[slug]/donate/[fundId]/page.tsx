import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { DonationCheckoutForm } from "@/components/donations/DonationCheckoutForm";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/card";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { getCommunityBySlug } from "@/lib/communities/queries";
import { loadDonateFundPage } from "@/lib/donations/load-donate-page";

export const instant = false;

type Props = { params: Promise<{ slug: string; fundId: string }> };

export default async function CommunityDonateFundPage({ params }: Props) {
  const { slug, fundId } = await params;
  const session = await getSessionProfile();
  if (!session) {
    redirect(
      `/login?next=${encodeURIComponent(`/communities/${slug}/donate/${fundId}`)}`,
    );
  }

  const community = await getCommunityBySlug(slug, session.id);
  if (!community) notFound();

  const payload = await loadDonateFundPage(community.id, fundId);
  if (!payload.available || !payload.fund) {
    return (
      <PageContainer className="max-w-4xl">
        <Card className="rounded-[22px] p-8 text-center shadow-card">
          <p className="font-semibold">This fund is not available</p>
          <Link href={`/communities/${community.id}/donate`} className="mt-4 text-sm text-primary">
            Choose another fund
          </Link>
        </Card>
      </PageContainer>
    );
  }

  const userName = session.fullName?.trim() || session.email || "Member";

  return (
    <PageContainer className="max-w-5xl">
      <div className="mb-8 flex items-start gap-3">
        <Link
          href={`/communities/${community.id}/donate`}
          className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card shadow-sm hover:bg-page-secondary"
          aria-label="Back to fund selection"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Complete your gift</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {payload.fund.name} · {community.name}
          </p>
        </div>
      </div>

      <DonationCheckoutForm
        routeKey={community.id}
        communityId={community.id}
        communityName={community.name}
        userName={userName}
        userEmail={session.email ?? ""}
        settings={payload.settings}
        fund={payload.fund}
        stats={payload.stats}
      />
    </PageContainer>
  );
}
