/**
 * Static fixture UI (UCLA demo, etc.). When false, data comes from staging API only — not Supabase.
 */
export function isDemoStaticUi(): boolean {
  const raw = process.env.NEXT_PUBLIC_DEMO_STATIC_UI?.trim().toLowerCase();
  if (!raw || raw === "false" || raw === "0" || raw === "no") {
    return false;
  }
  return true;
}

/** GradPad-Desktop reads/writes via Django staging API (see docs/PROJECT_CONTEXT.md). */
export function usesStagingApi(): boolean {
  return !isDemoStaticUi();
}
