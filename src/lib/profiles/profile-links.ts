export function profilePath(userId: string): string {
  return `/profile/${encodeURIComponent(userId)}`;
}

export function chatWithUserPath(userId: string): string {
  const qs = new URLSearchParams({ thread: userId, type: "user" });
  return `/chat?${qs.toString()}`;
}
