export function CommunityMembersDirectorySkeleton() {
  return (
    <div className="flex w-full flex-col gap-5 pb-8">
      <div className="h-4 w-48 rounded bg-page-secondary/80" />
      <div className="h-11 rounded-[10px] bg-page-secondary/60" />
      <div className="h-4 w-32 rounded bg-page-secondary/80" />
      <div className="space-y-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-[4.5rem] rounded-[10px] bg-page-secondary/40 shadow-[0_4px_14px_rgba(21,21,21,0.03)]"
          />
        ))}
      </div>
    </div>
  );
}
