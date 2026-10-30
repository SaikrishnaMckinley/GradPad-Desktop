import Link from "next/link";

export function SupabaseSetupBanner() {
  return (
    <div className="border-b border-warning/30 bg-[#FFF8EB] px-4 py-2.5 text-center text-sm text-foreground">
      Supabase is not configured. Copy{" "}
      <code className="rounded bg-card px-1.5 py-0.5 text-xs">.env.example</code>{" "}
      to{" "}
      <code className="rounded bg-card px-1.5 py-0.5 text-xs">.env.local</code>{" "}
      and run migrations.{" "}
      <Link href="/login" className="font-medium text-primary hover:underline">
        Auth setup
      </Link>
    </div>
  );
}
