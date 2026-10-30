import { cn } from "@/lib/utils/cn";

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
  withRightRail?: boolean;
  rightRail?: React.ReactNode;
};

export function PageContainer({
  children,
  className,
  withRightRail,
  rightRail,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1440px] px-4 py-5 md:px-6 md:py-6 lg:px-8",
        withRightRail &&
          "grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-8",
        className,
      )}
    >
      <div className="min-w-0">{children}</div>
      {withRightRail && rightRail ? (
        <aside className="hidden min-w-0 xl:block">{rightRail}</aside>
      ) : null}
    </div>
  );
}
