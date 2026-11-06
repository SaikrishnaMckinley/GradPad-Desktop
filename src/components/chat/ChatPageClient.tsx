"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Info, Loader2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { ChatGroupDetailsPanel } from "@/components/chat/ChatGroupDetailsPanel";
import { ChatNewMessageDialog } from "@/components/chat/ChatNewMessageDialog";
import { useShellData } from "@/components/layout/ShellDataProvider";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  readInboxCache,
  readThreadCache,
  writeInboxCache,
  writeThreadCache,
} from "@/lib/chat/chat-inbox-cache";
import {
  getDateSeparatorText,
  shouldShowDateSeparator,
} from "@/lib/chat/chat-date";
import { formatChatTimeAgo } from "@/lib/chat/time-ago";
import type {
  ChatConversation,
  ChatMemberOption,
  ChatMessage,
} from "@/lib/chat/types";
import { cn } from "@/lib/utils/cn";

const POLL_MS = 5000;

const hiddenScrollClass =
  "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

type InboxFilter = "all" | "unread" | "groups";

type Props = {
  initialConversations?: ChatConversation[];
};

function roleLabel(conversation: ChatConversation): string {
  if (conversation.type === "group") return "Group";
  if (conversation.memberStatus === "owner") return "Community owner";
  if (conversation.memberStatus === "admin") return "Community admin";
  return "Community member";
}

function formatMessageTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function matchesChatSearch(
  query: string,
  candidate: { name: string; email?: string; lastMessage?: string | null },
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    candidate.name.toLowerCase().includes(q) ||
    (candidate.lastMessage?.toLowerCase().includes(q) ?? false) ||
    (candidate.email?.toLowerCase().includes(q) ?? false)
  );
}

function mergeConversationsWithActiveUnreadZero(
  list: ChatConversation[],
  activeThreadId: string | null,
): ChatConversation[] {
  if (!activeThreadId) return list;
  return list.map((c) => (c.id === activeThreadId ? { ...c, unreadCount: 0 } : c));
}

function placeholderConversation(
  threadId: string,
  type: "user" | "group",
): ChatConversation {
  return {
    id: threadId,
    name: type === "group" ? "Group" : "Direct message",
    type,
    lastMessage: null,
    lastAt: new Date().toISOString(),
    unreadCount: 0,
  };
}

export function ChatPageClient({ initialConversations = [] }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { shellUser, communityContext } = useShellData();

  const threadFromUrl = searchParams.get("thread")?.trim() ?? null;
  const typeFromUrl =
    searchParams.get("type") === "group" ? ("group" as const) : ("user" as const);

  const [conversations, setConversations] = useState(initialConversations);
  const [inboxLoading, setInboxLoading] = useState(initialConversations.length === 0);
  const [inboxFilter, setInboxFilter] = useState<InboxFilter>("all");
  const [search, setSearch] = useState("");
  const [searchMembers, setSearchMembers] = useState<ChatMemberOption[]>([]);
  const [searchMembersLoaded, setSearchMembersLoaded] = useState(false);
  const [mobileShowThread, setMobileShowThread] = useState(Boolean(threadFromUrl));
  const [newMessageOpen, setNewMessageOpen] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);

  const [activeId, setActiveId] = useState<string | null>(threadFromUrl);
  const [activeType, setActiveType] = useState<"user" | "group">(typeFromUrl);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const [groupDetailsOpen, setGroupDetailsOpen] = useState(false);
  const threadBottomRef = useRef<HTMLDivElement>(null);
  const threadFetchRef = useRef<AbortController | null>(null);
  const conversationsRef = useRef(conversations);
  const activeIdRef = useRef(activeId);
  conversationsRef.current = conversations;
  activeIdRef.current = activeId;

  useLayoutEffect(() => {
    if (initialConversations.length > 0) return;
    const cached = readInboxCache();
    if (cached?.length) {
      setConversations(cached);
      setInboxLoading(false);
    }
  }, [initialConversations.length]);

  function applyThreadCache(threadId: string, type: "user" | "group") {
    const cached = readThreadCache(threadId, type);
    setMessages(cached?.messages ?? []);
    setLoadingThread(!cached?.messages.length);
    if (cached?.conversation) {
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === cached.conversation!.id);
        if (idx === -1) return [cached.conversation!, ...prev];
        const next = [...prev];
        next[idx] = { ...next[idx], ...cached.conversation! };
        return next;
      });
    }
  }

  const activeCommunity = communityContext.activeCommunity;
  const communityId = activeCommunity?.id ?? null;
  const communitySlug = communityContext.activeSlug ?? activeCommunity?.slug ?? null;

  const activeConversation = useMemo(() => {
    if (!activeId) return null;
    return conversations.find((c) => c.id === activeId) ?? placeholderConversation(activeId, activeType);
  }, [conversations, activeId, activeType]);

  const markThreadSeen = useCallback(async (threadId: string, type: "user" | "group") => {
    const path =
      type === "group"
        ? `/api/chat/group/${encodeURIComponent(threadId)}/seen`
        : `/api/chat/thread/${encodeURIComponent(threadId)}/seen`;
    await fetch(path, { method: "POST", credentials: "include" });
    setConversations((prev) =>
      prev.map((c) => (c.id === threadId ? { ...c, unreadCount: 0 } : c)),
    );
  }, []);

  const refreshConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/conversations", { credentials: "include" });
      if (!res.ok) return;
      const body = (await res.json()) as { conversations?: ChatConversation[] };
      if (Array.isArray(body.conversations)) {
        const merged = mergeConversationsWithActiveUnreadZero(
          body.conversations,
          activeIdRef.current,
        );
        setConversations(merged);
        writeInboxCache(merged);
      }
    } catch {
      /* ignore background poll errors */
    }
  }, []);

  const loadThread = useCallback(
    async (
      threadId: string,
      type: "user" | "group",
      background = false,
      signal?: AbortSignal,
    ) => {
      try {
        const fallback = conversationsRef.current.find((c) => c.id === threadId) ?? null;
        const qs = new URLSearchParams({
          threadId,
          type,
        });
        if (fallback) {
          qs.set(
            "fallback",
            JSON.stringify({
              id: fallback.id,
              name: fallback.name,
              email: fallback.email,
              type: fallback.type,
              image: fallback.image,
              last_message: fallback.lastMessage,
              last_at: fallback.lastAt,
              unread_count: fallback.unreadCount,
            }),
          );
        }
        const res = await fetch(`/api/chat/thread?${qs.toString()}`, {
          credentials: "include",
          signal,
        });
        if (signal?.aborted) return;
        if (!res.ok) {
          if (!background) toast.error("Could not load messages.");
          return;
        }
        const body = (await res.json()) as {
          messages?: ChatMessage[];
          conversation?: ChatConversation | null;
          type?: "user" | "group";
        };
        if (signal?.aborted || activeIdRef.current !== threadId) return;

        if (Array.isArray(body.messages)) {
          setMessages(body.messages);
        }
        if (body.type === "group" || body.type === "user") {
          setActiveType(body.type);
        }
        if (body.conversation) {
          setConversations((prev) => {
            const idx = prev.findIndex((c) => c.id === body.conversation!.id);
            if (idx === -1) return [body.conversation!, ...prev];
            const next = [...prev];
            next[idx] = { ...next[idx], ...body.conversation! };
            return next;
          });
        }
        const conv =
          body.conversation ??
          conversationsRef.current.find((c) => c.id === threadId) ??
          null;
        if (Array.isArray(body.messages)) {
          writeThreadCache(threadId, type, body.messages, conv);
        }
        if (!background) {
          void markThreadSeen(threadId, type);
        } else if (activeIdRef.current === threadId) {
          const unread =
            conversationsRef.current.find((c) => c.id === threadId)?.unreadCount ?? 0;
          if (unread > 0) {
            void markThreadSeen(threadId, type);
          }
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        throw err;
      } finally {
        if (!background && !signal?.aborted && activeIdRef.current === threadId) {
          setLoadingThread(false);
        }
      }
    },
    [markThreadSeen],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (conversationsRef.current.length === 0) setInboxLoading(true);
      await refreshConversations();
      if (!cancelled) setInboxLoading(false);
    })();
    const id = window.setInterval(() => void refreshConversations(), POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [refreshConversations]);

  useLayoutEffect(() => {
    if (!activeId) {
      setMessages([]);
      setLoadingThread(false);
      return;
    }
    applyThreadCache(activeId, activeType);
    setDraft("");
  }, [activeId, activeType]);

  useEffect(() => {
    if (!activeId) return;

    threadFetchRef.current?.abort();
    const controller = new AbortController();
    threadFetchRef.current = controller;

    void loadThread(activeId, activeType, false, controller.signal);

    const pollId = window.setInterval(
      () => void loadThread(activeId, activeType, true),
      POLL_MS,
    );
    return () => {
      controller.abort();
      window.clearInterval(pollId);
    };
  }, [activeId, activeType, loadThread]);

  useEffect(() => {
    threadBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeId]);

  useEffect(() => {
    if (threadFromUrl) {
      setActiveId(threadFromUrl);
      setActiveType(typeFromUrl);
      setMobileShowThread(true);
    }
  }, [threadFromUrl, typeFromUrl]);

  useEffect(() => {
    setGroupDetailsOpen(false);
  }, [activeId]);

  useEffect(() => {
    setSearchMembers([]);
    setSearchMembersLoaded(false);
  }, [communityId]);

  useEffect(() => {
    if (!communityId || searchMembersLoaded) return;
    if (!search.trim()) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/chat/members?communityId=${encodeURIComponent(communityId)}`,
          { credentials: "include" },
        );
        const body = (await res.json()) as { members?: ChatMemberOption[] };
        if (!cancelled) {
          setSearchMembers(Array.isArray(body.members) ? body.members : []);
          setSearchMembersLoaded(true);
        }
      } catch {
        if (!cancelled) {
          setSearchMembers([]);
          setSearchMembersLoaded(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [communityId, search, searchMembersLoaded]);

  function openThread(conversation: ChatConversation) {
    setGroupDetailsOpen(false);
    threadFetchRef.current?.abort();
    applyThreadCache(conversation.id, conversation.type);
    setDraft("");
    setActiveId(conversation.id);
    setActiveType(conversation.type);
    setMobileShowThread(true);
    setConversations((prev) =>
      prev.map((c) => (c.id === conversation.id ? { ...c, unreadCount: 0 } : c)),
    );
    const qs = new URLSearchParams({ thread: conversation.id, type: conversation.type });
    router.replace(`/chat?${qs.toString()}`, { scroll: false });
  }

  const filteredConversations = useMemo(() => {
    let list = conversations;
    if (inboxFilter === "unread") {
      list = list.filter((c) => c.unreadCount > 0);
    } else if (inboxFilter === "groups") {
      list = list.filter((c) => c.type === "group");
    }
    if (search.trim()) {
      list = list.filter((c) =>
        matchesChatSearch(search, {
          name: c.name,
          email: c.email,
          lastMessage: c.lastMessage,
        }),
      );
    }
    return [...list].sort(
      (a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime(),
    );
  }, [conversations, inboxFilter, search]);

  const filteredMemberResults = useMemo(() => {
    if (!search.trim()) return [];
    const existingUserIds = new Set(
      conversations.filter((c) => c.type === "user").map((c) => c.id),
    );
    return searchMembers
      .filter((member) => member.id !== shellUser.id)
      .filter((member) => !existingUserIds.has(member.id))
      .filter((member) =>
        matchesChatSearch(search, {
          name: member.name,
          email: member.email,
        }),
      )
      .slice(0, 8);
  }, [conversations, searchMembers, search, shellUser.id]);

  async function sendMessage() {
    const text = draft.trim();
    if (!text || !activeId || !shellUser.id) return;
    if (activeConversation?.isBlocked) {
      toast.error("You cannot message this conversation.");
      return;
    }
    if (activeConversation?.userHasLeft) {
      toast.error("You left this group.");
      return;
    }

    setSending(true);
    const form = new FormData();
    form.append("text", text);
    form.append("sender", shellUser.id);
    form.append("message_type", activeType === "group" ? "group" : "private");
    if (activeType === "group") {
      form.append("group", activeId);
    } else {
      form.append("recipient", activeId);
    }

    try {
      const res = await fetch("/api/chat/send", { method: "POST", body: form, credentials: "include" });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(body.error ?? "Could not send message.");
        return;
      }
      setDraft("");
      await loadThread(activeId, activeType, true);
      await refreshConversations();
    } finally {
      setSending(false);
    }
  }

  function startDirectChat(member: ChatMemberOption) {
    const existing = conversations.find((c) => c.type === "user" && c.id === member.id);
    const conversation: ChatConversation =
      existing ??
      ({
        id: member.id,
        name: member.name,
        email: member.email,
        type: "user",
        image: member.photo ?? null,
        lastMessage: null,
        lastAt: new Date().toISOString(),
        unreadCount: 0,
      } satisfies ChatConversation);

    if (!existing) {
      setConversations((prev) => [conversation, ...prev]);
    }
    openThread(conversation);
  }

  async function createGroupChat(payload: {
    members: ChatMemberOption[];
    name: string;
    message: string;
  }) {
    if (!shellUser.id) return;
    setCreatingGroup(true);
    try {
      const memberIds = payload.members.map((m) => m.id);
      const res = await fetch("/api/chat/group/create", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: payload.name || undefined,
          admins: [shellUser.id],
          members: [shellUser.id, ...memberIds],
          message: payload.message,
        }),
      });
      const body = (await res.json()) as { error?: string; data?: Record<string, unknown> };
      if (!res.ok) {
        toast.error(body.error ?? "Could not create group.");
        return;
      }
      await refreshConversations();
      const groupId =
        body.data && body.data.id != null ? String(body.data.id) : null;
      if (groupId) {
        openThread({
          id: groupId,
          name: payload.name || "Group chat",
          type: "group",
          lastMessage: payload.message,
          lastAt: new Date().toISOString(),
          unreadCount: 0,
        });
      }
    } finally {
      setCreatingGroup(false);
    }
  }

  const inputDisabled =
    !activeId ||
    sending ||
    Boolean(activeConversation?.isBlocked) ||
    Boolean(activeConversation?.userHasLeft);

  return (
    <PageContainer
      className={cn(
        /* Fill main below mobile header + bottom nav — avoids a strip above the tab bar */
        "max-lg:flex max-lg:min-h-0 max-lg:flex-1 max-lg:flex-col",
        "max-lg:py-0 max-lg:pt-3 max-lg:pb-0 md:max-lg:pt-6",
        "max-lg:[&>div]:flex max-lg:[&>div]:min-h-0 max-lg:[&>div]:flex-1 max-lg:[&>div]:flex-col",
      )}
    >
      <Card
        className={cn(
          "flex min-h-0 w-full overflow-hidden shadow-card",
          /* Below lg: grow with main; lg+ keep fixed viewport height */
          "max-lg:min-h-0 max-lg:flex-1",
          "lg:h-[calc(100dvh-3.875rem-3rem)]",
        )}
      >
        <div
          className={cn(
            "flex min-h-0 w-full flex-col border-r border-border lg:w-[360px] xl:w-[380px]",
            mobileShowThread && activeId && "hidden lg:flex",
          )}
        >
          <div className="flex items-center justify-between border-b border-border p-4">
            <div>
              <h1 className="text-lg font-semibold">Inbox</h1>
              <p className="text-xs text-muted-foreground">
                {conversations.length} conversation{conversations.length === 1 ? "" : "s"}
              </p>
            </div>
            <Button
              size="icon"
              variant="primary"
              aria-label="New conversation"
              onClick={() => setNewMessageOpen(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="border-b border-border p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search contacts"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="mt-3 flex gap-4 text-sm">
              {(
                [
                  ["all", "All"],
                  ["unread", "Unread"],
                  ["groups", "Groups"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setInboxFilter(key)}
                  className={cn(
                    "pb-1",
                    inboxFilter === key
                      ? "border-b-2 border-primary font-medium text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <ul className={cn("flex-1 overflow-y-auto", hiddenScrollClass)}>
            {inboxLoading ? (
              <li className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </li>
            ) : filteredConversations.length === 0 && filteredMemberResults.length === 0 ? (
              <li className="px-4 py-10 text-center text-sm text-muted-foreground">
                {search.trim()
                  ? "No matching chats or members."
                  : "No conversations yet. Start one with the + button."}
              </li>
            ) : (
              <>
                {filteredConversations.map((c) => (
                  <li key={`${c.type}-${c.id}`}>
                    <button
                      type="button"
                      onClick={() => openThread(c)}
                      className={cn(
                        "flex w-full gap-3 px-4 py-3 text-left hover:bg-secondary/80",
                        activeId === c.id && "bg-primary-light/70",
                      )}
                    >
                      <Avatar alt={c.name} src={c.image} fallback={c.name} size="md" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold">{c.name}</p>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {formatChatTimeAgo(c.lastAt)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{roleLabel(c)}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {c.lastMessage ?? "Start chatting"}
                        </p>
                      </div>
                      {c.unreadCount > 0 ? (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-white">
                          {c.unreadCount > 9 ? "9+" : c.unreadCount}
                        </span>
                      ) : null}
                    </button>
                  </li>
                ))}

                {filteredMemberResults.length > 0 ? (
                  <li className="border-t border-border px-4 pb-2 pt-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Members
                    </p>
                  </li>
                ) : null}

                {filteredMemberResults.map((member) => (
                  <li key={`member-${member.id}`}>
                    <button
                      type="button"
                      onClick={() => startDirectChat(member)}
                      className="flex w-full gap-3 px-4 py-3 text-left hover:bg-secondary/80"
                    >
                      <Avatar alt={member.name} src={member.photo} fallback={member.name} size="md" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold">{member.name}</p>
                          <span className="shrink-0 text-xs text-primary">Message</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Community member</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {member.email ?? "Start chatting"}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </>
            )}
          </ul>
        </div>

        <div
          className={cn(
            "flex min-h-0 min-w-0 flex-1 flex-col",
            (!mobileShowThread || !activeId) && "hidden lg:flex",
          )}
        >
          {!activeId ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
              <p className="text-sm font-medium text-foreground">Select a conversation</p>
              <p className="max-w-sm text-sm">Pick someone from your inbox or start a new message.</p>
            </div>
          ) : activeConversation?.type === "group" && groupDetailsOpen && shellUser.id ? (
            <div className="relative flex min-h-0 flex-1 flex-col">
              <ChatGroupDetailsPanel
                conversation={activeConversation}
                currentUserId={shellUser.id}
                communityId={communityId}
                onBack={() => setGroupDetailsOpen(false)}
                onLeft={() => {
                  setGroupDetailsOpen(false);
                  setActiveId(null);
                  setMessages([]);
                  setMobileShowThread(false);
                  router.replace("/chat", { scroll: false });
                  void refreshConversations();
                }}
                onDeleted={() => {
                  setGroupDetailsOpen(false);
                  setActiveId(null);
                  setMessages([]);
                  setMobileShowThread(false);
                  router.replace("/chat", { scroll: false });
                  void refreshConversations();
                }}
                onRefresh={() => {
                  if (activeId) void loadThread(activeId, "group", true);
                  void refreshConversations();
                }}
              />
            </div>
          ) : activeConversation ? (
            <>
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <button
                    type="button"
                    className="text-sm text-primary lg:hidden"
                    onClick={() => setMobileShowThread(false)}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="flex min-w-0 items-center gap-3 text-left"
                    disabled={activeConversation.type !== "group"}
                    onClick={() => {
                      if (activeConversation.type === "group") setGroupDetailsOpen(true);
                    }}
                  >
                    <Avatar
                      alt={activeConversation.name}
                      src={activeConversation.image}
                      fallback={activeConversation.name}
                      size="md"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{activeConversation.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {activeConversation.isBlocked
                          ? "Messaging unavailable"
                          : activeConversation.userHasLeft
                            ? "You left this group"
                            : roleLabel(activeConversation)}
                      </p>
                    </div>
                  </button>
                </div>
                {activeConversation.type === "group" ? (
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Group details"
                    onClick={() => setGroupDetailsOpen(true)}
                  >
                    <Info className="h-5 w-5" />
                  </button>
                ) : (
                  <span className="w-5" aria-hidden />
                )}
              </div>

              <div className={cn("flex flex-1 flex-col gap-3 overflow-y-auto bg-page-secondary/50 p-4", hiddenScrollClass)}>
                {loadingThread && messages.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const prev = index > 0 ? messages[index - 1]!.createdAt : null;
                    const mine = msg.senderId === shellUser.id;
                    const showDate = shouldShowDateSeparator(msg.createdAt, prev);
                    return (
                      <div key={msg.id}>
                        {showDate ? (
                          <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {getDateSeparatorText(msg.createdAt)}
                          </p>
                        ) : null}
                        <div
                          className={cn(
                            "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                            mine
                              ? "ml-auto rounded-tr-md bg-primary text-white"
                              : "rounded-tl-md bg-card text-foreground",
                            msg.isDeleted && "italic opacity-70",
                          )}
                        >
                          {!mine && activeType === "group" ? (
                            <p className="mb-1 text-[11px] font-semibold text-primary">{msg.senderName}</p>
                          ) : null}
                          {msg.isDeleted ? "Message removed" : msg.text || (msg.media.length ? "Attachment" : "")}
                          {msg.media.map((m) =>
                            m.mediaType.startsWith("image") || m.file.match(/\.(png|jpe?g|gif|webp)/i) ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                key={m.id}
                                src={m.file}
                                alt=""
                                className="mt-2 max-h-48 rounded-lg object-cover"
                              />
                            ) : (
                              <a
                                key={m.id}
                                href={m.file}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 block text-xs underline"
                              >
                                View attachment
                              </a>
                            ),
                          )}
                          <p
                            className={cn(
                              "mt-1 text-[11px]",
                              mine ? "text-white/70" : "text-muted-foreground",
                            )}
                          >
                            {formatMessageTime(msg.createdAt)}
                            {msg.isEdited ? " · Edited" : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={threadBottomRef} />
              </div>

              <div className="border-t border-border p-4">
                {activeConversation.isBlocked ? (
                  <p className="text-center text-sm text-muted-foreground">
                    You cannot send messages in this conversation.
                  </p>
                ) : activeConversation.userHasLeft ? (
                  <p className="text-center text-sm text-muted-foreground">
                    You left this group. Rejoin from Grad Pad web to message again.
                  </p>
                ) : (
                  <form
                    className="flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void sendMessage();
                    }}
                  >
                    <Input
                      placeholder="Write a message…"
                      className="flex-1"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      disabled={inputDisabled}
                    />
                    <Button type="submit" disabled={inputDisabled || !draft.trim()}>
                      {sending ? "…" : "Send"}
                    </Button>
                  </form>
                )}
              </div>
            </>
          ) : null}
        </div>
      </Card>

      <ChatNewMessageDialog
        open={newMessageOpen}
        onClose={() => setNewMessageOpen(false)}
        communityId={communityId}
        communitySlug={communitySlug}
        currentUserId={shellUser.id ?? ""}
        onStartDirect={startDirectChat}
        onCreateGroup={createGroupChat}
        busy={creatingGroup}
      />
    </PageContainer>
  );
}
