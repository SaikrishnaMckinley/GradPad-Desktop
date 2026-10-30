"use client";

import { useState } from "react";
import { Info, Plus, Search } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageContainer } from "@/components/layout/PageContainer";
import { cn } from "@/lib/utils/cn";

const CONVERSATIONS = [
  {
    id: "1",
    name: "Ema Watson",
    role: "Community Member",
    preview: "Thanks for sharing the event details!",
    time: "1m",
    unread: 2,
  },
  {
    id: "2",
    name: "Peter Jackson",
    role: "Community Member",
    preview: "See you at the mixer tomorrow.",
    time: "12m",
    unread: 0,
  },
  {
    id: "3",
    name: "MS University (NYC)",
    role: "Group",
    preview: "Office hours moved to Friday.",
    time: "1h",
    unread: 0,
  },
] as const;

export default function ChatPage() {
  const [activeId, setActiveId] = useState("1");
  const active = CONVERSATIONS.find((c) => c.id === activeId) ?? CONVERSATIONS[0];
  const [mobileShowThread, setMobileShowThread] = useState(false);

  return (
    <PageContainer>
      <Card
        className={cn(
          "flex min-h-0 w-full overflow-hidden shadow-card",
          "h-[calc(100dvh-3.5rem-4rem-2.5rem)]",
          "md:h-[calc(100dvh-3.5rem-4rem-3rem)]",
          "lg:h-[calc(100dvh-3.875rem-3rem)]",
        )}
      >
        <div
          className={cn(
            "flex min-h-0 w-full flex-col border-r border-border lg:w-[360px] xl:w-[380px]",
            mobileShowThread && "hidden lg:flex",
          )}
        >
          <div className="flex items-center justify-between border-b border-border p-4">
            <div>
              <h1 className="text-lg font-semibold">Inbox</h1>
              <p className="text-xs text-muted-foreground">8 conversations</p>
            </div>
            <Button size="icon" variant="primary" aria-label="New conversation">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="border-b border-border p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search contacts" />
            </div>
            <div className="mt-3 flex gap-4 text-sm">
              <button type="button" className="border-b-2 border-primary pb-1 font-medium text-primary">
                All
              </button>
              <button type="button" className="pb-1 text-muted-foreground">
                Unread
              </button>
              <button type="button" className="pb-1 text-muted-foreground">
                Groups
              </button>
            </div>
          </div>
          <ul className="flex-1 overflow-y-auto">
            {CONVERSATIONS.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveId(c.id);
                    setMobileShowThread(true);
                  }}
                  className={cn(
                    "flex w-full gap-3 px-4 py-3 text-left hover:bg-secondary/80",
                    activeId === c.id && "bg-primary-light/70",
                  )}
                >
                  <Avatar alt={c.name} fallback={c.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{c.name}</p>
                      <span className="text-xs text-muted-foreground">{c.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{c.role}</p>
                    <p className="truncate text-sm text-muted-foreground">{c.preview}</p>
                  </div>
                  {c.unread > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-white">
                      {c.unread}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div
          className={cn(
            "flex min-h-0 min-w-0 flex-1 flex-col",
            !mobileShowThread && "hidden lg:flex",
          )}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="text-sm text-primary lg:hidden"
                onClick={() => setMobileShowThread(false)}
              >
                Back
              </button>
              <Avatar alt={active.name} fallback={active.name} size="md" />
              <div>
                <p className="text-sm font-semibold">{active.name}</p>
                <p className="text-xs text-success">Active now</p>
              </div>
            </div>
            <button type="button" className="text-muted-foreground" aria-label="Conversation info">
              <Info className="h-5 w-5" />
            </button>
          </div>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-page-secondary/50 p-4">
            <p className="text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Today
            </p>
            <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-card px-4 py-3 text-sm shadow-sm">
              Hey! Are you going to the alumni mixer this week?
              <p className="mt-1 text-[11px] text-muted-foreground">9:41 AM</p>
            </div>
            <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-primary px-4 py-3 text-sm text-white">
              Yes — I&apos;ll be there around 5.
              <p className="mt-1 text-[11px] text-white/70">9:44 AM</p>
            </div>
          </div>
          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <Input placeholder="Write a message..." className="flex-1" />
              <Button>Send</Button>
            </div>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}
