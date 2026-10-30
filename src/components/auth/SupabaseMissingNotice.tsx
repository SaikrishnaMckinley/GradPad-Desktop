export function SupabaseMissingNotice() {
  return (
    <div className="rounded-xl border border-border bg-secondary/60 p-4 text-sm leading-relaxed text-muted-foreground">
      <p className="font-medium text-foreground">Supabase credentials required</p>
      <ol className="mt-3 list-decimal space-y-2 pl-5">
        <li>Create a project at supabase.com.</li>
        <li>
          Copy <code className="text-xs">.env.example</code> to{" "}
          <code className="text-xs">.env.local</code> and set{" "}
          <code className="text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> or{" "}
          <code className="text-xs">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>.
        </li>
        <li>
          Apply SQL from <code className="text-xs">supabase/migrations/</code> in
          the Supabase SQL editor or via the Supabase CLI.
        </li>
        <li>Restart the dev server.</li>
      </ol>
    </div>
  );
}
