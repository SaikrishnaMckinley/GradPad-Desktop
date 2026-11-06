import { NextResponse } from "next/server";
import { fetchCommunityMembersRaw } from "@/lib/api/communities";
import { unwrapList } from "@/lib/api/parse-list";
import { memberDisplayNameFromApi, memberPhotoFromApi } from "@/lib/communities/member-display-name";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const communityId = searchParams.get("communityId")?.trim();
  if (!communityId) {
    return NextResponse.json({ members: [] });
  }

  const result = await fetchCommunityMembersRaw(communityId);
  if (!result.ok) {
    return NextResponse.json({ members: [] }, { status: result.status });
  }

  const members = unwrapList(result.data)
    .map((row) => {
      const m = row as Record<string, unknown>;
      const user =
        m.user && typeof m.user === "object" ? (m.user as Record<string, unknown>) : m;
      const id = String(user.id ?? m.user_id ?? m.id ?? "");
      if (!id) return null;
      return {
        id,
        name: memberDisplayNameFromApi(row),
        email: typeof user.email === "string" ? user.email : undefined,
        photo: memberPhotoFromApi(row),
      };
    })
    .filter(Boolean);

  return NextResponse.json({ members });
}
