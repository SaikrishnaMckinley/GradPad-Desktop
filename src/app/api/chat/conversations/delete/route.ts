import { NextResponse } from "next/server";
import { stagingDeleteChatConversationRaw } from "@/lib/api/chat";
import { readStagingActionError } from "@/lib/api/server-fetch";

export async function DELETE(request: Request) {
  const body = (await request.json()) as { type?: string; id?: string };
  const type = body.type === "group" ? "group" : body.type === "user" ? "user" : null;
  const id = typeof body.id === "string" ? body.id.trim() : "";
  if (!type || !id) {
    return NextResponse.json({ error: "type and id are required" }, { status: 400 });
  }
  const result = await stagingDeleteChatConversationRaw(type, id);
  const error = readStagingActionError(result);
  if (error) {
    return NextResponse.json({ error }, { status: result.status || 400 });
  }
  return NextResponse.json({ ok: true });
}
