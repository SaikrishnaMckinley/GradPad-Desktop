export function getDateSeparatorText(messageDate: string): string {
  const msgDate = new Date(messageDate);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDateOnly = new Date(msgDate.getFullYear(), msgDate.getMonth(), msgDate.getDate());
  const diffDays = Math.floor((today.getTime() - messageDateOnly.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays <= 6) {
    return msgDate.toLocaleDateString("en-US", { weekday: "long" });
  }
  return msgDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function shouldShowDateSeparator(currentIso: string, previousIso: string | null): boolean {
  if (!previousIso) return true;
  const current = new Date(currentIso);
  const previous = new Date(previousIso);
  return (
    current.getDate() !== previous.getDate() ||
    current.getMonth() !== previous.getMonth() ||
    current.getFullYear() !== previous.getFullYear()
  );
}
