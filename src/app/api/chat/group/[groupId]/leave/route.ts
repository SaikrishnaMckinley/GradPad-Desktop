import { NextResponse } from "next/server";
import { stagingLeaveGroupRaw } from "@/lib/api/chat";
import { readStagingActionError } from "@/lib/api/server-fetch";

type Props = { params: Promise<{ groupId: string }> };

export async function POST(_request: Request, { params }: Props) {
  const { groupId } = await params;
  const result = await stagingLeaveGroupRaw(groupId);
  const error = readStagingActionError(result);
  if (error) {
    return NextResponse.json({ error }, { status: result.status || 400 });
  }
  return NextResponse.json({ ok: true });
}
