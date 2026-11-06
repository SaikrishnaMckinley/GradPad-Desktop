"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { CommunityFormBranding } from "@/components/communities/CommunityFormBranding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { slugifyCommunityName } from "@/lib/communities/slug";
import type { ActionResult } from "@/lib/communities/actions";
import type { CommunityFormValues } from "@/lib/validations/community";

type BrandingInitial = {
  logoUrl?: string | null;
  coverImageUrl?: string | null;
};

type Props = {
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  submitLabel: string;
  initial: CommunityFormValues;
  branding?: BrandingInitial;
  slugHint?: string;
};

export function CommunityForm({
  action,
  submitLabel,
  initial,
  branding,
  slugHint,
}: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, null);
  const allowRedirectRef = useRef(false);
  const [name, setName] = useState(initial.name);

  useEffect(() => {
    if (!allowRedirectRef.current || !state?.redirectTo) return;
    allowRedirectRef.current = false;
    if (state.refreshShell && typeof window !== "undefined") {
      window.dispatchEvent(new Event("gradpad:refresh-shell"));
    }
    router.push(state.redirectTo);
    router.refresh();
  }, [state?.redirectTo, state?.refreshShell, router]);
  const [slug, setSlug] = useState(initial.slug);
  const [location, setLocation] = useState(initial.location ?? "");

  return (
    <form
      action={formAction}
      className="space-y-4 md:space-y-6"
      onSubmit={() => {
        allowRedirectRef.current = true;
      }}
    >
      <CommunityFormBranding
        name={name}
        location={location}
        slug={slug}
        logoUrl={branding?.logoUrl}
        coverImageUrl={branding?.coverImageUrl}
      />

      {state?.error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-xs text-destructive md:rounded-xl md:px-4 md:py-3 md:text-sm">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="rounded-lg border border-primary-border bg-primary-light/60 px-3 py-2.5 text-xs text-primary md:rounded-xl md:px-4 md:py-3 md:text-sm">
          {state.success}
        </p>
      ) : null}

      <div className="space-y-3 md:space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium md:mb-1.5 md:text-sm" htmlFor="name">
            Community name
          </label>
          <Input
            id="name"
            name="name"
            value={name}
            className="h-10 text-xs md:h-11 md:text-sm"
            onChange={(e) => {
              setName(e.target.value);
              if (!initial.name) {
                setSlug(slugifyCommunityName(e.target.value || "community"));
              }
            }}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium md:mb-1.5 md:text-sm" htmlFor="slug">
            URL slug
          </label>
          <Input
            id="slug"
            name="slug"
            value={slug}
            className="h-10 text-xs md:h-11 md:text-sm"
            onChange={(e) => setSlug(e.target.value)}
            required
          />
          <p className="mt-1 text-[11px] text-muted-foreground md:text-xs">
            {slugHint ?? `gradpad.com/communities/${slug || "your-slug"}`}
          </p>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium md:mb-1.5 md:text-sm" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={initial.description ?? ""}
            className="min-h-[96px] w-full rounded-lg border border-input-border bg-card px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 md:min-h-[120px] md:rounded-xl md:px-4 md:py-3 md:text-sm"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium md:mb-1.5 md:text-sm" htmlFor="institution">
              Institution
            </label>
            <Input
              id="institution"
              name="institution"
              defaultValue={initial.institution ?? ""}
              className="h-10 text-xs md:h-11 md:text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium md:mb-1.5 md:text-sm" htmlFor="location">
              Location
            </label>
            <Input
              id="location"
              name="location"
              value={location}
              className="h-10 text-xs md:h-11 md:text-sm"
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium md:mb-1.5 md:text-sm" htmlFor="visibility">
              Visibility
            </label>
            <select
              id="visibility"
              name="visibility"
              defaultValue={initial.visibility}
              className="h-10 w-full rounded-lg border border-input-border bg-card px-2.5 text-xs md:h-11 md:rounded-xl md:px-3 md:text-sm"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-1.5 text-xs md:gap-2 md:text-sm">
              <input
                type="checkbox"
                name="joinApprovalRequired"
                defaultChecked={initial.joinApprovalRequired}
                className="h-3.5 w-3.5 rounded border-input-border md:h-4 md:w-4"
              />
              Require approval to join
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-1 md:pt-2">
        <Button
          type="submit"
          className="h-9 px-4 text-xs md:h-10 md:px-4 md:text-sm"
          disabled={pending}
        >
          {pending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
