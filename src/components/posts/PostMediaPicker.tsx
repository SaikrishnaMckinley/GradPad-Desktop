"use client";

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED = /^image\/|^video\//;

type Props = {
  name?: string;
  className?: string;
};

export function PostMediaPicker({ name = "media", className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  function addFiles(incoming: FileList | null) {
    if (!incoming?.length) return;
    setError(null);
    const next: File[] = [...files];
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
    setFiles(next);
    syncInput(next);
  }

  function syncInput(list: File[]) {
    const input = inputRef.current;
    if (!input) return;
    const dt = new DataTransfer();
    list.forEach((f) => dt.items.add(f));
    input.files = dt.files;
  }

  function removeAt(index: number) {
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    syncInput(next);
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept="image/*,video/*"
          multiple
          className="sr-only"
          onChange={(e) => addFiles(e.target.files)}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="gap-2"
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus className="h-4 w-4" />
          Add photos or videos
        </Button>
        {files.length > 0 ? (
          <span className="text-xs text-muted-foreground">
            {files.length} file{files.length === 1 ? "" : "s"} attached
          </span>
        ) : null}
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {files.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {files.map((file, index) => {
            const isImage = file.type.startsWith("image/");
            const preview = isImage ? URL.createObjectURL(file) : null;
            return (
              <li
                key={`${file.name}-${index}`}
                className="relative h-20 w-20 overflow-hidden rounded-xl border border-border bg-page-secondary"
              >
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center px-1 text-[10px] text-muted-foreground">
                    Video
                  </div>
                )}
                <button
                  type="button"
                  className="absolute right-0.5 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-card/90 text-foreground shadow-sm"
                  aria-label="Remove file"
                  onClick={() => removeAt(index)}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
