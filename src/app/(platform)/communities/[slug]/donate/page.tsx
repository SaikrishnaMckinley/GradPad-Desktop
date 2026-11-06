import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, History } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { DonationFundPicker } from "@/components/donations/DonationFundPicker";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/card";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { getCommunityBySlug } from "@/lib/communities/queries";
import { loadDonateIndex } from "@/lib/donations/load-donate-page";

export const instant = false;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const community = await getCommunityBySlug(slug, null);
  return { title: community ? `Donate · ${community.name}` : "Make a donation" };
}

export default async function CommunityDonatePage({ params }: Props) {
  const { slug } = await params;
  const session = await getSessionProfile();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent(`/communities/${slug}/donate`)}`);
  }

  const community = await getCommunityBySlug(slug, session.id);
  if (!community) notFound();

  const payload = await loadDonateIndex(community.id);

  if (payload.funds.length === 1) {
    redirect(`/communities/${community.id}/donate/${payload.funds[0].id}`);
  }

  return (
    <PageContainer className="max-w-5xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <Link
            href={`/communities/${community.slug}`}
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card hover:bg-primary-light"
            aria-label="Back to community"
          >
            <ChevronLeft className="h-5 w-5 text-primary" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Make a Donation
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Support the programs that matter most to your alumni community.
            </p>
          </div>
        </div>
        <Link
          href={`/communities/${community.id}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "hidden shrink-0 gap-1.5 border-primary-border text-primary hover:bg-primary-light sm:inline-flex",
          )}
        >
          <History className="h-4 w-4" aria-hidden />
          History
        </Link>
      </div>

      {!payload.available ? (
        <Card className="rounded-[22px] p-8 text-center shadow-card">
          <p className="text-lg font-semibold">Donations coming soon</p>
          <p className="mt-2 text-sm text-muted-foreground">
            This community hasn&apos;t set up donation funds yet. Admins can connect a bank account
            and create funds from the admin dashboard.
          </p>
          <Link
            href={`/communities/${community.slug}`}
            className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
          >
            Back to community
          </Link>
        </Card>
      ) : (
        <DonationFundPicker
          communityId={community.id}
          communityName={community.name}
          settings={payload.settings}
          funds={payload.funds}
        />
      )}
    </PageContainer>
  );
}
