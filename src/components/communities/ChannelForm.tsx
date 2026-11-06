"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { CommunityFormBranding } from "@/components/communities/CommunityFormBranding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ActionResult } from "@/lib/communities/actions";
import { slugifyCommunityName } from "@/lib/communities/slug";
import type { SidebarCommunity } from "@/types/community";

type Props = {
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  memberships: SidebarCommunity[];
  defaultCommunityId: string | null;
  defaultCommunityRouteKey: string | null;
};

export function ChannelForm({
  action,
  memberships,
  defaultCommunityId,
  defaultCommunityRouteKey,
}: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, null);
  const allowRedirectRef = useRef(false);

  const initialCommunity = useMemo(() => {
    if (defaultCommunityId && memberships.some((m) => m.id === defaultCommunityId)) {
      const m = memberships.find((c) => c.id === defaultCommunityId)!;
      return { id: m.id, routeKey: defaultCommunityRouteKey ?? m.slug ?? m.id };
    }
    const first = memberships[0];
    if (!first) return { id: "", routeKey: "" };
    return { id: first.id, routeKey: first.slug ?? first.id };
  }, [defaultCommunityId, defaultCommunityRouteKey, memberships]);

  const [communityId, setCommunityId] = useState(initialCommunity.id);
  const [communityRouteKey, setCommunityRouteKey] = useState(initialCommunity.routeKey);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!allowRedirectRef.current || !state?.redirectTo) return;
    allowRedirectRef.current = false;
    if (state.refreshShell && typeof window !== "undefined") {
      window.dispatchEvent(new Event("gradpad:refresh-shell"));
    }
    router.push(state.redirectTo);
    router.refresh();
  }, [state?.redirectTo, state?.refreshShell, router]);

  function onCommunityChange(nextId: string) {
    setCommunityId(nextId);
    const m = memberships.find((c) => c.id === nextId);
    setCommunityRouteKey(m?.slug ?? m?.id ?? nextId);
  }

  if (memberships.length === 0) {
    return (
      <p className="rounded-lg border border-border bg-page-secondary/80 px-3 py-2.5 text-xs text-muted-foreground md:rounded-xl md:px-4 md:py-3 md:text-sm">
        Join or create a community first, then you can add channels for members to discuss topics.
      </p>
    );
  }

  const slugPreview = slugifyCommunityName(name || "channel");

  return (
    <form
      action={formAction}
      className="space-y-4 md:space-y-6"
      onSubmit={() => {
        allowRedirectRef.current = true;
      }}
    >
      <CommunityFormBranding
        name={name.trim() || "Channel name"}
        location=""
        slug={slugPreview}
      />

      {state?.error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-xs text-destructive md:rounded-xl md:px-4 md:py-3 md:text-sm">
          {state.error}
        </p>
      ) : null}

      <input type="hidden" name="communityId" value={communityId} />
      <input type="hidden" name="communityRouteKey" value={communityRouteKey} />

      <div className="space-y-3 md:space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium md:mb-1.5 md:text-sm" htmlFor="communityId">
            Community
          </label>
          <select
            id="communityId"
            value={communityId}
            onChange={(e) => onCommunityChange(e.target.value)}
            className="h-10 w-full rounded-lg border border-input-border bg-card px-2.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 md:h-11 md:rounded-xl md:px-3 md:text-sm"
          >
            {memberships.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium md:mb-1.5 md:text-sm" htmlFor="channel-name">
            Channel name
          </label>
          <Input
            id="channel-name"
            name="name"
            value={name}
            className="h-10 text-xs md:h-11 md:text-sm"
            onChange={(e) => setName(e.target.value)}
            placeholder="General, Career advice, …"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium md:mb-1.5 md:text-sm" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[96px] w-full rounded-lg border border-input-border bg-card px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 md:min-h-[120px] md:rounded-xl md:px-4 md:py-3 md:text-sm"
            placeholder="What will members talk about in this channel?"
            required
            minLength={25}
          />
          <p className="mt-1 text-[11px] text-muted-foreground md:text-xs">
            At least 25 characters (same as web).
          </p>
        </div>

        <div>
          <span className="mb-1 block text-xs font-medium md:mb-1.5 md:text-sm">Visibility</span>
          <div className="flex flex-wrap gap-3 text-xs md:gap-4 md:text-sm">
            <label className="flex items-center gap-1.5 md:gap-2">
              <input
                type="radio"
                name="visibility"
                value="public"
                defaultChecked
                className="h-3.5 w-3.5 md:h-4 md:w-4"
              />
              Public
            </label>
            <label className="flex items-center gap-1.5 md:gap-2">
              <input type="radio" name="visibility" value="private" className="h-3.5 w-3.5 md:h-4 md:w-4" />
              Private
            </label>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium md:mb-1.5 md:text-sm" htmlFor="passcode">
            Passcode (optional)
          </label>
          <Input
            id="passcode"
            name="passcode"
            type="text"
            autoComplete="off"
            placeholder="For private channels"
            className="h-10 text-xs md:h-11 md:text-sm"
          />
        </div>

        <p className="text-[11px] leading-relaxed text-muted-foreground md:text-xs md:leading-normal">
          Channel logo is required on staging. Use the camera on the preview card above.
        </p>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          className="h-9 px-4 text-xs md:h-10 md:text-sm"
          disabled={pending}
        >
          {pending ? "Creating…" : "Create channel"}
        </Button>
      </div>
    </form>
  );
}
