"use client";

import { ChevronUp } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { GradPadBlueHero } from "@/components/ui/GradPadBlueHero";
import { Input } from "@/components/ui/input";

import { formatDonationAmount } from "@/lib/donations/community-donations";
import { fundIconEmoji, getFundProgressColor } from "@/lib/donations/fund-ui";
import {
  getSuggestedAmounts,
  type DonationSelection,
  type DonationSettings,
  type EventDonationFundOption,
  validateDonationAmount,
} from "@/lib/events/event-donation";
import { cn } from "@/lib/utils/cn";

type Props = {
  settings: DonationSettings | null;
  funds: EventDonationFundOption[];
  selectedFundId: string | null;
  onFundChange: (fundId: string) => void;
  value: DonationSelection;
  onChange: (next: DonationSelection) => void;
  disabled?: boolean;
  /** Embedded in invite checkout step — no collapsed teaser, no extra top margin. */
  surface?: "standalone" | "inline";
};

function formatPreset(amount: number): string {
  const decimals = Number.isInteger(amount) ? 0 : 2;
  return formatDonationAmount(amount, decimals);
}

export function EventRegisterDonationSection({
  settings,
  funds,
  selectedFundId,
  onFundChange,
  value,
  onChange,
  disabled,
  surface = "standalone",
}: Props) {
  const fund = funds.find((f) => f.id === selectedFundId) ?? funds[0] ?? null;
  const inline = surface === "inline";
  const [expanded, setExpanded] = useState(inline || value.amount > 0);
  const [descExpanded, setDescExpanded] = useState(false);

  const effectiveSettings = useMemo((): DonationSettings | null => {
    if (!settings?.enabled && !fund) return null;
    const suggested =
      fund?.suggested_amounts && fund.suggested_amounts.length > 0
        ? fund.suggested_amounts
        : settings?.suggested_amounts;
    return {
      enabled: true,
      allow_custom_amount: fund?.allow_custom_amount ?? settings?.allow_custom_amount !== false,
      suggested_amounts: suggested,
      min_amount: fund?.min_amount ?? settings?.min_amount ?? 1,
      max_amount: fund?.max_amount ?? settings?.max_amount,
      title: fund?.name ?? settings?.title ?? "Support this event",
      description: fund?.description || settings?.description || "",
      allow_fee_coverage: settings?.allow_fee_coverage !== false,
      allow_anonymous: settings?.allow_anonymous !== false,
      allow_donor_message: settings?.allow_donor_message !== false,
    };
  }, [fund, settings]);

  const suggested = getSuggestedAmounts(effectiveSettings);
  const allowCustom = effectiveSettings?.allow_custom_amount !== false;
  const [customText, setCustomText] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const validationError =
    value.amount > 0 ? validateDonationAmount(value.amount, effectiveSettings) : null;

  const goal = fund?.goal_amount ?? effectiveSettings?.goal_amount;
  const raised = fund?.total_raised ?? 0;
  const pctRaw = goal && goal > 0 ? (raised / goal) * 100 : 0;
  const pctLabel = goal && goal > 0 ? Math.min(100, Math.round(pctRaw)) : null;
  const barColor = getFundProgressColor(fund?.color ?? "blue");
  const popularAmount = suggested[0];

  const selectPreset = (amount: number) => {
    const next = value.amount === amount && !value.isCustom ? 0 : amount;
    onChange({
      ...value,
      amount: next,
      isCustom: false,
      coverFees: next > 0 ? value.coverFees : false,
      fundId: fund?.id ?? value.fundId,
    });
    setShowCustom(false);
    setCustomText("");
    if (next > 0) setExpanded(true);
  };

  if (!effectiveSettings) return null;

  const headline = effectiveSettings.title ?? "Community fund";
  const description = effectiveSettings.description?.trim() ?? "";
  const descLong = description.length > 140;
  const descShown =
    descLong && !descExpanded ? `${description.slice(0, 140).trim()}…` : description;

  if (!inline && !expanded) {
    return (
      <section
        aria-label="Community gift"
        className="mt-6 overflow-hidden rounded-xl border border-primary-border/60 bg-card shadow-sm md:mt-8"
      >
        <div className="p-4 sm:p-5 md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:gap-5">
            <div className="flex min-w-0 gap-3 md:gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light text-base md:h-11 md:w-11 md:text-lg">
                {fundIconEmoji(fund?.icon ?? "general")}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground md:text-base">{headline}</p>
                {value.amount > 0 ? (
                  <p className="mt-1 text-sm text-foreground">
                    Gift added:{" "}
                    <span className="font-semibold text-primary">${formatPreset(value.amount)}</span>
                    <span className="text-muted-foreground"> · included in your total</span>
                  </p>
                ) : (
                  <>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {description
                        ? descShown
                        : "Support the community fund in one tap — your ticket works either way."}
                    </p>
                    {descLong && !value.amount ? (
                      <button
                        type="button"
                        className="mt-1 text-sm font-medium text-primary hover:underline"
                        onClick={() => setDescExpanded((v) => !v)}
                      >
                        {descExpanded ? "Show less" : "Read more"}
                      </button>
                    ) : null}
                  </>
                )}
                {pctLabel != null && goal ? (
                  <p className="mt-2 text-xs font-medium text-foreground/80">
                    ${formatDonationAmount(raised, 0)} raised
                    <span className="text-muted-foreground"> · {pctLabel}% of goal</span>
                  </p>
                ) : null}
              </div>
            </div>
            <Button
              type="button"
              className="w-full shrink-0 sm:w-auto"
              disabled={disabled}
              onClick={() => setExpanded(true)}
            >
              {value.amount > 0 ? `Edit $${formatPreset(value.amount)} gift` : "Add a gift"}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const amountPicker = (
      <div className={cn("space-y-3 md:space-y-5", inline ? "" : "p-4 sm:p-5 md:p-6")}>
        {funds.length > 1 ? (
          <div>
            <p className="text-xs font-semibold text-foreground md:text-sm">Fund</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5 md:mt-2 md:gap-2">
              {funds.map((f) => {
                const active = (selectedFundId ?? funds[0]?.id) === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      onFundChange(f.id);
                      onChange({ ...value, fundId: f.id });
                    }}
                    className={cn(
                      "rounded-lg border px-2.5 py-1.5 text-left text-xs font-medium transition-colors md:rounded-xl md:px-3 md:py-2 md:text-sm",
                      active
                        ? "border-primary bg-primary-light text-primary"
                        : "border-border bg-white hover:border-primary/35",
                    )}
                  >
                    {f.name}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-xs font-semibold text-foreground md:text-sm">Choose an amount</p>
            {popularAmount && value.amount <= 0 ? (
              <p className="text-xs text-muted-foreground">
                Suggested ${formatPreset(popularAmount)}
              </p>
            ) : null}
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1.5 sm:grid-cols-6 md:mt-3 md:gap-2">
            {suggested.map((amount) => (
              <button
                key={amount}
                type="button"
                disabled={disabled}
                onClick={() => selectPreset(amount)}
                className={cn(
                  "rounded-lg border py-2 text-xs font-semibold transition-all md:rounded-xl md:py-3 md:text-sm",
                  value.amount === amount && !value.isCustom
                    ? "border-primary bg-primary text-white shadow-sm"
                    : "border-border bg-white hover:border-primary/40 hover:bg-primary-light/30",
                )}
              >
                ${formatPreset(amount)}
              </button>
            ))}
            {allowCustom ? (
              <button
                type="button"
                disabled={disabled}
                onClick={() => {
                  setShowCustom(true);
                  onChange({ ...value, amount: 0, isCustom: true, fundId: fund?.id ?? value.fundId });
                }}
                className={cn(
                  "rounded-lg border py-2 text-xs font-semibold md:rounded-xl md:py-3 md:text-sm",
                  showCustom || value.isCustom
                    ? "border-primary bg-primary text-white"
                    : "border-border hover:bg-primary-light/30",
                )}
              >
                Other
              </button>
            ) : null}
          </div>
        </div>

        {showCustom || value.isCustom ? (
          <div>
            <p className="mb-1.5 text-xs font-semibold text-foreground md:mb-2 md:text-sm">Custom amount</p>
            <Input
              inputMode="decimal"
              placeholder="0.00"
              className="max-w-xs"
              value={customText || (value.isCustom && value.amount ? String(value.amount) : "")}
              disabled={disabled}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/[^\d.]/g, "");
                setCustomText(cleaned);
                const parsed = parseFloat(cleaned);
                onChange({
                  ...value,
                  amount: Number.isFinite(parsed) ? parsed : 0,
                  isCustom: true,
                  fundId: fund?.id ?? value.fundId,
                });
              }}
            />
          </div>
        ) : null}

        {value.amount > 0 && effectiveSettings.allow_fee_coverage !== false ? (
          <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-primary/15 bg-primary-light/25 p-3 text-xs leading-snug md:gap-3 md:rounded-xl md:p-4 md:text-sm">
            <input
              type="checkbox"
              className="mt-0.5 rounded border-input-border accent-primary"
              checked={value.coverFees}
              disabled={disabled}
              onChange={(e) => onChange({ ...value, coverFees: e.target.checked })}
            />
            <span className="text-foreground">
              I&apos;ll cover processing fees so{" "}
              <strong>${formatPreset(value.amount)}</strong> goes to the fund.
            </span>
          </label>
        ) : null}

        {!inline && value.amount > 0 ? (
          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3 md:gap-3 md:pt-4">
            <p className="text-sm text-muted-foreground">
              Selected:{" "}
              <span className="font-semibold text-primary">${formatPreset(value.amount)}</span>
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              disabled={disabled}
              onClick={() => {
                onChange({
                  ...value,
                  amount: 0,
                  isCustom: false,
                  coverFees: false,
                  message: "",
                });
                setShowCustom(false);
                setCustomText("");
              }}
            >
              Remove gift
            </Button>
          </div>
        ) : null}

        {validationError ? (
          <p className="text-sm text-destructive">{validationError}</p>
        ) : null}
      </div>
  );

  if (inline) {
    return (
      <section aria-label="Community gift" className="space-y-3 md:space-y-4">
        <div className="flex gap-2.5 md:gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light text-base md:h-10 md:w-10 md:text-lg">
            {fundIconEmoji(fund?.icon ?? "general")}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{headline}</p>
            {description ? (
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{descShown}</p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                Optional — skip if you prefer not to give.
              </p>
            )}
            {pctLabel != null && goal ? (
              <p className="mt-2 text-xs font-medium text-muted-foreground">
                ${formatDonationAmount(raised, 0)} raised · {pctLabel}% of goal
              </p>
            ) : null}
          </div>
        </div>
        {amountPicker}
      </section>
    );
  }

  return (
    <section
      aria-label="Community gift"
      className="mt-6 overflow-hidden rounded-2xl border border-primary-border/60 bg-card shadow-card md:mt-8"
    >
      <GradPadBlueHero size="compact" className="rounded-none rounded-t-2xl">
        <div className="flex items-start justify-between gap-2 md:gap-3">
          <div className="flex min-w-0 gap-2.5 md:gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/20 text-base ring-1 ring-white/25 md:h-10 md:w-10 md:text-lg">
              {fundIconEmoji(fund?.icon ?? "general")}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white md:text-base">{headline}</p>
              <p className="mt-0.5 text-xs text-white/90 md:text-sm">
                Optional gift — your ticket is already reserved.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-white/95 hover:bg-white/15"
            onClick={() => setExpanded(false)}
          >
            <ChevronUp className="h-4 w-4" aria-hidden />
            Done
          </button>
        </div>

        {pctLabel != null && goal ? (
          <div className="mt-3 rounded-lg bg-white/15 p-2.5 ring-1 ring-white/20 md:mt-4 md:rounded-xl md:p-3">
            <div className="flex items-baseline justify-between gap-2 text-xs text-white/90">
              <span className="font-semibold text-white">
                ${formatDonationAmount(raised, 0)} raised
              </span>
              <span>Goal ${formatDonationAmount(goal, 0)}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/25">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{
                  width: `${Math.max(pctRaw, raised > 0 ? 3 : 0)}%`,
                  backgroundColor: barColor,
                }}
              />
            </div>
          </div>
        ) : null}
      </GradPadBlueHero>

      {description ? (
        <p className="border-b border-primary-border/40 bg-primary-light/20 px-4 py-2.5 text-xs leading-relaxed text-muted-foreground sm:px-5 md:px-6 md:py-3 md:text-sm">
          {description}
        </p>
      ) : null}

      {amountPicker}
    </section>
  );
}
