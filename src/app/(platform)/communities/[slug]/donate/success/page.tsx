import Link from "next/link";
import { notFound } from "next/navigation";
import { Heart } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { verifyDonationSessionRaw } from "@/lib/api/community-donations";
import { getCommunityBySlug } from "@/lib/communities/queries";
import {
  formatDonationAmount,
  toDonationNumber,
} from "@/lib/donations/community-donations";
import { cn } from "@/lib/utils/cn";

export const instant = false;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ session_id?: string }>;
};

export default async function DonationSuccessPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { session_id: sessionId } = await searchParams;

  const community = await getCommunityBySlug(slug, null);
  if (!community) notFound();

  let amount: number | null = null;
  let email: string | null = null;

  if (sessionId) {
    const verified = await verifyDonationSessionRaw(sessionId);
    if (verified.ok && verified.data && typeof verified.data === "object") {
      const data = verified.data as Record<string, unknown>;
      amount = toDonationNumber(data.amount) ?? null;
      email = typeof data.donor_email === "string" ? data.donor_email : null;
    }
  }

  return (
    <PageContainer className="max-w-lg">
      <Card className="rounded-[22px] px-6 py-10 text-center shadow-card md:px-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary">
          <Heart className="h-7 w-7 fill-current" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold">Thank you!</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {amount != null ? (
            <>
              Your <strong>${formatDonationAmount(amount, 2)}</strong> donation to{" "}
              <strong>{community.name}</strong> is on its way.
            </>
          ) : (
            <>Your donation to {community.name} is being confirmed.</>
          )}
          {email ? (
            <>
              {" "}
              A confirmation will be sent to <strong>{email}</strong>.
            </>
          ) : null}
        </p>
        <Link
          href={`/communities/${community.slug}`}
          className={cn(buttonVariants(), "mt-8 w-full")}
        >
          Back to community
        </Link>
        <Link
          href="/home"
          className={cn(buttonVariants({ variant: "ghost" }), "mt-2 w-full")}
        >
          Go to home
        </Link>
      </Card>
    </PageContainer>
  );
}
