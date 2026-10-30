#!/usr/bin/env node
/**
 * Seed channels, events, and posts on staging for communities that have none.
 *
 * Usage (from repo root):
 *   node scripts/seed-staging-community-content.mjs
 *
 * Env:
 *   NEXT_PUBLIC_API_BASE_URL  (default https://api-staging.gradpad.io/api/)
 *   GRADPAD_ACCESS_TOKEN      — or login with GRADPAD_EMAIL + GRADPAD_PASSWORD
 *   SEED_COMMUNITY_IDS        — comma-separated UUIDs (default: two common test IDs below)
 *
 * Example:
 *   GRADPAD_EMAIL=you@example.com GRADPAD_PASSWORD=secret \
 *   SEED_COMMUNITY_IDS=066f71b6-3687-4ee6-92da-80bd5bf36e4c,dd802083-de28-48df-a815-c5221c95af1a \
 *   node scripts/seed-staging-community-content.mjs
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/?$/, "/") ??
  "https://api-staging.gradpad.io/api/";

const DEFAULT_COMMUNITY_IDS = [
  "066f71b6-3687-4ee6-92da-80bd5bf36e4c",
  "dd802083-de28-48df-a815-c5221c95af1a",
];

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

async function login() {
  const token = process.env.GRADPAD_ACCESS_TOKEN?.trim();
  if (token) return token;

  const email = process.env.GRADPAD_EMAIL?.trim();
  const password = process.env.GRADPAD_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "Set GRADPAD_ACCESS_TOKEN or GRADPAD_EMAIL + GRADPAD_PASSWORD in the environment.",
    );
  }

  const res = await fetch(`${API_BASE}auth/login/`, {
    method: "POST",
    headers: {
      Accept: "application/json; version=v1",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(`Login failed (${res.status})`);
  }
  const data = await res.json();
  return data.access ?? data.tokens?.access ?? data.key;
}

async function apiGet(token, path) {
  const res = await fetch(`${API_BASE}${path.replace(/^\//, "")}`, {
    headers: {
      Accept: "application/json; version=v1",
      Authorization: `Bearer ${token}`,
    },
  });
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { ok: res.ok, status: res.status, body };
}

async function apiPost(token, path, payload, json = true) {
  const headers = {
    Accept: "application/json; version=v1",
    Authorization: `Bearer ${token}`,
  };
  let body;
  if (json) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(payload);
  } else {
    body = payload;
  }
  const res = await fetch(`${API_BASE}${path.replace(/^\//, "")}`, {
    method: "POST",
    headers,
    body,
  });
  const text = await res.text();
  let parsed = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }
  return { ok: res.ok, status: res.status, body: parsed };
}

function listLength(data) {
  if (Array.isArray(data)) return data.length;
  if (data && typeof data === "object" && Array.isArray(data.results)) return data.results.length;
  return 0;
}

function postsLength(data) {
  if (Array.isArray(data)) return data.length;
  if (data?.results) return data.results.length;
  return 0;
}

async function seedCommunity(token, communityId) {
  console.log(`\n— Community ${communityId}`);

  const channelsRes = await apiGet(token, `community/${communityId}/channels/`);
  if (!channelsRes.ok) {
    console.warn(`  Skip: cannot read channels (${channelsRes.status})`);
    return;
  }
  if (listLength(channelsRes.body) === 0) {
    const created = await apiPost(token, `community/${communityId}/channels/`, {
      name: "General",
      description: "Join the latest conversations in the general channel",
    });
    console.log(created.ok ? "  ✓ Created channel General" : `  ✗ Channel failed (${created.status})`);
  } else {
    console.log("  · Channels already exist");
  }

  const eventsRes = await apiGet(token, `community/${communityId}/events/upcoming/`);
  if (eventsRes.ok && listLength(eventsRes.body) === 0) {
    const start = new Date();
    start.setDate(start.getDate() + 14);
    const end = new Date(start);
    end.setHours(end.getHours() + 2);
    const created = await apiPost(token, `community/${communityId}/event/`, {
      title: "Community Welcome Mixer",
      description: "Seed event for GradPad Desktop — meet members and share updates.",
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      location: "In person",
      event_type: "in_person",
    });
    console.log(created.ok ? "  ✓ Created welcome event" : `  ✗ Event failed (${created.status})`, created.body);
  } else {
    console.log("  · Events already exist or could not be listed");
  }

  const postsRes = await apiGet(
    token,
    `posts/?community=${communityId}&limit=5&page_size=5`,
  );
  if (postsRes.ok && postsLength(postsRes.body) === 0) {
    const form = new FormData();
    form.append("title", "Welcome to the community");
    form.append(
      "content",
      "This is sample content created by scripts/seed-staging-community-content.mjs for desktop UI testing.",
    );
    form.append("community", communityId);
    const created = await apiPost(token, "posts/", form, false);
    console.log(created.ok ? "  ✓ Created welcome post" : `  ✗ Post failed (${created.status})`, created.body);
  } else {
    console.log("  · Posts already exist or could not be listed");
  }
}

async function main() {
  const token = await login();
  const ids =
    process.env.SEED_COMMUNITY_IDS?.split(",").map((s) => s.trim()).filter(Boolean) ??
    DEFAULT_COMMUNITY_IDS;

  console.log(`Staging API: ${API_BASE}`);
  console.log(`Seeding ${ids.length} communit${ids.length === 1 ? "y" : "ies"}…`);

  for (const id of ids) {
    await seedCommunity(token, id);
  }

  console.log("\nDone. Refresh the community page in the app.");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
