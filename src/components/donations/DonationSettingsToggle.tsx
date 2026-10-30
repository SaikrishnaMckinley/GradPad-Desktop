"use client";

import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateDonationSettingsAction } from "@/lib/donations/actions";
import type { CommunityDonationSettings } from "@/lib/donations/community-donations";

type Props = {
  slug: string;
  settings: CommunityDonationSettings | null;
};

export function DonationSettingsToggle({ slug, settings }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: string } | null, formData: FormData) => {
      const result = await updateDonationSettingsAction(slug, formData);
      if (result.success) toast.success(result.success);
      if (result.error) toast.error(result.error);
      router.refresh();
      return result;
    },
    null,
  );

  return (
    <form action={formAction} className="rounded-[18px] border border-border bg-card p-5 shadow-card">
      <p className="text-sm font-semibold">Community donations</p>
      <p className="mt-1 text-sm text-muted-foreground">
        When enabled, members see &quot;Make a donation&quot; on the community page (requires at
        least one active fund with a bank account).
      </p>
      <label className="mt-4 flex items-center gap-2 text-sm">
        <input type="checkbox" name="enabled" defaultChecked={settings?.enabled !== false} />
        Enable donations
      </label>
      <div className="mt-3">
        <label htmlFor="donationDescription" className="mb-1 block text-xs font-medium">
          Page description
        </label>
        <textarea
          id="donationDescription"
          name="description"
          defaultValue={settings?.description ?? ""}
          className="min-h-[72px] w-full rounded-xl border border-input-border px-3 py-2 text-sm"
          placeholder="What donations support…"
        />
      </div>
      <label className="mt-3 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="allow_fee_coverage"
          defaultChecked={settings?.allow_fee_coverage !== false}
        />
        Allow donors to cover processing fees
      </label>
      {state?.error ? <p className="mt-2 text-sm text-error">{state.error}</p> : null}
      <Button type="submit" size="sm" className="mt-4" disabled={pending}>
        {pending ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}
