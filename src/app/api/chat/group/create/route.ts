import { NextResponse } from "next/server";
import { stagingCreateGroupChatRaw } from "@/lib/api/chat";
import { readStagingActionError } from "@/lib/api/server-fetch";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    admins?: string[];
    members?: string[];
    message?: string;
  };
  const admins = Array.isArray(body.admins) ? body.admins : [];
  const members = Array.isArray(body.members) ? body.members : [];
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (members.length < 2 || !message) {
    return NextResponse.json(
      { error: "Pick at least two members and include an opening message." },
      { status: 400 },
    );
  }

  const result = await stagingCreateGroupChatRaw({
    name: body.name?.trim() || undefined,
    admins,
    members,
    message,
  });
  const error = readStagingActionError(result);
  if (error) {
    return NextResponse.json({ error }, { status: result.status || 400 });
  }
  return NextResponse.json({ ok: true, data: result.data });
}
