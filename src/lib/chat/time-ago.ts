/** Short relative time for inbox rows (matches gradpad-web feel). */
export function formatChatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  const now = Date.now();
  let diffSec = Math.floor((now - date.getTime()) / 1000);
  if (diffSec < 0) diffSec = 0;

  if (diffSec < 60) return `${diffSec}s`;
  const minutes = Math.floor(diffSec / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(diffSec / 3600);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(diffSec / 86400);
  if (days < 7) return `${days}d`;

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${month}/${day}/${date.getFullYear()}`;
}
