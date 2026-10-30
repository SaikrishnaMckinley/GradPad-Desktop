import { isDemoStaticUi } from "@/lib/demo-mode";
import { DEV_CURRENT_USER } from "@/lib/fixtures/dev-shell-data";
import type { SessionProfile } from "@/lib/auth/get-session-profile";
import type { ShellUser } from "@/types/shell-user";

export function resolveShellUser(
  session: SessionProfile | null,
  supabaseConfigured: boolean,
): ShellUser {
  if (isDemoStaticUi()) {
    return {
      id: session?.id ?? DEV_CURRENT_USER.id,
      username: session?.username ?? null,
      fullName: DEV_CURRENT_USER.fullName,
      headline: DEV_CURRENT_USER.headline,
      avatarUrl: DEV_CURRENT_USER.avatarUrl,
    };
  }

  if (session) {
    return {
      id: session.id,
      username: session.username,
      fullName: session.fullName,
      headline: session.headline ?? "GradPad member",
      avatarUrl: session.avatarUrl,
    };
  }

  if (!supabaseConfigured) {
    return {
      id: DEV_CURRENT_USER.id,
      fullName: DEV_CURRENT_USER.fullName,
      headline: DEV_CURRENT_USER.headline,
      avatarUrl: DEV_CURRENT_USER.avatarUrl,
    };
  }

  return {
    fullName: "Member",
    headline: "GradPad",
    avatarUrl: null,
  };
}
