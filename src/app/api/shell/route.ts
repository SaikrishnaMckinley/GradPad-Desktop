import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getApiSessionProfile } from "@/lib/auth/get-api-session-profile";
import { resolveShellUser } from "@/lib/auth/resolve-shell-user";
import { getApiShellCommunityContext } from "@/lib/communities/api-sidebar";
import { isDemoStaticUi } from "@/lib/demo-mode";
import { DEMO_SHELL_COMMUNITY_CONTEXT } from "@/lib/fixtures/demo-shell-context";

const EMPTY = {
  activeSlug: null,
  activeCommunity: null,
  channels: [],
  channelsByCommunityId: {},
  memberships: [],
};

export async function GET() {
  const session = await getApiSessionProfile();

  if (isDemoStaticUi()) {
    return NextResponse.json({
      user: resolveShellUser(session, true),
      communityContext: DEMO_SHELL_COMMUNITY_CONTEXT,
    });
  }

  const hasAccess = Boolean((await cookies()).get("gradpad_access_token")?.value);
  const communityContext = hasAccess ? await getApiShellCommunityContext() : EMPTY;

  return NextResponse.json({
    user: resolveShellUser(session, true),
    communityContext,
  });
}
