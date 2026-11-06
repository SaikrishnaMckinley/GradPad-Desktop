"use client";

import Link from "next/link";
import { formatDonationAmount, type CommunityDonationFund } from "@/lib/donations/community-donations";
import { fundIconEmoji, getFundProgressColor } from "@/lib/donations/fund-ui";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

type Props = {
  slug: string;
  communityId: string;
  funds: CommunityDonationFund[];
  payoutReady: boolean;
  totalRaised: number;
  /** Defaults to manage-payout page. */
  bankTabHref?: string;
};

export function DonationAdminFunds({
  slug,
  communityId,
  funds,
  payoutReady,
  totalRaised,
  bankTabHref,
}: Props) {
  const bankHref = bankTabHref ?? `/communities/${slug}/manage-payout`;
  return (
    <div className="space-y-4 md:space-y-6">
      {!payoutReady ? (
        <Card className="border-amber-200 bg-amber-50 p-4 text-xs text-amber-950 md:p-5 md:text-sm">
          <p className="font-semibold">Bank account required</p>
          <p className="mt-1 text-amber-900/90">
            Connect and complete Stripe payout setup before creating funds. Only funds linked to a
            payout account are visible to members.
          </p>
          <Link
            href={bankHref}
            className={cn(buttonVariants({ size: "sm" }), "mt-3 h-8 text-xs md:mt-4 md:h-9 md:text-sm")}
          >
            Set up bank account
          </Link>
        </Card>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2 md:gap-3">
        <div>
          <p className="text-xs text-muted-foreground md:text-sm">Total raised (all funds)</p>
          <p className="text-xl font-semibold md:text-2xl">${formatDonationAmount(totalRaised, 0)}</p>
        </div>
        {payoutReady ? (
          <Link
            href={`/communities/${slug}/admin/donations/new`}
            className={cn(buttonVariants(), "h-9 px-3 text-sm md:h-10 md:px-4")}
          >
            Create fund
          </Link>
        ) : (
          <Button disabled className="h-9 px-3 text-sm md:h-10 md:px-4">
            Create fund
          </Button>
        )}
      </div>

      {funds.length === 0 ? (
        <Card className="p-4 text-xs text-muted-foreground md:p-6 md:text-sm">
          No donation funds yet. Create a fund after your bank account is connected.
        </Card>
      ) : (
        <ul className="space-y-2 md:space-y-3">
          {funds.map((fund) => {
            const barColor = getFundProgressColor(fund.color);
            const raised = fund.total_raised ?? 0;
            const goal = fund.goal_amount;
            const pct =
              goal && goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

            return (
              <li key={fund.id}>
                <Card className="p-3 md:p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2 md:gap-3">
                    <div className="flex min-w-0 flex-1 gap-2 md:gap-3">
                      <span className="shrink-0 text-lg leading-none md:text-xl">
                        {fundIconEmoji(fund.icon)}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-snug md:text-base">{fund.name}</p>
                        <p className="text-[11px] text-muted-foreground md:text-xs">
                          {fund.is_active === false ? "Inactive" : "Active"}
                          {fund.payout_account_display?.label
                            ? ` · ${fund.payout_account_display.label}`
                            : ""}
                        </p>
                      </div>
                    </div>
                    <p className="shrink-0 text-xs font-medium md:text-sm">
                      ${formatDonationAmount(raised, 0)} raised
                    </p>
                  </div>
                  {goal ? (
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-page-secondary md:mt-3 md:h-1.5">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: barColor }}
                      />
                    </div>
                  ) : null}
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <Link
        href={`/communities/${communityId}/donate`}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-9 text-sm md:h-10",
        )}
      >
        Preview donor experience
      </Link>
    </div>
  );
}
