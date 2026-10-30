"use client";

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PostMediaItem } from "@/lib/posts/post-media";

const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED = /^image\/|^video\//;

type Props = {
  existing: PostMediaItem[];
  onExistingChange: (items: PostMediaItem[]) => void;
  onNewFilesChange: (files: File[]) => void;
};

export function PostEditMediaSection({
  existing,
  onExistingChange,
  onNewFilesChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  function pushNewFiles(incoming: FileList | null) {
    if (!incoming?.length) return;
    setError(null);
    const next = [...newFiles];
    for (const file of Array.from(incoming)) {
      if (!ALLOWED.test(file.type)) {
        setError("Use image or video files only.");
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError("Each file must be 25 MB or smaller.");
        continue;
      }
      next.push(file);
    }
    setNewFiles(next);
    onNewFilesChange(next);
  }

  function removeNew(index: number) {
    const next = newFiles.filter((_, i) => i !== index);
    setNewFiles(next);
    onNewFilesChange(next);
  }

  function removeExisting(index: number) {
    onExistingChange(existing.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-page-secondary/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">Photos &amp; videos</p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="gap-2"
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus className="h-4 w-4" />
          Add more
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="sr-only"
          onChange={(e) => {
            pushNewFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      {existing.length === 0 && newFiles.length === 0 ? (
        <p className="text-xs text-muted-foreground">No media on this post yet.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {existing.map((item, index) => (
            <li
              key={`existing-${item.url}-${index}`}
              className="relative h-24 w-24 overflow-hidden rounded-xl border border-border bg-card"
            >
              {item.type.startsWith("video") ? (
                <video src={item.url} className="h-full w-full object-cover" muted />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.url} alt="" className="h-full w-full object-cover" />
              )}
              <button
                type="button"
                className="absolute right-0.5 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-card/95 shadow-sm"
                aria-label="Remove from post"
                onClick={() => removeExisting(index)}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
          {newFiles.map((file, index) => {
            const preview = file.type.startsWith("image/")
              ? URL.createObjectURL(file)
              : null;
            return (
              <li
                key={`new-${file.name}-${index}`}
                className="relative h-24 w-24 overflow-hidden rounded-xl border border-dashed border-primary/40 bg-card"
              >
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                    Video
                  </div>
                )}
                <span className="absolute bottom-0 left-0 right-0 bg-primary/80 py-0.5 text-center text-[9px] font-medium text-white">
                  New
                </span>
                <button
                  type="button"
                  className="absolute right-0.5 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-card/95 shadow-sm"
                  aria-label="Remove new file"
                  onClick={() => removeNew(index)}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
