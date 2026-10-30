"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PayoutStatusBadge } from "@/components/events/event-create-controls";
import {
  loadCommunityPayoutStatus,
  startCommunityStripeConnect,
} from "@/lib/events/actions";
import { communityPayoutUiState } from "@/lib/events/payout-accounts";
import { cn } from "@/lib/utils/cn";
import type { CommunityPayoutStatus, CommunityPayoutUiState } from "@/types/payment";

type Props = {
  communityId: string;
  slug: string;
  communityName: string;
  defaultReturnPath: string;
};

export function CommunityManagePayoutClient({
  communityId,
  slug,
  communityName,
  defaultReturnPath,
}: Props) {
  const searchParams = useSearchParams();
  const returnPath = searchParams.get("return") ?? defaultReturnPath;
  const [connecting, setConnecting] = useState(false);
  const [view, setView] = useState<CommunityPayoutUiState>("loading");
  const [status, setStatus] = useState<CommunityPayoutStatus | null>(null);

  const refreshStatus = useCallback(async () => {
    setView("loading");
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
    void refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    const setup = searchParams.get("payout_setup");
    if (setup === "success") {
      toast.success("Bank account setup updated.");
      void refreshStatus();
    }
    if (setup === "cancel") toast.message("Stripe setup was cancelled.");
  }, [searchParams, refreshStatus]);

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

  const description =
    view === "active"
      ? "Your community Stripe account is connected. You can open Stripe to review or update payout details."
      : view === "incomplete"
        ? "Stripe onboarding was started but not finished. Continue setup to accept paid event tickets."
        : "Connect Stripe so paid events can accept test payments on staging.";

  return (
    <Card className="max-w-lg p-6 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Payments</p>
        {view !== "loading" ? <PayoutStatusBadge ready={view === "active"} /> : null}
      </div>
      <h1 className="mt-2 text-xl font-semibold">Community bank account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {communityName} — {description}
      </p>

      {status?.message && view === "no-account" ? (
        <p className="mt-3 text-sm text-muted-foreground">{status.message}</p>
      ) : null}

      {status?.is_payment_owner === false ? (
        <p className="mt-4 rounded-lg border border-border bg-page-secondary/50 px-3 py-2 text-sm text-muted-foreground">
          Only the community payment owner can connect or update the bank account. Ask an owner to
          complete setup, or return to event creation for free-only events.
        </p>
      ) : null}

      {view === "loading" ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading payout status…</p>
      ) : status?.is_payment_owner !== false ? (
        <Button type="button" className="mt-6 w-full" disabled={connecting} onClick={connect}>
          {connecting ? "Opening Stripe…" : primaryLabel}
        </Button>
      ) : null}

      <Link
        href={returnPath}
        className={cn(buttonVariants({ variant: "outline" }), "mt-3 w-full")}
      >
        Return to event creation
      </Link>
    </Card>
  );
}
