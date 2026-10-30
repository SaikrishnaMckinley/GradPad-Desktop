"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bold, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  htmlForContentEditable,
  normalizeContentEditableHtml,
  plainTextFromPostHtml,
} from "@/lib/posts/rich-text";
import { cn } from "@/lib/utils/cn";

const QUICK_EMOJIS = [
  "😀", "😊", "🎉", "🔥", "💚", "🧡", "👏", "🙏", "💡", "🚀",
  "❤️", "👍", "✨", "🎓", "📍", "💼", "🤝", "🌍", "⭐", "📸",
  "🥳", "💯", "✅", "👀", "🙌", "💪", "🎯", "📣", "🏆", "☕",
];

type Props = {
  id: string;
  name: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  maxPlainLength: number;
  minRows?: number;
  placeholder?: string;
  required?: boolean;
};

export function PostDescriptionEditor({
  id,
  name,
  label = "Description",
  value,
  onChange,
  maxPlainLength,
  minRows = 6,
  placeholder = "Share your thoughts",
  required,
}: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(value);
  const [emojiOpen, setEmojiOpen] = useState(false);

  const plainLength = plainTextFromPostHtml(value).length;
  const minHeight = Math.max(140, minRows * 24);

  const syncFromEditor = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const normalized = normalizeContentEditableHtml(el.innerHTML);
    if (plainTextFromPostHtml(normalized).length > maxPlainLength) {
      el.innerHTML = htmlForContentEditable(valueRef.current);
      return;
    }
    valueRef.current = normalized;
    onChange(normalized);
  }, [maxPlainLength, onChange]);

  useEffect(() => {
    valueRef.current = value;
    const el = editorRef.current;
    if (!el) return;
    const current = normalizeContentEditableHtml(el.innerHTML);
    if (current !== value) {
      el.innerHTML = htmlForContentEditable(value) || "";
    }
  }, [value]);

  useEffect(() => {
    if (!emojiOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (!emojiRef.current?.contains(e.target as Node)) {
        setEmojiOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [emojiOpen]);

  function focusEditor() {
    editorRef.current?.focus();
  }

  function onBold() {
    focusEditor();
    document.execCommand("bold", false);
    syncFromEditor();
  }

  function onEmoji(emoji: string) {
    focusEditor();
    document.execCommand("insertText", false, emoji);
    syncFromEditor();
    setEmojiOpen(false);
  }

  return (
    <div>
      {label ? (
        <label className="mb-1.5 block text-sm font-medium" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <input type="hidden" name={name} value={value} />
      <div className="overflow-hidden rounded-xl border border-input-border bg-card focus-within:ring-2 focus-within:ring-primary/30">
        <div className="flex items-center gap-1 border-b border-border bg-page-secondary/50 px-2 py-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            aria-label="Bold"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onBold}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <div className="relative" ref={emojiRef}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn("h-8 w-8 p-0", emojiOpen && "bg-page-secondary")}
              aria-label="Insert emoji"
              aria-expanded={emojiOpen}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setEmojiOpen((v) => !v)}
            >
              <Smile className="h-4 w-4" />
            </Button>
            {emojiOpen ? (
              <div className="absolute left-0 top-full z-30 mt-1 grid w-[220px] grid-cols-6 gap-0.5 rounded-xl border border-border bg-card p-2 shadow-lg">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-lg hover:bg-page-secondary"
                    onClick={() => onEmoji(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <span className="ml-auto text-xs text-muted-foreground">Bold · Emoji</span>
        </div>
        <div
          ref={editorRef}
          id={id}
          role="textbox"
          aria-multiline
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder}
          onInput={syncFromEditor}
          onBlur={syncFromEditor}
          className={cn(
            "min-h-[140px] w-full resize-y overflow-y-auto px-4 py-3 text-sm leading-relaxed focus-visible:outline-none",
            "empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]",
            "[&_strong]:font-semibold [&_b]:font-semibold",
          )}
          style={{ minHeight }}
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
        <span>Select text and tap Bold, or pick an emoji</span>
        <span className={cn(plainLength > maxPlainLength * 0.9 && "text-primary")}>
          {plainLength.toLocaleString()} / {maxPlainLength.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
