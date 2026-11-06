"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ChevronRight, Heart } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  formatDonationAmount,
  type CommunityDonationFund,
  type CommunityDonationSettings,
} from "@/lib/donations/community-donations";
import { fundIconEmoji, getFundProgressColor } from "@/lib/donations/fund-ui";
import { GradPadBlueHero } from "@/components/ui/GradPadBlueHero";
import { gradPadBlueProgressTrack } from "@/lib/ui/gradpad-blue-theme";
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

  const heroCopy = useMemo(() => {
    if (settings?.description?.trim()) return settings.description.trim();
    return "Every dollar supports our community events, scholarships, and alumni programs.";
  }, [settings?.description]);

  function onContinue() {
    if (!selected) return;
    router.push(`/communities/${communityId}/donate/${selected.id}`);
  }

  return (
    <>
      <div className="space-y-6 pb-32 lg:pb-28">
        <GradPadBlueHero>
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30">
              <Heart className="h-6 w-6 fill-white text-white" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 className="text-xl font-semibold tracking-tight md:text-2xl">{communityName}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/90">{heroCopy}</p>
            </div>
          </div>
        </GradPadBlueHero>

        <div>
          <h3 className="text-base font-semibold text-foreground">Select a Fund</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Where would you like your gift to go?
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {funds.map((fund) => {
              const active = fund.id === selectedId;
              const raised = fund.total_raised ?? 0;
              const goal = fund.goal_amount ?? null;
              const showGoal = fund.show_goal_progress !== false && goal != null && goal > 0;
              const pctRaw = showGoal && goal ? (raised / goal) * 100 : 0;
              const barColor = getFundProgressColor(fund.color);
              const donors = fund.donor_count ?? 0;

              return (
                <button
                  key={fund.id}
                  type="button"
                  onClick={() => setSelectedId(fund.id)}
                  className={cn(
                    "flex flex-col rounded-xl border bg-card p-4 text-left shadow-sm transition-all",
                    active
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-lg"
                      aria-hidden
                    >
                      {fundIconEmoji(fund.icon)}
                    </span>
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                        active ? "border-primary bg-primary" : "border-[#cbd5e1] bg-white",
                      )}
                      aria-hidden
                    >
                      {active ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-semibold leading-snug text-foreground">
                    {fund.name}
                  </p>
                  {fund.description ? (
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {fund.description}
                    </p>
                  ) : null}

                  <div className="mt-3 flex-1">
                    {showGoal ? (
                      <>
                        <div
                          className="h-2 overflow-hidden rounded-full"
                          style={{ backgroundColor: gradPadBlueProgressTrack }}
                        >
                          <div
                            className="h-full rounded-full transition-[width] duration-300"
                            style={{
                              width: `${Math.min(100, Math.max(raised > 0 ? 4 : 0, pctRaw))}%`,
                              backgroundColor: barColor,
                            }}
                          />
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">
                            ${formatDonationAmount(raised, 0)} raised
                          </span>
                          {" of "}
                          <span className="font-medium">${formatDonationAmount(goal!, 0)} goal</span>
                        </p>
                      </>
                    ) : (
                      <p className="text-xs font-semibold text-foreground">
                        ${formatDonationAmount(raised, 0)} raised
                      </p>
                    )}
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {donors > 0
                        ? `${donors} ${donors === 1 ? "donor" : "donors"}`
                        : "Be the first to give"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div
        className="fixed bottom-16 left-0 right-0 z-40 border-t border-primary-border bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(11,102,195,0.12)] backdrop-blur-md lg:bottom-0 lg:left-[276px] lg:px-8"
        role="region"
        aria-label="Donation actions"
      >
        <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <div className="min-w-0 sm:mr-auto sm:flex-1">
            <p className="text-xs font-medium text-primary">Selected</p>
            <p className="truncate text-sm font-semibold text-foreground">
              {selected?.name ?? "Select a fund"}
            </p>
          </div>
          <div className="flex shrink-0 gap-2 sm:gap-3">
            <Link
              href={`/communities/${communityId}`}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "flex-1 border-primary-border text-primary hover:bg-primary-light sm:flex-none",
              )}
            >
              Cancel
            </Link>
            <Button
              type="button"
              className="min-w-[140px] flex-1 gap-1 sm:flex-none"
              disabled={!selected}
              onClick={onContinue}
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
