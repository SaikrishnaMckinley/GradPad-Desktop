import { NextResponse } from "next/server";
import { stagingMarkChatThreadSeenRaw } from "@/lib/api/chat";

type Props = { params: Promise<{ threadId: string }> };

export async function POST(_request: Request, { params }: Props) {
  const { threadId } = await params;
  await stagingMarkChatThreadSeenRaw(threadId);
  return NextResponse.json({ ok: true });
}
