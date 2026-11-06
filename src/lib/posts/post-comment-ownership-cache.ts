const PREFIX = "gradpad:own-comments:v1:";
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30;

type Stored = { savedAt: number; ids: string[] };

const memory = new Map<string, Set<string>>();

function key(postId: string) {
  return `${PREFIX}${postId}`;
}

function readIds(postId: string): Set<string> {
  const mem = memory.get(postId);
  if (mem) return mem;

  if (typeof sessionStorage === "undefined") return new Set();
  try {
    const raw = sessionStorage.getItem(key(postId));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as Stored;
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      sessionStorage.removeItem(key(postId));
      return new Set();
    }
    const set = new Set(parsed.ids);
    memory.set(postId, set);
    return set;
  } catch {
    return new Set();
  }
}

function writeIds(postId: string, ids: Set<string>) {
  memory.set(postId, ids);
  if (typeof sessionStorage === "undefined") return;
  try {
    const stored: Stored = { savedAt: Date.now(), ids: [...ids] };
    sessionStorage.setItem(key(postId), JSON.stringify(stored));
  } catch {
    /* quota */
  }
}

export function rememberOwnComment(postId: string, commentId: string) {
  const ids = readIds(postId);
  ids.add(commentId);
  writeIds(postId, ids);
}

export function forgetOwnComment(postId: string, commentId: string) {
  const ids = readIds(postId);
  ids.delete(commentId);
  writeIds(postId, ids);
}

export function isOwnComment(postId: string, commentId: string): boolean {
  return readIds(postId).has(commentId);
}
