import { NextResponse } from "next/server";
import { loadChatConversations } from "@/lib/chat/queries";

export async function GET() {
  const conversations = await loadChatConversations();
  return NextResponse.json({ conversations });
}
