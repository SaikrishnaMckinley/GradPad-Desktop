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
};

export function DonationAdminFunds({
  slug,
  communityId,
  funds,
  payoutReady,
  totalRaised,
}: Props) {
  return (
    <div className="space-y-6">
      {!payoutReady ? (
        <Card className="border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
          <p className="font-semibold">Bank account required</p>
          <p className="mt-1 text-amber-900/90">
            Connect and complete Stripe payout setup before creating funds. Only funds linked to a
            payout account are visible to members.
          </p>
          <Link
            href={`/communities/${slug}/manage-payout`}
            className={cn(buttonVariants({ size: "sm" }), "mt-4")}
          >
            Set up bank account
          </Link>
        </Card>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Total raised (all funds)</p>
          <p className="text-2xl font-semibold">${formatDonationAmount(totalRaised, 0)}</p>
        </div>
        {payoutReady ? (
          <Link
            href={`/communities/${slug}/admin/donations/new`}
            className={cn(buttonVariants())}
          >
            Create fund
          </Link>
        ) : (
          <Button disabled>Create fund</Button>
        )}
      </div>

      {funds.length === 0 ? (
        <Card className="p-6 text-sm text-muted-foreground">
          No donation funds yet. Create a fund after your bank account is connected.
        </Card>
      ) : (
        <ul className="space-y-3">
          {funds.map((fund) => {
            const barColor = getFundProgressColor(fund.color);
            const raised = fund.total_raised ?? 0;
            const goal = fund.goal_amount;
            const pct =
              goal && goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

            return (
              <li key={fund.id}>
                <Card className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <span className="text-xl">{fundIconEmoji(fund.icon)}</span>
                      <div>
                        <p className="font-semibold">{fund.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {fund.is_active === false ? "Inactive" : "Active"}
                          {fund.payout_account_display?.label
                            ? ` · ${fund.payout_account_display.label}`
                            : ""}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-medium">${formatDonationAmount(raised, 0)} raised</p>
                  </div>
                  {goal ? (
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-page-secondary">
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
        className={cn(buttonVariants({ variant: "outline" }))}
      >
        Preview donor experience
      </Link>
    </div>
  );
}
