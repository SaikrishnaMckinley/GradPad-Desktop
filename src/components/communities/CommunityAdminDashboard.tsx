"use client";

import Link from "next/link";
import { useLayoutEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CommunityAdminBankTab } from "@/components/communities/CommunityAdminBankTab";
import { DonationAdminFunds } from "@/components/donations/DonationAdminFunds";
import { DonationSettingsToggle } from "@/components/donations/DonationSettingsToggle";
import { ProfileAvatarLink } from "@/components/profile/ProfileAvatarLink";
import { ProfileNameLink } from "@/components/profile/ProfileNameLink";
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
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3 md:gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Admin dashboard</h1>
          <p className="mt-0.5 text-xs text-muted-foreground md:mt-1 md:text-sm">{props.communityName}</p>
        </div>
        <div className="flex flex-wrap items-center gap-0.5 md:gap-1">
          <Link
            href={`/communities/${props.slug}/edit`}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-8 px-2 text-xs font-normal text-muted-foreground hover:text-foreground md:h-9 md:px-3.5 md:text-sm",
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
              "h-8 px-2 text-xs font-normal text-muted-foreground hover:text-foreground md:h-9 md:px-3.5 md:text-sm",
            )}
          >
            View community
          </Link>
        </div>
      </div>

      <nav
        className="flex flex-wrap gap-0.5 rounded-lg border border-border bg-page-secondary/30 p-0.5 md:gap-1 md:rounded-xl md:p-1"
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
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors md:gap-2 md:rounded-lg md:px-3.5 md:py-2 md:text-sm",
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
                    "min-w-[1.125rem] rounded-full px-1 py-0.5 text-center text-[10px] font-semibold md:min-w-[1.25rem] md:px-1.5 md:text-xs",
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

      <div className="min-h-[200px] md:min-h-[240px]">
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
        <Card className="border-border/80 bg-white p-4 text-xs text-muted-foreground shadow-sm md:p-6 md:text-sm">
          No pending requests.
        </Card>
      ) : (
        <ul className="space-y-1.5 md:space-y-2">
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
                <Card
                  className={cn(
                    "flex items-center justify-between gap-2 border-border/80 bg-white p-3 shadow-sm",
                    "max-md:flex-nowrap max-md:gap-2",
                    "md:flex-wrap md:gap-3 md:p-4",
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2 md:min-w-0 md:flex-none md:gap-3">
                    <ProfileAvatarLink
                      userId={row.userId}
                      src={row.avatarUrl}
                      alt={row.fullName}
                      fallback={row.fullName}
                      size="sm"
                      className="shrink-0 md:!h-10 md:!w-10 md:!text-sm"
                    />
                    <div className="min-w-0 flex-1">
                      <ProfileNameLink
                        userId={row.userId}
                        className="block truncate text-sm font-medium max-md:whitespace-nowrap md:text-base md:whitespace-normal md:break-words"
                      >
                        {row.fullName}
                      </ProfileNameLink>
                      <p
                        className={cn(
                          "text-[11px] text-muted-foreground md:text-xs",
                          "max-md:truncate max-md:whitespace-nowrap",
                          "md:overflow-visible md:whitespace-normal",
                        )}
                      >
                        {requested ? `Requested ${requested}` : "Membership request"}
                        {row.username ? (
                          <span className="text-muted-foreground/80"> · @{row.username}</span>
                        ) : null}
                      </p>
                      {customMessage ? (
                        <p
                          className={cn(
                            "mt-0.5 max-w-md text-[11px] text-muted-foreground md:mt-1 md:text-xs",
                            "max-md:truncate max-md:whitespace-nowrap",
                            "md:whitespace-normal",
                          )}
                        >
                          {customMessage}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1.5 md:gap-2">
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() => void decide(row, "active")}
                      className="h-8 shrink-0 px-2.5 text-xs md:h-9 md:px-3.5 md:text-sm"
                    >
                      {busy ? "…" : "Approve"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() => void decide(row, "rejected")}
                      className="h-8 shrink-0 px-2.5 text-xs md:h-9 md:px-3.5 md:text-sm"
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
        <Card className="border-border/80 bg-white p-4 text-xs text-muted-foreground shadow-sm md:p-6 md:text-sm">
          No active members yet.
        </Card>
      ) : (
        <ul className="space-y-1.5 md:space-y-2">
          {members.map((row) => {
            const busy = rowBusy === row.id;
            const displayRole = row.displayRole ?? "member";
            const canManageRole =
              displayRole !== "payment_owner" && displayRole !== "community_owner";
            return (
              <li key={row.id}>
                <Card
                  className={cn(
                    "flex items-center justify-between gap-2 border-border/80 bg-white p-3 shadow-sm",
                    "max-md:flex-nowrap max-md:gap-2",
                    "md:flex-wrap md:gap-3 md:p-4",
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2 md:min-w-0 md:flex-none md:gap-3">
                    <ProfileAvatarLink
                      userId={row.userId}
                      src={row.avatarUrl}
                      alt={row.fullName}
                      fallback={row.fullName}
                      size="sm"
                      className="shrink-0 md:!h-10 md:!w-10 md:!text-sm"
                    />
                    <div className="min-w-0 flex-1 md:min-w-0 md:flex-none">
                      <ProfileNameLink
                        userId={row.userId}
                        className="block truncate text-sm font-medium max-md:whitespace-nowrap md:text-base md:whitespace-normal md:break-words"
                      >
                        {row.fullName}
                      </ProfileNameLink>
                      <span
                        className={cn(
                          "mt-0.5 inline-flex max-w-full rounded-md px-1.5 py-0.5 text-[10px] font-semibold md:mt-1 md:px-2 md:text-xs",
                          "max-md:truncate max-md:whitespace-nowrap",
                          membershipRoleBadgeClass(displayRole),
                        )}
                      >
                        {membershipRoleLabel(displayRole)}
                      </span>
                    </div>
                  </div>
                  {!canManageRole ? null : (
                    <div className="flex shrink-0 flex-nowrap items-center gap-1.5 md:flex-wrap md:gap-2">
                      <select
                        className={cn(
                          ADMIN_MEMBER_ROLE_SELECT_CLASS,
                          "h-8 w-28 min-w-0 shrink-0 text-xs md:h-9 md:w-auto md:min-w-[9.5rem] md:text-sm",
                        )}
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
                        className="h-8 shrink-0 px-2.5 text-xs md:h-9 md:px-3.5 md:text-sm"
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
