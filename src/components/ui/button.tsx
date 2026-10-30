import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white shadow-sm hover:bg-primary-hover active:bg-primary-hover",
        secondary:
          "border border-primary-border bg-card text-primary hover:bg-primary-light",
        outline:
          "border border-border bg-card text-foreground hover:bg-secondary",
        ghost: "text-primary hover:bg-primary-light",
        muted:
          "border border-border bg-card text-muted-foreground hover:bg-secondary",
      },
      size: {
        sm: "h-9 rounded-[10px] px-3.5 text-sm",
        md: "h-10 rounded-[11px] px-4 text-sm",
        lg: "h-11 rounded-[12px] px-5 text-[15px]",
        icon: "h-9 w-9 rounded-[10px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";
