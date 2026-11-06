import { NextResponse } from "next/server";
import { completeCommunityInviteFromLink } from "@/lib/communities/actions";

type Context = { params: Promise<{ slug: string }> };

/**
 * Invite completion must run in a Route Handler so we can set the active-community cookie.
 * (Server Components cannot call cookies().set — even when invoking "use server" modules.)
 */
export async function GET(request: Request, context: Context) {
  const { slug } = await context.params;
  const key = slug.trim();

  if (!key) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  const result = await completeCommunityInviteFromLink(key);
  const destination = result.redirectTo ?? "/home";
  return NextResponse.redirect(new URL(destination, request.url));
}
