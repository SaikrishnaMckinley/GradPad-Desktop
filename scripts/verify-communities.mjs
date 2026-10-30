/**
 * Verifies community RPCs and RLS-related flows against the configured Supabase project.
 * Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in .env.local
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  const path = resolve(process.cwd(), ".env.local");
  const text = readFileSync(path, "utf8");
  const env = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !serviceKey || !anonKey) {
  console.error("Missing Supabase env vars in .env.local");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const migrationSql = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260316140000_communities_feature.sql"),
  "utf8",
);

async function applyMigration() {
  const { error } = await admin.rpc("exec_sql", { sql: migrationSql });
  if (error && !String(error.message).includes("exec_sql")) {
    // Fall back: run statements via REST SQL if available — otherwise log manual step
    console.warn(
      "Could not auto-apply migration via exec_sql. Apply 20260316140000_communities_feature.sql in Supabase SQL editor if RPCs are missing.",
    );
    console.warn(error.message);
    return false;
  }
  return !error;
}

async function ensureMigrationApplied() {
  const { error } = await admin.rpc("community_member_counts", {
    p_community_ids: ["00000000-0000-0000-0000-000000000000"],
  });
  if (error?.message?.includes("Could not find the function")) {
    console.log("Applying communities migration…");
    await applyMigration();
  }
}

function randomEmail(prefix) {
  return `${prefix}-${Date.now()}@gradpad-verify.test`;
}

async function createTestUser(label) {
  const email = randomEmail(label);
  const password = "TestPass123!";
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: `Verify ${label}` },
  });
  if (error) throw error;
  return { id: data.user.id, email, password };
}

async function userClient(email, password) {
  const client = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return client;
}

async function main() {
  await ensureMigrationApplied();

  const owner = await createTestUser("owner");
  const member = await createTestUser("member");
  const ownerClient = await userClient(owner.email, owner.password);
  const memberClient = await userClient(member.email, member.password);

  const slug = `verify-${Date.now()}`;
  const { data: communityId, error: createError } = await ownerClient.rpc(
    "create_community_with_owner",
    {
      p_name: "Verify Community",
      p_slug: slug,
      p_description: "Automated verification community",
      p_visibility: "public",
      p_join_approval_required: true,
    },
  );
  if (createError) throw createError;

  const { data: dupStatus, error: join1Error } = await memberClient.rpc("join_community", {
    p_community_id: communityId,
  });
  if (join1Error) throw join1Error;
  if (dupStatus !== "pending") throw new Error(`Expected pending, got ${dupStatus}`);

  const { data: dupAgain } = await memberClient.rpc("join_community", {
    p_community_id: communityId,
  });
  if (dupAgain !== "pending") throw new Error("Duplicate join should return pending without error");

  const { error: selfPromoError } = await memberClient
    .from("community_members")
    .update({ role: "admin" })
    .eq("community_id", communityId)
    .eq("user_id", member.id);
  if (!selfPromoError) throw new Error("Member self-promotion to admin should fail");

  const { data: pendingRows } = await ownerClient
    .from("community_members")
    .select("id")
    .eq("community_id", communityId)
    .eq("status", "pending");

  const pendingId = pendingRows?.[0]?.id;
  if (!pendingId) throw new Error("Pending row not visible to owner");

  const { error: approveError } = await ownerClient
    .from("community_members")
    .update({ status: "active" })
    .eq("id", pendingId);
  if (approveError) throw approveError;

  const { data: counts } = await ownerClient.rpc("community_member_counts", {
    p_community_ids: [communityId],
  });
  const memberCount = Number(counts?.[0]?.member_count ?? 0);
  if (memberCount !== 2) throw new Error(`Expected 2 active members, got ${memberCount}`);

  const { error: leaveOwnerError } = await ownerClient.rpc("leave_community", {
    p_community_id: communityId,
  });
  if (!leaveOwnerError) throw new Error("Owner leave should fail");

  const { error: leaveMemberError } = await memberClient.rpc("leave_community", {
    p_community_id: communityId,
  });
  if (leaveMemberError) throw leaveMemberError;

  console.log("Communities verification passed:", {
    communityId,
    slug,
    memberCountDuring: memberCount,
    selfPromoBlocked: true,
  });

  await admin.from("communities").delete().eq("id", communityId);
  await admin.auth.admin.deleteUser(owner.id);
  await admin.auth.admin.deleteUser(member.id);
}

main().catch((err) => {
  console.error("Communities verification failed:", err.message ?? err);
  process.exit(1);
});
