"use client";

import Link from "next/link";
import { useLayoutEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CommunityAdminBankTab } from "@/components/communities/CommunityAdminBankTab";
import { DonationAdminFunds } from "@/components/donations/DonationAdminFunds";
import { DonationSettingsToggle } from "@/components/donations/DonationSettingsToggle";
import { Avatar } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  patchCommunityAdminCache,
  writeCommunityAdminCache,
} from "@/lib/communities/community-admin-cache";
import type { CommunityAdminDashboardData } from "@/lib/communities/load-admin-dashboard";
import {
  ADMIN_MEMBER_ROLE_SELECT_CLASS,
  membershipRoleBadgeClass,
  membershipRoleLabel,
  sortMembersByDisplayRole,
} from "@/lib/communities/membership-role-ui";
import {
  removeMemberAction,
  reviewMembershipRequest,
  updateMemberRoleAction,
} from "@/lib/communities/actions";
import type {
  CommunityJoinRequestRow,
  CommunityMemberRow,
  MembershipRole,
} from "@/types/community";
import { cn } from "@/lib/utils/cn";

type TabId = "requests" | "members" | "donations" | "bank";

const ASSIGNABLE: MembershipRole[] = ["admin", "member"];

type Props = CommunityAdminDashboardData & {
  initialTab?: TabId | null;
};

function parseTab(value: string | null | undefined): TabId | null {
  if (value === "requests" || value === "members" || value === "donations" || value === "bank") {
    return value;
  }
  return null;
}

export function CommunityAdminDashboard(props: Props) {
  const defaultTab: TabId = props.pending.length > 0 ? "requests" : "members";
  const [activeTab, setActiveTab] = useState<TabId>(
    () => parseTab(props.initialTab) ?? defaultTab,
  );

  useLayoutEffect(() => {
    writeCommunityAdminCache(props);
  }, [props.slug, props.pending, props.members, props.donationFunds, props.payoutStatus]);

  const setTab = (tab: TabId) => {
    setActiveTab(tab);
    const path = `/communities/${props.slug}/admin?tab=${tab}`;
    window.history.replaceState(window.history.state, "", path);
  };

  const tabs = useMemo(
    () =>
      [
        {
          id: "requests" as const,
          label: "Requests",
          count: props.pending.length,
        },
        { id: "members" as const, label: "Active members", count: props.members.length },
        { id: "donations" as const, label: "Donation funds", count: null },
        { id: "bank" as const, label: "Bank account", count: null },
      ] satisfies { id: TabId; label: string; count: number | null }[],
    [props.pending.length, props.members.length],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">{props.communityName}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <Link
            href={`/communities/${props.slug}/edit`}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "font-normal text-muted-foreground hover:text-foreground",
            )}
          >
            Edit community
          </Link>
          <span className="text-muted-foreground/40" aria-hidden>
            ·
          </span>
          <Link
            href={`/communities/${props.slug}`}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "font-normal text-muted-foreground hover:text-foreground",
            )}
          >
            View community
          </Link>
        </div>
      </div>

      <nav
        className="flex flex-wrap gap-1 rounded-xl border border-border bg-page-secondary/30 p-1"
        aria-label="Admin sections"
      >
        {tabs.map((tab) => {
          const selected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTab(tab.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                selected
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-card/60 hover:text-foreground",
              )}
              aria-current={selected ? "page" : undefined}
            >
              {tab.label}
              {tab.count != null && tab.count > 0 ? (
                <span
                  className={cn(
                    "min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-center text-xs font-semibold",
                    selected ? "bg-primary text-white" : "bg-primary-light text-primary",
                  )}
                >
                  {tab.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="min-h-[240px]">
        <div className={activeTab === "requests" ? undefined : "hidden"} aria-hidden={activeTab !== "requests"}>
          <AdminRequestsTab
            slug={props.slug}
            communityId={props.communityId}
            initialPending={props.pending}
          />
        </div>
        <div className={activeTab === "members" ? undefined : "hidden"} aria-hidden={activeTab !== "members"}>
          <AdminMembersTab
            slug={props.slug}
            communityId={props.communityId}
            actorRole={props.actorRole}
            initialMembers={props.members}
          />
        </div>
        <div
          className={cn("space-y-6", activeTab === "donations" ? undefined : "hidden")}
          aria-hidden={activeTab !== "donations"}
        >
          <DonationSettingsToggle slug={props.slug} settings={props.donationSettings} />
          <DonationAdminFunds
            slug={props.slug}
            communityId={props.communityId}
            funds={props.donationFunds}
            payoutReady={props.payoutReady}
            totalRaised={props.donationTotalRaised}
            bankTabHref={`/communities/${props.slug}/admin?tab=bank`}
          />
        </div>
        <div className={activeTab === "bank" ? undefined : "hidden"} aria-hidden={activeTab !== "bank"}>
          <CommunityAdminBankTab
            communityId={props.communityId}
            slug={props.slug}
            communityName={props.communityName}
            initialStatus={props.payoutStatus}
            initialAccountLabel={props.payoutAccountLabel}
            initialPaymentOwner={props.isPaymentOwner}
          />
        </div>
      </div>
    </div>
  );
}

function formatRequestDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function sortJoinRequestsNewestFirst(list: CommunityJoinRequestRow[]) {
  return [...list].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function AdminRequestsTab({
  slug,
  communityId,
  initialPending,
}: {
  slug: string;
  communityId: string;
  initialPending: CommunityJoinRequestRow[];
}) {
  const [pending, setPending] = useState(() => sortJoinRequestsNewestFirst(initialPending));
  const [rowBusy, setRowBusy] = useState<string | null>(null);

  async function decide(
    row: CommunityJoinRequestRow,
    decision: "active" | "rejected",
  ) {
    setRowBusy(row.id);
    const result = await reviewMembershipRequest(row.id, communityId, slug, decision);
    setRowBusy(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setPending((list) => {
      const next = list.filter((item) => item.id !== row.id);
      patchCommunityAdminCache(slug, { pending: next });
      return next;
    });
    toast.success(result.success ?? (decision === "active" ? "Approved" : "Rejected"));
  }

  return (
    <section>
      <h2 className="sr-only">Pending membership requests</h2>
      {pending.length === 0 ? (
        <Card className="border-border/80 bg-white p-6 text-sm text-muted-foreground shadow-sm">
          No pending requests.
        </Card>
      ) : (
        <ul className="space-y-2">
          {pending.map((row) => {
            const busy = rowBusy === row.id;
            const requested = formatRequestDate(row.createdAt);
            const customMessage = (() => {
              const msg = row.message?.trim();
              if (!msg) return null;
              if (msg.toLowerCase() === "join request") return null;
              return msg;
            })();
            return (
              <li key={row.id}>
                <Card className="flex flex-wrap items-center justify-between gap-3 border-border/80 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={row.avatarUrl}
                      alt={row.fullName}
                      fallback={row.fullName}
                      size="md"
                    />
                    <div>
                      <p className="font-medium">{row.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {requested ? `Requested ${requested}` : "Membership request"}
                        {row.username ? (
                          <span className="text-muted-foreground/80"> · @{row.username}</span>
                        ) : null}
                      </p>
                      {customMessage ? (
                        <p className="mt-1 max-w-md text-xs text-muted-foreground">
                          {customMessage}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" disabled={busy} onClick={() => void decide(row, "active")}>
                      {busy ? "…" : "Approve"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() => void decide(row, "rejected")}
                    >
                      Reject
                    </Button>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function AdminMembersTab({
  slug,
  communityId,
  actorRole,
  initialMembers,
}: {
  slug: string;
  communityId: string;
  actorRole: MembershipRole;
  initialMembers: CommunityMemberRow[];
}) {
  const [members, setMembers] = useState(() => sortMembersByDisplayRole(initialMembers));
  const [rowBusy, setRowBusy] = useState<string | null>(null);

  async function runRow(
    id: string,
    action: () => Promise<{ error?: string; success?: string }>,
    onSuccess?: () => void,
  ) {
    setRowBusy(id);
    const result = await action();
    setRowBusy(null);
    if (result.error) toast.error(result.error);
    else {
      if (result.success) toast.success(result.success);
      onSuccess?.();
    }
  }

  return (
    <section>
      <h2 className="sr-only">Active members</h2>
      {members.length === 0 ? (
        <Card className="border-border/80 bg-white p-6 text-sm text-muted-foreground shadow-sm">
          No active members yet.
        </Card>
      ) : (
        <ul className="space-y-2">
          {members.map((row) => {
            const busy = rowBusy === row.id;
            const displayRole = row.displayRole ?? "member";
            const canManageRole =
              displayRole !== "payment_owner" && displayRole !== "community_owner";
            return (
              <li key={row.id}>
                <Card className="flex flex-wrap items-center justify-between gap-3 border-border/80 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={row.avatarUrl}
                      alt={row.fullName}
                      fallback={row.fullName}
                      size="md"
                    />
                    <div>
                      <p className="font-medium">{row.fullName}</p>
                      <span
                        className={cn(
                          "mt-1 inline-flex rounded-md px-2 py-0.5 text-xs font-semibold",
                          membershipRoleBadgeClass(displayRole),
                        )}
                      >
                        {membershipRoleLabel(displayRole)}
                      </span>
                    </div>
                  </div>
                  {!canManageRole ? null : (
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        className={ADMIN_MEMBER_ROLE_SELECT_CLASS}
                        defaultValue={row.role === "moderator" ? "admin" : row.role}
                        disabled={busy}
                        onChange={(e) =>
                          void runRow(row.id, () =>
                            updateMemberRoleAction(
                              row.id,
                              communityId,
                              slug,
                              e.target.value as MembershipRole,
                            ),
                          )
                        }
                      >
                        {ASSIGNABLE.filter((role) => {
                          if (actorRole === "admin" && role === "admin") return false;
                          return true;
                        }).map((role) => (
                          <option key={role} value={role}>
                            {membershipRoleLabel(role)}
                          </option>
                        ))}
                      </select>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() =>
                          void runRow(row.id, () => removeMemberAction(row.id, communityId, slug), () => {
                            setMembers((list) => {
                              const next = sortMembersByDisplayRole(
                                list.filter((m) => m.id !== row.id),
                              );
                              patchCommunityAdminCache(slug, { members: next });
                              return next;
                            });
                          })
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
