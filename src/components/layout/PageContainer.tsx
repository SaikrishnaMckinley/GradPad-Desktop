import { StickyScrollRail } from "@/components/layout/StickyScrollRail";
import { cn } from "@/lib/utils/cn";

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
  withRightRail?: boolean;
  rightRail?: React.ReactNode;
  /** On xl+, only the main column scrolls; right rail stays pinned (home feed). */
  mainColumnScroll?: boolean;
  /**
   * On xl+, one scroll for the page: center and right move together until the
   * right rail reaches the top, then it sticks while the center keeps scrolling.
   */
  unifiedScroll?: boolean;
};

const hiddenScrollbarClass =
  "xl:[scrollbar-width:none] xl:[-ms-overflow-style:none] xl:[&::-webkit-scrollbar]:hidden";

const scrollColumnClass = cn(
  "xl:overflow-y-auto xl:overscroll-contain xl:pr-1",
  hiddenScrollbarClass,
);

export function PageContainer({
  children,
  className,
  withRightRail,
  rightRail,
  mainColumnScroll,
  unifiedScroll,
}: PageContainerProps) {
  if (unifiedScroll && withRightRail) {
    return (
      <div
        className={cn(
          "mx-auto flex w-full max-w-[1440px] min-h-0 flex-1 flex-col px-2 py-3 md:px-6 md:py-6 lg:px-8",
          "xl:overflow-hidden xl:py-6",
          className,
        )}
      >
        <div className={cn("min-h-0 flex-1", scrollColumnClass)}>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-8">
            <div className="min-w-0">{children}</div>
            {rightRail ? (
              <aside className="hidden min-h-full min-w-0 xl:block">
                <StickyScrollRail>{rightRail}</StickyScrollRail>
              </aside>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1440px] px-2 py-3 md:px-6 md:py-6 lg:px-8",
        withRightRail &&
          "grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-8",
        mainColumnScroll &&
          withRightRail &&
          "xl:grid-rows-[minmax(0,1fr)] xl:h-full xl:min-h-0 xl:overflow-hidden xl:py-6",
        className,
      )}
    >
      <div
        className={cn("min-h-0 min-w-0", mainColumnScroll && scrollColumnClass)}
      >
        {children}
      </div>
      {withRightRail && rightRail ? (
        <aside className="hidden min-h-0 min-w-0 xl:block xl:overflow-hidden">
          <div className={cn("w-full", mainColumnScroll && "xl:sticky xl:top-0")}>
            {rightRail}
          </div>
        </aside>
      ) : null}
    </div>
  );
}
