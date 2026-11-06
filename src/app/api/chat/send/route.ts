import { NextResponse } from "next/server";
import { stagingSendChatMessageRaw } from "@/lib/api/chat";
import { readStagingActionError } from "@/lib/api/server-fetch";

export async function POST(request: Request) {
  const form = await request.formData();
  const result = await stagingSendChatMessageRaw(form);
  const error = readStagingActionError(result);
  if (error) {
    return NextResponse.json({ error }, { status: result.status || 400 });
  }
  return NextResponse.json({ ok: true, data: result.data });
}
