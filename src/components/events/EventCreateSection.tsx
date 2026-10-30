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
        "min-w-0 max-w-full rounded-xl border border-border bg-card p-4 shadow-card md:rounded-2xl md:p-6",
        className,
      )}
    >
      {title ? <h2 className="mb-4 text-base font-semibold text-foreground">{title}</h2> : null}
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
    <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-foreground">
      {children}
      {required ? <span className="text-error"> *</span> : null}
    </label>
  );
}
