"use client";

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
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: string } | null, formData: FormData) => {
      const result = await updateDonationSettingsAction(slug, formData);
      if (result.success) toast.success(result.success);
      if (result.error) toast.error(result.error);
      return result;
    },
    null,
  );

  return (
    <form
      action={formAction}
      className="rounded-xl border border-border bg-card p-4 shadow-card md:rounded-[18px] md:p-5"
    >
      <p className="text-sm font-semibold">Community donations</p>
      <p className="mt-1 text-xs text-muted-foreground md:text-sm">
        When enabled, members see &quot;Make a donation&quot; on the community page (requires at
        least one active fund with a bank account).
      </p>
      <label className="mt-3 flex items-center gap-2 text-xs md:mt-4 md:text-sm">
        <input type="checkbox" name="enabled" defaultChecked={settings?.enabled !== false} />
        Enable donations
      </label>
      <div className="mt-2 md:mt-3">
        <label htmlFor="donationDescription" className="mb-1 block text-[11px] font-medium md:text-xs">
          Page description
        </label>
        <textarea
          id="donationDescription"
          name="description"
          defaultValue={settings?.description ?? ""}
          className="min-h-[60px] w-full rounded-lg border border-input-border px-2.5 py-1.5 text-xs md:min-h-[72px] md:rounded-xl md:px-3 md:py-2 md:text-sm"
          placeholder="What donations support…"
        />
      </div>
      <label className="mt-2 flex items-center gap-2 text-xs md:mt-3 md:text-sm">
        <input
          type="checkbox"
          name="allow_fee_coverage"
          defaultChecked={settings?.allow_fee_coverage !== false}
        />
        Allow donors to cover processing fees
      </label>
      {state?.error ? (
        <p className="mt-2 text-xs text-error md:text-sm">{state.error}</p>
      ) : null}
      <Button
        type="submit"
        size="sm"
        className="mt-3 h-8 text-xs md:mt-4 md:h-9 md:text-sm"
        disabled={pending}
      >
        {pending ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}
