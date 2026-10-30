"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  formatDonationAmount,
  type CommunityDonationFund,
  type CommunityDonationSettings,
} from "@/lib/donations/community-donations";
import { fundIconEmoji, getFundProgressColor } from "@/lib/donations/fund-ui";
import { cn } from "@/lib/utils/cn";

type Props = {
  communityId: string;
  communityName: string;
  settings: CommunityDonationSettings | null;
  funds: CommunityDonationFund[];
};

export function DonationFundPicker({ communityId, communityName, settings, funds }: Props) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(funds[0]?.id ?? "");

  const selected = funds.find((f) => f.id === selectedId) ?? funds[0];

  function onContinue() {
    if (!selected) return;
    router.push(`/communities/${communityId}/donate/${selected.id}`);
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden rounded-[22px] border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-6 shadow-card md:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Community</p>
        <h2 className="mt-1 text-xl font-semibold md:text-2xl">{communityName}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {settings?.description ||
            "Every dollar supports community events, scholarships, and alumni programs."}
        </p>
      </Card>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Select a fund</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {funds.map((fund) => {
            const active = fund.id === selectedId;
            const raised = fund.total_raised ?? 0;
            const goal = fund.goal_amount ?? statsGoal(fund);
            const pct =
              goal && goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : null;
            const barColor = getFundProgressColor(fund.color);

            return (
              <button
                key={fund.id}
                type="button"
                onClick={() => setSelectedId(fund.id)}
                className={cn(
                  "rounded-[18px] border bg-card p-4 text-left shadow-sm transition-all",
                  active
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-primary/40",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-2xl" aria-hidden>
                    {fundIconEmoji(fund.icon)}
                  </span>
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                      active ? "border-primary bg-primary" : "border-muted-foreground/40",
                    )}
                  >
                    {active ? (
                      <span className="h-2 w-2 rounded-full bg-primary-foreground" />
                    ) : null}
                  </span>
                </div>
                <p className="mt-3 font-semibold">{fund.name}</p>
                {fund.description ? (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{fund.description}</p>
                ) : null}
                {fund.show_goal_progress !== false && goal ? (
                  <div className="mt-4">
                    <div className="h-2 overflow-hidden rounded-full bg-page-secondary">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct ?? 0}%`,
                          backgroundColor: barColor,
                        }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        ${formatDonationAmount(raised, 0)} raised
                      </span>
                      {" · "}
                      ${formatDonationAmount(goal, 0)} goal
                      {(fund.donor_count ?? 0) > 0
                        ? ` · ${fund.donor_count} donor${fund.donor_count === 1 ? "" : "s"}`
                        : ""}
                    </p>
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href={`/communities/${communityId}`}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Cancel
        </Link>
        <Button type="button" className="gap-1" disabled={!selected} onClick={onContinue}>
          Continue
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function statsGoal(fund: CommunityDonationFund) {
  return fund.goal_amount ?? null;
}
