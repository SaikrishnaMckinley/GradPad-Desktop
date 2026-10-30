import { NextResponse } from "next/server";
import { getCommunityFeedPosts } from "@/lib/posts/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const communityId = searchParams.get("community")?.trim();
  const communityName = searchParams.get("name")?.trim() ?? "";

  if (!communityId) {
    return NextResponse.json({ error: "community is required" }, { status: 400 });
  }

  const posts = await getCommunityFeedPosts(communityId, communityName);
  return NextResponse.json({ posts });
}
