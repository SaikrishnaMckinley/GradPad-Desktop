import { NextResponse } from "next/server";
import { stagingAddGroupMembersRaw } from "@/lib/api/chat";
import { readStagingActionError } from "@/lib/api/server-fetch";

type Props = { params: Promise<{ groupId: string }> };

export async function POST(request: Request, { params }: Props) {
  const { groupId } = await params;
  const body = (await request.json()) as { userIds?: string[] };
  const userIds = Array.isArray(body.userIds)
    ? body.userIds.map((id) => String(id).trim()).filter(Boolean)
    : [];
  if (userIds.length === 0) {
    return NextResponse.json({ error: "userIds are required" }, { status: 400 });
  }
  const result = await stagingAddGroupMembersRaw(groupId, userIds);
  const error = readStagingActionError(result);
  if (error) {
    return NextResponse.json({ error }, { status: result.status || 400 });
  }
  return NextResponse.json({ ok: true });
}
