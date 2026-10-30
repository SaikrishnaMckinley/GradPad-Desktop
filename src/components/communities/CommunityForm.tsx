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
      className="space-y-6"
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
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="rounded-xl border border-primary-border bg-primary-light/60 px-4 py-3 text-sm text-primary">
          {state.success}
        </p>
      ) : null}

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="name">
            Community name
          </label>
          <Input
            id="name"
            name="name"
            value={name}
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
          <label className="mb-1.5 block text-sm font-medium" htmlFor="slug">
            URL slug
          </label>
          <Input
            id="slug"
            name="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {slugHint ?? `gradpad.com/communities/${slug || "your-slug"}`}
          </p>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={initial.description ?? ""}
            className="min-h-[120px] w-full rounded-xl border border-input-border bg-card px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="institution">
              Institution
            </label>
            <Input id="institution" name="institution" defaultValue={initial.institution ?? ""} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="location">
              Location
            </label>
            <Input
              id="location"
              name="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="visibility">
              Visibility
            </label>
            <select
              id="visibility"
              name="visibility"
              defaultValue={initial.visibility}
              className="h-11 w-full rounded-xl border border-input-border bg-card px-3 text-sm"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="joinApprovalRequired"
                defaultChecked={initial.joinApprovalRequired}
                className="h-4 w-4 rounded border-input-border"
              />
              Require approval to join
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
