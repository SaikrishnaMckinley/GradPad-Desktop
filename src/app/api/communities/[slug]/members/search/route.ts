import { NextResponse } from "next/server";
import { serverFetchJson } from "@/lib/api/server-fetch";
import { unwrapList } from "@/lib/api/parse-list";

type Props = { params: Promise<{ slug: string }> };

/** `slug` segment accepts community UUID or route slug (staging search uses UUID). */
export async function GET(request: Request, { params }: Props) {
  const { slug: communityKey } = await params;
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim() ?? "";
  if (!query) {
    return NextResponse.json({ members: [] });
  }

  const result = await serverFetchJson<unknown>(
    `community/${communityKey}/members/search/?query=${encodeURIComponent(query)}`,
  );
  if (!result.ok) {
    return NextResponse.json({ members: [] }, { status: result.status });
  }

  const members = unwrapList(result.data).map((row) => {
    const m = row as Record<string, unknown>;
    const user = (m.user ?? m) as Record<string, unknown>;
    const id = String(user.id ?? m.id ?? "");
    const first = typeof user.first_name === "string" ? user.first_name : "";
    const last = typeof user.last_name === "string" ? user.last_name : "";
    return {
      id,
      name: `${first} ${last}`.trim() || String(user.email ?? "Member"),
      email: typeof user.email === "string" ? user.email : undefined,
      photo: typeof user.photo === "string" ? user.photo : undefined,
    };
  });

  return NextResponse.json({ members });
}
