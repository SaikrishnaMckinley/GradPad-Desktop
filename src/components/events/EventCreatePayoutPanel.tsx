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
    <div className="w-full rounded-xl border border-primary-border bg-gradient-to-br from-primary-light/50 to-card p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Payout for paid tickets</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {communityName} · Stripe test mode on staging
            </p>
          </div>
        </div>
        <PayoutStatusBadge ready={hasReady} />
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Your event draft is saved automatically before you leave for bank setup. After Stripe, you
        return here with fields restored.
      </p>

      {loading ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading payout accounts…</p>
      ) : apiError ? (
        <p className="mt-4 text-sm text-error">{apiError}</p>
      ) : hasReady ? (
        <div className="mt-4 space-y-2">
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
                  "flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm",
                  selected ? "border-primary bg-card shadow-sm" : "border-border bg-page-secondary/50",
                )}
              >
                <span className="font-medium">{label}</span>
                <span className="text-xs uppercase text-muted-foreground">{account.type}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="mt-4 rounded-lg border border-border bg-card/80 px-3 py-2.5 text-sm text-muted-foreground">
          No verified payout account yet. Connect a community bank account to sell paid tickets.
        </p>
      )}

      <div className="mt-4 flex w-full flex-col gap-2">
        <Button
          type="button"
          className="h-11 w-full text-base"
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
            "h-11 w-full gap-2 text-base",
          )}
        >
          <ExternalLink className="h-4 w-4" />
          Open banking setup page
        </Link>
      </div>
    </div>
  );
}
