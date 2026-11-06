"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createDonationFundAction } from "@/lib/donations/actions";
import type { PayoutAccountDisplay } from "@/lib/donations/community-donations";
import { cn } from "@/lib/utils/cn";

type Props = {
  slug: string;
  payoutAccounts: PayoutAccountDisplay[];
};

export function DonationFundCreateForm({ slug, payoutAccounts }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: string } | null, formData: FormData) => {
      const result = await createDonationFundAction(slug, formData);
      if (result.success) {
        toast.success(result.success);
        router.push(`/communities/${slug}/admin/donations`);
        router.refresh();
      }
      return result;
    },
    null,
  );

  const fieldLabelClass =
    "mb-1 block text-xs font-medium md:mb-1.5 md:text-sm";
  const selectClass =
    "h-9 w-full rounded-lg border border-input-border bg-card px-2.5 text-xs md:h-10 md:rounded-xl md:px-3 md:text-sm";

  return (
    <form action={formAction} className="mx-auto max-w-2xl space-y-4 md:space-y-6">
      <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-card md:space-y-4 md:rounded-[18px] md:p-6">
        <div>
          <label htmlFor="name" className={fieldLabelClass}>
            Fund name
          </label>
          <Input
            id="name"
            name="name"
            required
            placeholder="e.g. Technology, Scholarships"
            className="h-9 px-3 text-xs md:h-11 md:px-4 md:text-sm"
          />
        </div>
        <div>
          <label htmlFor="description" className={fieldLabelClass}>
            Description
          </label>
          <textarea
            id="description"
            name="description"
            className="min-h-[72px] w-full rounded-lg border border-input-border px-2.5 py-1.5 text-xs md:min-h-[88px] md:rounded-xl md:px-3 md:py-2 md:text-sm"
            placeholder="What this fund supports…"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:gap-4">
          <div>
            <label htmlFor="color" className={fieldLabelClass}>
              Color
            </label>
            <select
              id="color"
              name="color"
              className={selectClass}
              defaultValue="blue"
            >
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="purple">Purple</option>
              <option value="red">Red</option>
              <option value="orange">Orange</option>
              <option value="teal">Teal</option>
            </select>
          </div>
          <div>
            <label htmlFor="icon" className={fieldLabelClass}>
              Icon
            </label>
            <select
              id="icon"
              name="icon"
              className={selectClass}
              defaultValue="general"
            >
              <option value="general">General</option>
              <option value="trophy">Athletics</option>
              <option value="book">Scholarships</option>
              <option value="lightning">Technology</option>
              <option value="heart">Community</option>
              <option value="globe">Global</option>
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="goal_amount" className={fieldLabelClass}>
            Fundraising goal (USD, optional)
          </label>
          <Input
            id="goal_amount"
            name="goal_amount"
            inputMode="numeric"
            placeholder="10000"
            className="h-9 px-3 text-xs md:h-11 md:px-4 md:text-sm"
          />
        </div>
        <div>
          <label htmlFor="payout_account" className={fieldLabelClass}>
            Payout bank account
          </label>
          <select
            id="payout_account"
            name="payout_account"
            required
            className={selectClass}
            defaultValue={payoutAccounts[0]?.id ?? ""}
          >
            {payoutAccounts.length === 0 ? (
              <option value="">No accounts — set up bank account first</option>
            ) : (
              payoutAccounts.map((acct) => (
                <option key={acct.id} value={acct.id}>
                  {acct.label}
                  {acct.last4 ? ` ·••• ${acct.last4}` : ""}
                </option>
              ))
            )}
          </select>
        </div>
        <div className="flex flex-wrap gap-3 text-xs md:gap-4 md:text-sm">
          <label className="flex items-center gap-1.5 md:gap-2">
            <input type="checkbox" name="show_goal_progress" defaultChecked />
            Show goal progress
          </label>
          <label className="flex items-center gap-1.5 md:gap-2">
            <input type="checkbox" name="allow_recurring" />
            Allow recurring donations
          </label>
        </div>
      </div>

      {state?.error ? (
        <p className="text-xs text-error md:text-sm" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end md:gap-3">
        <Link
          href={`/communities/${slug}/admin/donations`}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-9 text-sm md:h-10",
          )}
        >
          Cancel
        </Link>
        <Button
          type="submit"
          disabled={pending || payoutAccounts.length === 0}
          className="h-9 text-sm md:h-10"
        >
          {pending ? "Creating…" : "Create fund"}
        </Button>
      </div>
    </form>
  );
}
