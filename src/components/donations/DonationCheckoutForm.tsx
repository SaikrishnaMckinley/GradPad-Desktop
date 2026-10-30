"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  formatDonationAmount,
  resolveAllowCustomDonationAmount,
  resolveDonationMaxAmount,
  resolveDonationMinAmount,
  resolveDonationSuggestedAmounts,
  type CommunityDonationFund,
  type CommunityDonationSettings,
  type DonationStats,
} from "@/lib/donations/community-donations";
import { fundIconEmoji, getFundProgressColor } from "@/lib/donations/fund-ui";
import {
  getDonationQuoteAction,
  startCommunityDonationAction,
} from "@/lib/donations/actions";
import { cn } from "@/lib/utils/cn";

type Props = {
  routeKey: string;
  communityId: string;
  communityName: string;
  userName: string;
  userEmail: string;
  settings: CommunityDonationSettings | null;
  fund: CommunityDonationFund;
  stats: DonationStats | null;
};

export function DonationCheckoutForm({
  routeKey,
  communityId,
  communityName,
  userName,
  userEmail,
  settings,
  fund,
  stats,
}: Props) {
  const suggested = resolveDonationSuggestedAmounts(fund, settings);
  const minAmount = resolveDonationMinAmount(fund, settings);
  const maxAmount = resolveDonationMaxAmount(fund, settings);
  const allowCustom = resolveAllowCustomDonationAmount(fund, settings);

  const [preset, setPreset] = useState<number | "other">(
    suggested.includes(25) ? 25 : suggested[0] ?? "other",
  );
  const [customAmount, setCustomAmount] = useState("");
  const [coverFees, setCoverFees] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [message, setMessage] = useState("");
  const [quote, setQuote] = useState<Awaited<ReturnType<typeof getDonationQuoteAction>>["quote"]>(
    null,
  );
  const [quotePending, startQuote] = useTransition();
  const [submitPending, startSubmit] = useTransition();

  const donationAmount = useMemo(() => {
    if (preset === "other") {
      const n = parseFloat(customAmount);
      return Number.isFinite(n) ? n : 0;
    }
    return preset;
  }, [preset, customAmount]);

  useEffect(() => {
    if (donationAmount <= 0) {
      setQuote(null);
      return;
    }
    const timer = window.setTimeout(() => {
      startQuote(async () => {
        const result = await getDonationQuoteAction(routeKey, donationAmount, coverFees);
        if ("quote" in result) setQuote(result.quote ?? null);
      });
    }, 320);
    return () => window.clearTimeout(timer);
  }, [routeKey, donationAmount, coverFees]);

  const raised = stats?.total_raised ?? fund.total_raised ?? 0;
  const goal = stats?.goal_amount ?? fund.goal_amount;
  const barColor = getFundProgressColor(fund.color);
  const pct = goal && goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

  function onSubmit() {
    if (donationAmount < minAmount) {
      toast.error(`Minimum donation is $${minAmount.toFixed(2)}`);
      return;
    }
    if (maxAmount && donationAmount > maxAmount) {
      toast.error(`Maximum donation is $${maxAmount.toFixed(2)}`);
      return;
    }

    startSubmit(async () => {
      const result = await startCommunityDonationAction(routeKey, {
        fundId: fund.id,
        amount: donationAmount,
        coverFees,
        isAnonymous,
        isRecurring,
        frequency: "monthly",
        message,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
    });
  }

  const showFeeCoverage = settings?.allow_fee_coverage !== false;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-8">
      <div className="space-y-5">
        <Card className="rounded-[18px] p-5 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Your profile
          </p>
          <p className="mt-2 font-semibold">{userName}</p>
          <p className="text-sm text-muted-foreground">{userEmail}</p>
          <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded border-input-border"
            />
            Donate anonymously
          </label>
        </Card>

        <Card className="overflow-hidden rounded-[18px] shadow-card">
          <div className="border-b border-border bg-page-secondary/40 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{fundIconEmoji(fund.icon)}</span>
              <div>
                <p className="font-semibold">{fund.name}</p>
                <p className="text-xs text-muted-foreground">{communityName}</p>
              </div>
            </div>
            {fund.description ? (
              <p className="mt-3 text-sm text-muted-foreground">{fund.description}</p>
            ) : null}
          </div>
          {goal ? (
            <div className="px-5 py-4">
              <div className="h-2 overflow-hidden rounded-full bg-page-secondary">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: barColor }}
                />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                ${formatDonationAmount(raised, 0)} raised of ${formatDonationAmount(goal, 0)} goal
                {(stats?.donor_count ?? fund.donor_count ?? 0) > 0
                  ? ` · ${stats?.donor_count ?? fund.donor_count} donors`
                  : ""}
              </p>
            </div>
          ) : null}
        </Card>

        <Card className="rounded-[18px] p-5 shadow-card">
          <p className="mb-3 text-sm font-semibold">Donation amount</p>
          <div className="flex flex-wrap gap-2">
            {suggested.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setPreset(amount)}
                className={cn(
                  "min-w-[4rem] rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors",
                  preset === amount
                    ? "border-primary bg-primary-light text-primary"
                    : "border-border hover:bg-page-secondary",
                )}
              >
                ${amount}
              </button>
            ))}
            {allowCustom ? (
              <button
                type="button"
                onClick={() => setPreset("other")}
                className={cn(
                  "rounded-xl border px-4 py-2.5 text-sm font-medium",
                  preset === "other"
                    ? "border-primary bg-primary-light text-primary"
                    : "border-border hover:bg-page-secondary",
                )}
              >
                Other
              </button>
            ) : null}
          </div>
          {preset === "other" && allowCustom ? (
            <div className="mt-3">
              <Input
                inputMode="decimal"
                placeholder="Enter amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
              />
              <p className="mt-1 text-xs text-muted-foreground">Minimum ${minAmount}</p>
            </div>
          ) : null}

          {fund.allow_donor_message !== false ? (
            <div className="mt-4">
              <label htmlFor="donorMessage" className="mb-1.5 block text-sm font-medium">
                Add a note (optional)
              </label>
              <textarea
                id="donorMessage"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[80px] w-full rounded-xl border border-input-border px-3 py-2 text-sm"
              />
            </div>
          ) : null}

          {fund.allow_recurring ? (
            <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
              />
              Make this recurring (monthly)
            </label>
          ) : null}
        </Card>
      </div>

      <div className="xl:sticky xl:top-6 xl:self-start">
        <Card className="rounded-[18px] p-5 shadow-card">
          <p className="text-sm font-semibold">Donation summary</p>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Fund</span>
              <span className="text-right font-medium">{fund.name}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Donation</span>
              <span>${donationAmount > 0 ? donationAmount.toFixed(2) : "0.00"}</span>
            </div>
            {quote && quote.processing_fee_addon > 0 ? (
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Processing fee</span>
                <span>${quote.processing_fee_addon.toFixed(2)}</span>
              </div>
            ) : null}
            <div className="flex justify-between gap-2 border-t border-border pt-2 font-semibold">
              <span>Total</span>
              <span>
                {quotePending
                  ? "…"
                  : `$${(quote?.total_charge ?? donationAmount).toFixed(2)}`}
              </span>
            </div>
          </div>

          {showFeeCoverage && donationAmount > 0 ? (
            <label className="mt-4 flex cursor-pointer items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={coverFees}
                onChange={(e) => setCoverFees(e.target.checked)}
              />
              Cover processing fees so {communityName} receives the full ${donationAmount.toFixed(2)}
            </label>
          ) : null}

          <Button
            type="button"
            className="mt-5 w-full"
            disabled={donationAmount <= 0 || submitPending}
            onClick={onSubmit}
          >
            {submitPending ? "Redirecting…" : "Continue to payment"}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Confirmation will be sent to {userEmail}
          </p>
          <Link
            href={`/communities/${communityId}/donate`}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mt-2 w-full")}
          >
            Back to funds
          </Link>
        </Card>
      </div>
    </div>
  );
}
