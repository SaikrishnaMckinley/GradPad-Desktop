"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { CommunityMark } from "@/components/layout/CommunityMark";
import { PostDescriptionEditor } from "@/components/posts/PostDescriptionEditor";
import { PostMediaPicker } from "@/components/posts/PostMediaPicker";
import { plainTextFromPostHtml } from "@/lib/posts/rich-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPost } from "@/lib/posts/actions";
import type { SidebarChannel, SidebarCommunity } from "@/types/community";
import { cn } from "@/lib/utils/cn";


const MAX_CONTENT = 1000;

/** Hide scrollbar on mobile dropdown panels while keeping scroll. */
const mobileDropdownScrollHide =
  "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0";

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
  const [communityMenuOpen, setCommunityMenuOpen] = useState(false);
  const [channelMenuOpen, setChannelMenuOpen] = useState(false);

  const communityPickerRef = useRef<HTMLDivElement>(null);
  const channelPickerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    function closeOnOutsidePointer(event: PointerEvent) {
      const t = event.target as Node;
      if (communityPickerRef.current?.contains(t)) return;
      if (channelPickerRef.current?.contains(t)) return;
      setCommunityMenuOpen(false);
      setChannelMenuOpen(false);
    }
    if (!communityMenuOpen && !channelMenuOpen) return;
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [communityMenuOpen, channelMenuOpen]);

  if (memberships.length === 0) {
    return (
      <p className="rounded-lg border border-border bg-page-secondary/80 px-3 py-2.5 text-xs text-muted-foreground md:rounded-xl md:px-4 md:py-3 md:text-sm">
        Join or create a community first, then you can post from here or the home feed.
      </p>
    );
  }

  return (
    <form
      action={formAction}
      className="space-y-3 md:space-y-4"
      onSubmit={() => {
        allowRedirectRef.current = true;
      }}
    >
      {state?.error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-xs text-destructive md:rounded-xl md:px-4 md:py-3 md:text-sm">
          {state.error}
        </p>
      ) : null}

      <input type="hidden" name="communityId" value={communityId} />
      <input type="hidden" name="channelId" value={channelId} />
      <input type="hidden" name="commentAllow" value="true" />

      <div>
        <label className="mb-1 block text-xs font-medium md:mb-1.5 md:text-sm" htmlFor="post-to">
          Post to
        </label>
        <Input
          id="post-to"
          readOnly
          value={postToLabel}
          className="h-10 bg-page-secondary/50 text-xs md:h-11 md:text-sm"
        />
      </div>

      <div>
        <label
          id="post-community-label"
          className="mb-1 block text-xs font-medium md:mb-1.5 md:text-sm"
        >
          Selected community
        </label>

        {/* Mobile: custom list below trigger (native select picker is OS-positioned & tiny on iOS) */}
        <div ref={communityPickerRef} className="relative md:hidden">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={communityMenuOpen}
            aria-labelledby="post-community-label"
            onClick={() => {
              setChannelMenuOpen(false);
              setCommunityMenuOpen((o) => !o);
            }}
            className="flex h-10 w-full items-center gap-2 rounded-lg border border-input-border bg-card py-2 pl-2 pr-2.5 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            {selectedCommunity ? (
              <CommunityMark
                name={selectedCommunity.name}
                initials={selectedCommunity.initials}
                accentColor={selectedCommunity.accentColor}
                logoUrl={selectedCommunity.logoUrl}
                size="sm"
              />
            ) : null}
            <span className="min-w-0 flex-1 truncate font-medium text-foreground">
              {selectedCommunity?.name ?? "Select community"}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                communityMenuOpen && "rotate-180",
              )}
              aria-hidden
            />
          </button>
          {communityMenuOpen ? (
            <ul
              role="listbox"
              className={cn(
                "absolute left-0 right-0 top-full z-[60] mt-1 max-h-60 overflow-y-auto rounded-lg border border-border bg-card py-1 shadow-lg",
                mobileDropdownScrollHide,
              )}
            >
              {memberships.map((m) => {
                const active = m.id === communityId;
                return (
                  <li key={m.id} role="none">
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm",
                        active ? "bg-primary-light font-semibold text-primary" : "text-foreground",
                      )}
                      onClick={() => {
                        setCommunityId(m.id);
                        setChannelId("");
                        setCommunityMenuOpen(false);
                      }}
                    >
                      <CommunityMark
                        name={m.name}
                        initials={m.initials}
                        accentColor={m.accentColor}
                        logoUrl={m.logoUrl}
                        size="sm"
                      />
                      <span className="min-w-0 flex-1 truncate">{m.name}</span>
                      {active ? <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden /> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>

        <div className="relative hidden md:block">
          <select
            id="post-community"
            value={communityId}
            onChange={(e) => {
              setCommunityId(e.target.value);
              setChannelId("");
            }}
            className="h-11 w-full appearance-none rounded-xl border border-input-border bg-card py-2 pl-[3.75rem] pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
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
        <label
          id="post-channel-label"
          className="mb-1 block text-xs font-medium md:mb-1.5 md:text-sm"
        >
          Channel (optional)
        </label>

        <div ref={channelPickerRef} className="relative md:hidden">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={channelMenuOpen}
            aria-labelledby="post-channel-label"
            disabled={channels.length === 0}
            onClick={() => {
              if (channels.length === 0) return;
              setCommunityMenuOpen(false);
              setChannelMenuOpen((o) => !o);
            }}
            className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-input-border bg-card px-2.5 py-2 text-left text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-60"
          >
            <span className="min-w-0 flex-1 truncate font-medium text-foreground">
              {channelId
                ? `#${channels.find((c) => c.id === channelId)?.name ?? "Channel"}`
                : "Post to community feed"}
            </span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
                channelMenuOpen && channels.length > 0 && "rotate-180",
              )}
              aria-hidden
            />
          </button>
          {channelMenuOpen && channels.length > 0 ? (
            <ul
              role="listbox"
              className={cn(
                "absolute left-0 right-0 top-full z-[60] mt-1 max-h-60 overflow-y-auto rounded-lg border border-border bg-card py-1 shadow-lg",
                mobileDropdownScrollHide,
              )}
            >
              <li role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={channelId === ""}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-2 text-left text-xs",
                    channelId === ""
                      ? "bg-primary-light font-semibold text-primary"
                      : "text-foreground",
                  )}
                  onClick={() => {
                    setChannelId("");
                    setChannelMenuOpen(false);
                  }}
                >
                  <span>Post to community feed</span>
                  {channelId === "" ? (
                    <Check className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                  ) : null}
                </button>
              </li>
              {channels.map((ch) => {
                const active = ch.id === channelId;
                return (
                  <li key={ch.id} role="none">
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      className={cn(
                        "flex w-full items-center justify-between px-3 py-2 text-left text-xs",
                        active ? "bg-primary-light font-semibold text-primary" : "text-foreground",
                      )}
                      onClick={() => {
                        setChannelId(ch.id);
                        setChannelMenuOpen(false);
                      }}
                    >
                      <span className="truncate">#{ch.name}</span>
                      {active ? (
                        <Check className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>

        <select
          id="post-channel"
          value={channelId}
          onChange={(e) => setChannelId(e.target.value)}
          disabled={channels.length === 0}
          className="hidden h-11 w-full rounded-xl border border-input-border bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-60 md:block"
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
        <label className="mb-1 block text-xs font-medium md:mb-1.5 md:text-sm" htmlFor="post-title">
          Title
        </label>
        <Input
          id="post-title"
          name="title"
          placeholder="Give your post a title"
          required
          className="h-10 text-xs md:h-11 md:text-sm"
        />
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
        <p className="mb-1 text-xs font-medium md:mb-1.5 md:text-sm">Media</p>
        <PostMediaPicker />
      </div>

      <div className="flex justify-end gap-1.5 pt-1 md:gap-2 md:pt-2">
        <Button
          type="button"
          variant="ghost"
          className="h-9 px-3 text-xs md:h-10 md:px-4 md:text-sm"
          disabled={pending}
          onClick={() => router.push("/home")}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="h-9 px-3 text-xs md:h-10 md:rounded-[11px] md:px-4 md:text-sm"
          disabled={pending || charCount === 0 || charCount > MAX_CONTENT}
        >
          {pending ? "Posting…" : "Post"}
        </Button>
      </div>
    </form>
  );
}
