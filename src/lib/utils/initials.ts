/** First letters of the first two words, or first two characters. */
export function displayInitials(label: string, max = 2): string {
  const cleaned = label.trim().replace(/\s+/g, " ");
  if (!cleaned) return "?";
  const parts = cleaned.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, max);
  }
  return cleaned.slice(0, max).toUpperCase();
}

export function isUsableImageUrl(src: string | null | undefined): src is string {
  if (!src) return false;
  const value = src.trim();
  if (!value) return false;
  if (value === "null" || value === "undefined") return false;
  return true;
}
