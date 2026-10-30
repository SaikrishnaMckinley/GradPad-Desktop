import type { ShellCommunityContext } from "@/lib/communities/shell-data";
import type { ShellUser } from "@/types/shell-user";

const STORAGE_KEY = "gradpad:shell:v1";
const MAX_AGE_MS = 1000 * 60 * 30;

type Stored = {
  savedAt: number;
  user: ShellUser;
  communityContext: ShellCommunityContext;
};

let memory: Stored | null = null;

export function readShellCache(): { user: ShellUser; communityContext: ShellCommunityContext } | null {
  if (memory && Date.now() - memory.savedAt <= MAX_AGE_MS) {
    return { user: memory.user, communityContext: memory.communityContext };
  }

  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Stored;
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      sessionStorage.removeItem(STORAGE_KEY);
      memory = null;
      return null;
    }
    memory = parsed;
    return { user: parsed.user, communityContext: parsed.communityContext };
  } catch {
    return null;
  }
}

export function writeShellCache(user: ShellUser, communityContext: ShellCommunityContext) {
  const stored: Stored = { savedAt: Date.now(), user, communityContext };
  memory = stored;
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    /* quota */
  }
}

export function clearShellCache() {
  memory = null;
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
