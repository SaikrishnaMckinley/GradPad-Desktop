"use client";

import Link from "next/link";
import { Building2, ExternalLink } from "lucide-react";
import { PayoutStatusBadge } from "@/components/events/event-create-controls";
import { Button, buttonVariants } from "@/components/ui/button";
import { eventCreateReturnPath } from "@/lib/events/site-url";
import { cn } from "@/lib/utils/cn";
import type { AvailablePayoutAccount } from "@/types/payment";

type Props = {
  communityId: string;
  communitySlug: string;
  communityName: string;
  loading: boolean;
  apiError: string | null;
  readyAccounts: AvailablePayoutAccount[];
  selectedType: string;
  selectedId: string;
  connectingStripe: boolean;
  onSelectAccount: (account: AvailablePayoutAccount) => void;
  onConnectStripe: () => void;
  onBeforeNavigate: () => void;
};

export function EventCreatePayoutPanel({
  communityId,
  communitySlug,
  communityName,
  loading,
  apiError,
  readyAccounts,
  selectedType,
  selectedId,
  connectingStripe,
  onSelectAccount,
  onConnectStripe,
  onBeforeNavigate,
}: Props) {
  const returnPath = eventCreateReturnPath(communityId, "success");
  const bankingHref = `/communities/${communitySlug}/manage-payout?return=${encodeURIComponent(returnPath)}`;
  const hasReady = readyAccounts.length > 0;

  return (
    <div className="w-full rounded-lg border border-primary-border bg-gradient-to-br from-primary-light/50 to-card p-3 md:rounded-xl md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2 md:gap-3">
        <div className="flex min-w-0 items-start gap-2 md:gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary md:h-10 md:w-10 md:rounded-xl">
            <Building2 className="h-4 w-4 md:h-5 md:w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground md:text-sm">Payout for paid tickets</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground md:text-xs">
              {communityName} · Stripe test mode on staging
            </p>
          </div>
        </div>
        <PayoutStatusBadge ready={hasReady} />
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground md:mt-3 md:text-xs">
        Your event draft is saved automatically before you leave for bank setup. After Stripe, you
        return here with fields restored.
      </p>

      {loading ? (
        <p className="mt-3 text-xs text-muted-foreground md:mt-4 md:text-sm">Loading payout accounts…</p>
      ) : apiError ? (
        <p className="mt-3 text-xs text-error md:mt-4 md:text-sm">{apiError}</p>
      ) : hasReady ? (
        <div className="mt-3 space-y-1.5 md:mt-4 md:space-y-2">
          {readyAccounts.map((account) => {
            const selected = account.type === selectedType && account.id === selectedId;
            const label =
              account.display_name ||
              account.name ||
              (account.type === "community" ? "Community account" : "Personal account");
            return (
              <button
                key={`${account.type}-${account.id}`}
                type="button"
                onClick={() => onSelectAccount(account)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg border px-2.5 py-2 text-left text-xs md:px-3 md:py-2.5 md:text-sm",
                  selected ? "border-primary bg-card shadow-sm" : "border-border bg-page-secondary/50",
                )}
              >
                <span className="font-medium">{label}</span>
                <span className="text-[10px] uppercase text-muted-foreground md:text-xs">{account.type}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="mt-3 rounded-lg border border-border bg-card/80 px-2.5 py-2 text-xs text-muted-foreground md:mt-4 md:px-3 md:py-2.5 md:text-sm">
          No verified payout account yet. Connect a community bank account to sell paid tickets.
        </p>
      )}

      <div className="mt-3 flex w-full flex-col gap-1.5 md:mt-4 md:gap-2">
        <Button
          type="button"
          className="h-10 w-full text-sm md:h-11 md:text-base"
          disabled={connectingStripe}
          onClick={onConnectStripe}
        >
          {connectingStripe
            ? "Redirecting to Stripe…"
            : hasReady
              ? "Update bank account on Stripe"
              : "Connect bank account with Stripe"}
        </Button>
        <Link
          href={bankingHref}
          onClick={onBeforeNavigate}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-10 w-full gap-1.5 text-sm md:h-11 md:gap-2 md:text-base",
          )}
        >
          <ExternalLink className="h-3.5 w-3.5 md:h-4 md:w-4" />
          Open banking setup page
        </Link>
      </div>
    </div>
  );
}
