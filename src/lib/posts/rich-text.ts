const ALLOWED_TAGS = new Set(["STRONG", "B", "EM", "I", "BR", "P", "SPAN"]);

export function plainTextFromPostHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function sanitizePostHtml(raw: string): string {
  if (!raw.includes("<")) {
    return escapeHtml(raw).replace(/\n/g, "<br />");
  }

  if (typeof DOMParser === "undefined") {
    return escapeHtml(plainTextFromPostHtml(raw));
  }

  const doc = new DOMParser().parseFromString(raw, "text/html");
  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return escapeHtml(node.textContent ?? "");
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const el = node as HTMLElement;
    const tag = el.tagName.toUpperCase();
    if (!ALLOWED_TAGS.has(tag)) {
      return Array.from(el.childNodes).map(walk).join("");
    }
    if (tag === "BR") return "<br />";
    const inner = Array.from(el.childNodes).map(walk).join("");
    if (tag === "P") return `<p>${inner}</p>`;
    if (tag === "STRONG" || tag === "B") return `<strong>${inner}</strong>`;
    if (tag === "EM" || tag === "I") return `<em>${inner}</em>`;
    return inner;
  };

  return Array.from(doc.body.childNodes).map(walk).join("") || escapeHtml(raw);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function wrapSelectionWithTag(
  value: string,
  start: number,
  end: number,
  openTag: string,
  closeTag: string,
): { next: string; cursor: number } {
  const selected = value.slice(start, end);
  if (selected.length > 0) {
    const next = value.slice(0, start) + openTag + selected + closeTag + value.slice(end);
    return { next, cursor: end + openTag.length + closeTag.length };
  }
  const next = value.slice(0, start) + openTag + closeTag + value.slice(end);
  return { next, cursor: start + openTag.length };
}

export function insertAtCursor(value: string, start: number, end: number, insert: string): {
  next: string;
  cursor: number;
} {
  const next = value.slice(0, start) + insert + value.slice(end);
  const cursor = start + insert.length;
  return { next, cursor };
}

/** Normalize contentEditable output before sanitize/store. */
export function normalizeContentEditableHtml(raw: string): string {
  let html = raw.trim();
  if (!html || html === "<br>" || html === "<br/>") return "";

  html = html
    .replace(/<div><br><\/div>/gi, "<br />")
    .replace(/<div><br\/><\/div>/gi, "<br />")
    .replace(/<\/div>\s*<div>/gi, "<br />")
    .replace(/^<div>/i, "")
    .replace(/<\/div>$/i, "");

  return sanitizePostHtml(html);
}

export function htmlForContentEditable(value: string): string {
  if (!value.trim()) return "";
  if (value.includes("<")) return sanitizePostHtml(value);
  return escapeHtml(value).replace(/\n/g, "<br />");
}
