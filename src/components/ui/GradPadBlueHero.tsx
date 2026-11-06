import { gradPadBlueGradientStyle } from "@/lib/ui/gradpad-blue-theme";
import { cn } from "@/lib/utils/cn";

type Props = {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "compact";
};

export function GradPadBlueHero({ children, className, size = "default" }: Props) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl text-white shadow-md",
        size === "compact" ? "px-5 py-5 md:px-6 md:py-6" : "px-6 py-6 md:px-8 md:py-7",
        className,
      )}
      style={gradPadBlueGradientStyle()}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 right-16 h-44 w-44 rounded-full bg-white/[0.07]"
        aria-hidden
      />
      <div className="relative">{children}</div>
    </div>
  );
}
