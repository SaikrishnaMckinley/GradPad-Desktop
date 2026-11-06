"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { PayoutStatusBadge } from "@/components/events/event-create-controls";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  loadCommunityPayoutStatus,
  startCommunityStripeConnect,
} from "@/lib/events/actions";
import { communityPayoutUiState } from "@/lib/events/payout-accounts";
import type { CommunityPayoutStatus, CommunityPayoutUiState } from "@/types/payment";

type Props = {
  communityId: string;
  slug: string;
  communityName: string;
  initialStatus: CommunityPayoutStatus | null;
  initialAccountLabel: string | null;
  initialPaymentOwner: boolean;
};

export function CommunityAdminBankTab({
  communityId,
  slug,
  communityName,
  initialStatus,
  initialAccountLabel,
  initialPaymentOwner,
}: Props) {
  const returnPath = `/communities/${slug}/admin?tab=bank`;
  const [connecting, setConnecting] = useState(false);
  const [status, setStatus] = useState(initialStatus);
  const [accountLabel, setAccountLabel] = useState(initialAccountLabel);
  const [view, setView] = useState<CommunityPayoutUiState>(() =>
    communityPayoutUiState(initialStatus),
  );

  const refreshStatus = useCallback(async () => {
    const result = await loadCommunityPayoutStatus(communityId);
    if (result.error && !result.status) {
      setStatus(null);
      setView("no-account");
      return;
    }
    setStatus(result.status);
    setView(communityPayoutUiState(result.status));
  }, [communityId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const setup = new URLSearchParams(window.location.search).get("payout_setup");
    if (setup === "success") {
      toast.success("Bank account setup updated.");
      void refreshStatus();
    }
    if (setup === "cancel") toast.message("Stripe setup was cancelled.");
  }, [refreshStatus]);

  async function connect() {
    setConnecting(true);
    const result = await startCommunityStripeConnect(communityId, slug, returnPath);
    if (result.error) {
      toast.error(result.error);
      setConnecting(false);
      return;
    }
    if (result.url) window.location.href = result.url;
  }

  const primaryLabel =
    view === "incomplete"
      ? "Continue Stripe setup"
      : view === "active"
        ? "Update bank account on Stripe"
        : "Connect with Stripe";

  return (
    <Card className="p-6 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Community bank account</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Used for paid events and donation payouts for {communityName}.
          </p>
        </div>
        <PayoutStatusBadge ready={view === "active"} />
      </div>

      <div className="mt-6 rounded-xl border border-border bg-page-secondary/40 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Connected account
        </p>
        {view === "active" && accountLabel ? (
          <p className="mt-2 text-base font-semibold text-foreground">{accountLabel}</p>
        ) : view === "incomplete" ? (
          <p className="mt-2 text-sm text-foreground">Setup started — finish onboarding in Stripe.</p>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No bank account connected yet.</p>
        )}
        {status?.stripe_account_id && view === "active" ? (
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            ID {status.stripe_account_id}
          </p>
        ) : null}
      </div>

      {status?.message && view === "no-account" ? (
        <p className="mt-4 text-sm text-muted-foreground">{status.message}</p>
      ) : null}

      {!initialPaymentOwner ? (
        <p className="mt-4 rounded-lg border border-border bg-page-secondary/50 px-3 py-2 text-sm text-muted-foreground">
          Only the community payment owner can connect or update the bank account.
        </p>
      ) : (
        <Button
          type="button"
          className="mt-6"
          disabled={connecting}
          onClick={() => void connect()}
        >
          {connecting ? "Opening Stripe…" : primaryLabel}
        </Button>
      )}
    </Card>
  );
}
