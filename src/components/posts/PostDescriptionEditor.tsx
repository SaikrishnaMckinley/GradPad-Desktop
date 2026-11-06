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
  const [compactViewport, setCompactViewport] = useState(false);

  const plainLength = plainTextFromPostHtml(value).length;

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setCompactViewport(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const minHeight = compactViewport
    ? Math.max(112, minRows * 20)
    : Math.max(140, minRows * 24);

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
        <label className="mb-1 block text-xs font-medium md:mb-1.5 md:text-sm" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <input type="hidden" name={name} value={value} />
      <div className="overflow-hidden rounded-lg border border-input-border bg-card focus-within:ring-2 focus-within:ring-primary/30 md:rounded-xl">
        <div className="flex items-center gap-0.5 border-b border-border bg-page-secondary/50 px-1.5 py-1 md:gap-1 md:px-2 md:py-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 md:h-8 md:w-8"
            aria-label="Bold"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onBold}
          >
            <Bold className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </Button>
          <div className="relative" ref={emojiRef}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn("h-7 w-7 p-0 md:h-8 md:w-8", emojiOpen && "bg-page-secondary")}
              aria-label="Insert emoji"
              aria-expanded={emojiOpen}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setEmojiOpen((v) => !v)}
            >
              <Smile className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </Button>
            {emojiOpen ? (
              <div className="absolute left-0 top-full z-30 mt-1 grid w-[200px] grid-cols-6 gap-0.5 rounded-lg border border-border bg-card p-1.5 shadow-lg md:w-[220px] md:rounded-xl md:p-2">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded-md text-base hover:bg-page-secondary md:h-8 md:w-8 md:rounded-lg md:text-lg"
                    onClick={() => onEmoji(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <span className="ml-auto text-[10px] text-muted-foreground md:text-xs">Bold · Emoji</span>
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
            "w-full resize-y overflow-y-auto px-3 py-2 text-xs leading-relaxed focus-visible:outline-none md:px-4 md:py-3 md:text-sm",
            "empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]",
            "[&_strong]:font-semibold [&_b]:font-semibold",
          )}
          style={{ minHeight }}
        />
      </div>
      <div className="mt-1 flex items-center justify-between gap-2 text-[10px] text-muted-foreground md:mt-1.5 md:text-xs">
        <span className="min-w-0 leading-snug">Select text and tap Bold, or pick an emoji</span>
        <span className={cn(plainLength > maxPlainLength * 0.9 && "text-primary")}>
          {plainLength.toLocaleString()} / {maxPlainLength.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
