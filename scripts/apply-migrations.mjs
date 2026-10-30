/**
 * Applies supabase/migrations/*.sql in order using a Postgres connection.
 *
 * Set DATABASE_URL in .env.local to the Supabase Session pooler URI, e.g.:
 * postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres
 *
 * Supabase → Project Settings → Database → Connection string → Session pooler
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";

function loadEnv() {
  const path = resolve(process.cwd(), ".env.local");
  try {
    const text = readFileSync(path, "utf8");
    const env = {};
    for (const line of text.split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
    return env;
  } catch {
    return {};
  }
}

const env = loadEnv();

function resolveConnectionString() {
  if (env.DATABASE_URL || env.SUPABASE_DB_URL) {
    return env.DATABASE_URL || env.SUPABASE_DB_URL;
  }

  let password = env.SUPABASE_DB_PASSWORD;
  const dbPassFile = resolve(process.cwd(), "supabase/.dbpass");
  if (!password && existsSync(dbPassFile)) {
    password = readFileSync(dbPassFile, "utf8").trim();
  }

  const publicUrl = env.NEXT_PUBLIC_SUPABASE_URL || "";
  const ref = publicUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (password && ref) {
    return buildCandidates(ref, password, env.SUPABASE_DB_HOST);
  }

  return null;
}

function buildCandidates(ref, password, explicitHost) {
  const encoded = encodeURIComponent(password);
  if (explicitHost) {
    return [
      `postgresql://postgres.${ref}:${encoded}@${explicitHost}:5432/postgres`,
      `postgresql://postgres:${encoded}@${explicitHost}:5432/postgres`,
    ];
  }
  const regions = [
    "ap-south-1",
    "ap-southeast-1",
    "us-east-1",
    "us-west-1",
    "eu-west-1",
    "eu-central-1",
  ];
  return [
    `postgresql://postgres:${encoded}@db.${ref}.supabase.co:5432/postgres`,
    ...regions.flatMap((region) => [
      `postgresql://postgres.${ref}:${encoded}@aws-0-${region}.pooler.supabase.com:5432/postgres`,
      `postgresql://postgres.${ref}:${encoded}@aws-0-${region}.pooler.supabase.com:6543/postgres`,
    ]),
  ];
}

const resolved = resolveConnectionString();

if (!resolved) {
  console.error(
    "Missing database credentials. Add one of:\n" +
      "  • DATABASE_URL in .env.local (Session pooler URI)\n" +
      "  • SUPABASE_DB_PASSWORD in .env.local\n" +
      "  • supabase/.dbpass file (one line: your DB password)\n" +
      "Password: Supabase → Project Settings → Database\n",
  );
  process.exit(1);
}

const candidates = Array.isArray(resolved) ? resolved : [resolved];

const migrationsDir = resolve(process.cwd(), "supabase/migrations");
const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

let client;
let lastError;
for (const connectionString of candidates) {
  const attempt = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  try {
    await attempt.connect();
    client = attempt;
    console.log("Connected to database.");
    break;
  } catch (err) {
    lastError = err;
    await attempt.end().catch(() => {});
  }
}

if (!client) {
  console.error("Could not connect to Postgres:", lastError?.message ?? lastError);
  process.exit(1);
}

for (const file of files) {
  const sql = readFileSync(resolve(migrationsDir, file), "utf8");
  console.log(`Applying ${file}…`);
  try {
    await client.query(sql);
    console.log(`  OK`);
  } catch (err) {
    console.error(`  Failed: ${err.message}`);
    await client.end();
    process.exit(1);
  }
}

await client.end();
console.log("All migrations applied.");
