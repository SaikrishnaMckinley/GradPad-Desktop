import type { HomeFeedPayload } from "@/lib/posts/load-home-feed";
import type { EventRailItem } from "@/types/events";

export type HomePageSnapshot = {
  feed: HomeFeedPayload;
  upcomingEvents: EventRailItem[];
};

const STORAGE_KEY = "gradpad:home-page:v1";
const MAX_AGE_MS = 1000 * 60 * 15;

let memory: { snapshot: HomePageSnapshot; at: number } | null = null;

export function rememberHomePage(snapshot: HomePageSnapshot) {
  const at = Date.now();
  memory = { snapshot, at };
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ snapshot, at }));
  } catch {
    /* quota */
  }
}

export function readHomePageCache(): HomePageSnapshot | null {
  if (memory && Date.now() - memory.at < MAX_AGE_MS) {
    return memory.snapshot;
  }

  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { snapshot: HomePageSnapshot; at: number };
    if (Date.now() - parsed.at > MAX_AGE_MS) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    memory = parsed;
    return parsed.snapshot;
  } catch {
    return null;
  }
}
