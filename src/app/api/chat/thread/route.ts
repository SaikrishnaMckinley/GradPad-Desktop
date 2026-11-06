import { NextResponse } from "next/server";
import { mapConversationRow } from "@/lib/chat/map-chat";
import { loadChatThread } from "@/lib/chat/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const threadId = searchParams.get("threadId")?.trim();
  const typeParam = searchParams.get("type")?.trim();
  if (!threadId) {
    return NextResponse.json({ error: "threadId is required" }, { status: 400 });
  }

  let type: "user" | "group" = typeParam === "group" ? "group" : "user";
  let fallback = null;
  const fallbackRaw = searchParams.get("fallback");
  if (fallbackRaw) {
    try {
      fallback = mapConversationRow(JSON.parse(fallbackRaw));
    } catch {
      fallback = null;
    }
  }

  let payload = await loadChatThread(threadId, type, fallback);

  if (payload.messages.length === 0 && type === "user") {
    const groupTry = await loadChatThread(threadId, "group", fallback);
    if (groupTry.messages.length > 0) {
      payload = groupTry;
      type = "group";
    }
  }

  return NextResponse.json({ ...payload, type });
}
