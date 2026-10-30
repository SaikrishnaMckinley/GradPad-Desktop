import { NextResponse } from "next/server";
import { loadCommunityHub } from "@/lib/communities/load-community-hub";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const hub = await loadCommunityHub(slug);

  if (!hub) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(hub);
}
