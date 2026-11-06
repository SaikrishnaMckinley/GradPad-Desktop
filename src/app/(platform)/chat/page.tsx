import type { Metadata } from "next";
import { Suspense } from "react";
import { ChatDemoFixture } from "@/components/chat/ChatDemoFixture";
import { ChatPageClient } from "@/components/chat/ChatPageClient";
import { isDemoStaticUi } from "@/lib/demo-mode";

export const metadata: Metadata = {
  title: {
    absolute: "Chat . Grad Pad",
  },
};

function ChatPageFallback() {
  return (
    <div className="flex min-h-[320px] items-center justify-center text-sm text-muted-foreground">
      Loading chat…
    </div>
  );
}

export default function ChatPage() {
  if (isDemoStaticUi()) {
    return <ChatDemoFixture />;
  }

  return (
    <Suspense fallback={<ChatPageFallback />}>
      <ChatPageClient />
    </Suspense>
  );
}
