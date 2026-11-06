import { NextResponse } from "next/server";
import { getApiSessionProfile } from "@/lib/auth/get-api-session-profile";
import { markGroupThreadSeen } from "@/lib/chat/mark-group-seen";

type Props = { params: Promise<{ groupId: string }> };

export async function POST(_request: Request, { params }: Props) {
  const { groupId } = await params;
  const session = await getApiSessionProfile();
  if (!session?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await markGroupThreadSeen(groupId, session.id);
  return NextResponse.json({ ok: true });
}
