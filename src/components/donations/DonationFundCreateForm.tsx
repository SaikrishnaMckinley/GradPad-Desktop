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

  return (
    <form action={formAction} className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-4 rounded-[18px] border border-border bg-card p-6 shadow-card">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
            Fund name
          </label>
          <Input id="name" name="name" required placeholder="e.g. Technology, Scholarships" />
        </div>
        <div>
          <label htmlFor="description" className="mb-1.5 block text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            className="min-h-[88px] w-full rounded-xl border border-input-border px-3 py-2 text-sm"
            placeholder="What this fund supports…"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="color" className="mb-1.5 block text-sm font-medium">
              Color
            </label>
            <select
              id="color"
              name="color"
              className="h-10 w-full rounded-xl border border-input-border bg-card px-3 text-sm"
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
            <label htmlFor="icon" className="mb-1.5 block text-sm font-medium">
              Icon
            </label>
            <select
              id="icon"
              name="icon"
              className="h-10 w-full rounded-xl border border-input-border bg-card px-3 text-sm"
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
          <label htmlFor="goal_amount" className="mb-1.5 block text-sm font-medium">
            Fundraising goal (USD, optional)
          </label>
          <Input id="goal_amount" name="goal_amount" inputMode="numeric" placeholder="10000" />
        </div>
        <div>
          <label htmlFor="payout_account" className="mb-1.5 block text-sm font-medium">
            Payout bank account
          </label>
          <select
            id="payout_account"
            name="payout_account"
            required
            className="h-10 w-full rounded-xl border border-input-border bg-card px-3 text-sm"
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
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="show_goal_progress" defaultChecked />
            Show goal progress
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="allow_recurring" />
            Allow recurring donations
          </label>
        </div>
      </div>

      {state?.error ? (
        <p className="text-sm text-error" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href={`/communities/${slug}/admin/donations`}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Cancel
        </Link>
        <Button type="submit" disabled={pending || payoutAccounts.length === 0}>
          {pending ? "Creating…" : "Create fund"}
        </Button>
      </div>
    </form>
  );
}
