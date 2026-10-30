"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { CommunityMark } from "@/components/layout/CommunityMark";
import { PostDescriptionEditor } from "@/components/posts/PostDescriptionEditor";
import { PostMediaPicker } from "@/components/posts/PostMediaPicker";
import { plainTextFromPostHtml } from "@/lib/posts/rich-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ActionResult } from "@/lib/communities/actions";
import { createPost } from "@/lib/posts/actions";
import type { SidebarChannel, SidebarCommunity } from "@/types/community";

const MAX_CONTENT = 1000;

type Props = {
  memberships: SidebarCommunity[];
  channelsByCommunityId: Record<string, SidebarChannel[]>;
  defaultCommunityId: string | null;
  defaultChannelId: string | null;
};

export function PostCreateForm({
  memberships,
  channelsByCommunityId,
  defaultCommunityId,
  defaultChannelId,
}: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createPost, null);
  const allowRedirectRef = useRef(false);

  const initialCommunity = useMemo(() => {
    if (defaultCommunityId && memberships.some((m) => m.id === defaultCommunityId)) {
      return defaultCommunityId;
    }
    return memberships[0]?.id ?? "";
  }, [defaultCommunityId, memberships]);

  const [communityId, setCommunityId] = useState(initialCommunity);
  const [channelId, setChannelId] = useState(defaultChannelId ?? "");
  const [content, setContent] = useState("");

  const selectedCommunity = memberships.find((m) => m.id === communityId) ?? null;
  const channels = channelsByCommunityId[communityId] ?? [];
  const postToLabel = channelId ? "Channel" : "Community";
  const charCount = plainTextFromPostHtml(content).length;

  useEffect(() => {
    setCommunityId(initialCommunity);
  }, [initialCommunity]);

  useEffect(() => {
    if (defaultChannelId && channels.some((c) => c.id === defaultChannelId)) {
      setChannelId(defaultChannelId);
    }
  }, [defaultChannelId, channels]);

  useEffect(() => {
    if (!allowRedirectRef.current || !state?.redirectTo) return;
    allowRedirectRef.current = false;
    router.push(state.redirectTo);
    router.refresh();
  }, [state?.redirectTo, router]);

  useEffect(() => {
    window.dispatchEvent(new Event("gradpad:refresh-shell"));
  }, []);

  if (memberships.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-page-secondary/80 px-4 py-3 text-sm text-muted-foreground">
        Join or create a community first, then you can post from here or the home feed.
      </p>
    );
  }

  return (
    <form
      action={formAction}
      className="space-y-4"
      onSubmit={() => {
        allowRedirectRef.current = true;
      }}
    >
      {state?.error ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <input type="hidden" name="communityId" value={communityId} />
      <input type="hidden" name="channelId" value={channelId} />
      <input type="hidden" name="commentAllow" value="true" />

      <div>
        <label className="mb-1.5 block text-sm font-medium" htmlFor="post-to">
          Post to
        </label>
        <Input id="post-to" readOnly value={postToLabel} className="bg-page-secondary/50" />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium" htmlFor="post-community">
          Selected community
        </label>
        <div className="relative">
          <select
            id="post-community"
            value={communityId}
            onChange={(e) => {
              setCommunityId(e.target.value);
              setChannelId("");
            }}
            className="h-11 w-full appearance-none rounded-xl border border-input-border bg-card py-2 pl-11 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            {memberships.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          {selectedCommunity ? (
            <div className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2">
              <CommunityMark
                name={selectedCommunity.name}
                initials={selectedCommunity.initials}
                accentColor={selectedCommunity.accentColor}
                logoUrl={selectedCommunity.logoUrl}
                size="sm"
              />
            </div>
          ) : null}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium" htmlFor="post-channel">
          Channel (optional)
        </label>
        <select
          id="post-channel"
          value={channelId}
          onChange={(e) => setChannelId(e.target.value)}
          disabled={channels.length === 0}
          className="h-11 w-full rounded-xl border border-input-border bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-60"
        >
          <option value="">Post to community feed</option>
          {channels.map((ch) => (
            <option key={ch.id} value={ch.id}>
              #{ch.name}
            </option>
          ))}
        </select>
        {channels.length === 0 ? (
          <p className="mt-1 text-xs text-muted-foreground">
            Open a community hub once to load its channels, or create a channel first.
          </p>
        ) : null}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium" htmlFor="post-title">
          Title
        </label>
        <Input id="post-title" name="title" placeholder="Give your post a title" required />
      </div>

      <PostDescriptionEditor
        id="post-content"
        name="content"
        label="Description"
        value={content}
        onChange={setContent}
        maxPlainLength={MAX_CONTENT}
        placeholder="Share your thoughts"
        required
      />

      <div>
        <p className="mb-1.5 text-sm font-medium">Media</p>
        <PostMediaPicker />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" disabled={pending} onClick={() => router.push("/home")}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending || charCount === 0 || charCount > MAX_CONTENT}>
          {pending ? "Posting…" : "Post"}
        </Button>
      </div>
    </form>
  );
}
