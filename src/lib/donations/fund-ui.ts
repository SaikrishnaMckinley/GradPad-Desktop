import type { FundColor, FundIcon } from "@/lib/donations/community-donations";

export const FUND_PROGRESS_COLORS: Record<FundColor, string> = {
  blue: "#0A66C2",
  green: "#16A34A",
  purple: "#9333EA",
  red: "#DC2626",
  orange: "#EA580C",
  teal: "#0D9488",
};

export function getFundProgressColor(color?: FundColor): string {
  return FUND_PROGRESS_COLORS[color ?? "blue"];
}

export function fundIconEmoji(icon?: FundIcon): string {
  switch (icon) {
    case "trophy":
      return "🏆";
    case "book":
      return "📚";
    case "lightning":
      return "⚡";
    case "globe":
      return "🌐";
    case "heart":
      return "💙";
    case "general":
    default:
      return "✨";
  }
}
