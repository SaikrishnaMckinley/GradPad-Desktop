"use client";

import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import { cn } from "@/lib/utils/cn";

type Props = {
  previewUrl: string | null;
  onPreviewChange: (url: string | null) => void;
  onFileChange: (file: File | null) => void;
};

export function EventCreateImageUpload({ previewUrl, onPreviewChange, onFileChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | null) {
    onFileChange(file);
    if (!file) {
      onPreviewChange(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onPreviewChange(reader.result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div>
      {previewUrl ? (
        <div className="relative overflow-hidden rounded-xl border border-border">
          <div className="relative aspect-[16/9] w-full">
            <Image src={previewUrl} alt="" fill className="object-cover" unoptimized />
          </div>
          <button
            type="button"
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-card/95 shadow-sm"
            onClick={() => {
              handleFile(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border",
            "bg-page-secondary/60 px-4 py-10 text-center transition-colors hover:border-primary/40 hover:bg-primary-light/20",
          )}
        >
          <ImagePlus className="h-8 w-8 text-primary" />
          <p className="mt-3 text-sm font-semibold">Upload event image</p>
          <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, WEBP or GIF — max 10MB</p>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        name="image"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
