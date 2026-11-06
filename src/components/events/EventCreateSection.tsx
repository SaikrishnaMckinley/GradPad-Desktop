import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Props = {
  title?: string;
  children: ReactNode;
  className?: string;
};

export function EventCreateSection({ title, children, className }: Props) {
  return (
    <section
      className={cn(
        "min-w-0 max-w-full rounded-xl border border-border bg-card p-3 shadow-card md:rounded-2xl md:p-6",
        className,
      )}
    >
      {title ? (
        <h2 className="mb-3 text-sm font-semibold text-foreground md:mb-4 md:text-base">{title}</h2>
      ) : null}
      {children}
    </section>
  );
}

export function EventFieldLabel({
  children,
  required,
  htmlFor,
}: {
  children: ReactNode;
  required?: boolean;
  htmlFor?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-foreground md:mb-2 md:text-sm">
      {children}
      {required ? <span className="text-error"> *</span> : null}
    </label>
  );
}
