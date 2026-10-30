"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { updateProfilePhoto } from "@/lib/auth/profile-actions";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

type AvatarUploadProps = {
  fullName: string;
  avatarUrl: string | null;
};

export function AvatarUpload({ fullName, avatarUrl }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [preview, setPreview] = useState<string | null>(avatarUrl);

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED.has(file.type)) {
      toast.error("Use JPEG, PNG, WebP, or GIF.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Image must be 5 MB or smaller.");
      return;
    }

    setPending(true);
    setPreview(URL.createObjectURL(file));

    try {
      const formData = new FormData();
      formData.set("photo", file);
      const result = await updateProfilePhoto(formData);
      if (result.error) {
        toast.error(result.error);
        setPreview(avatarUrl);
      } else {
        toast.success("Profile photo updated.");
        if (result.photo) setPreview(result.photo);
      }
    } finally {
      setPending(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
      <div className="relative shrink-0">
        <Avatar src={preview} alt={fullName} fallback={fullName} size="xl" />
        <span className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-border/80 ring-offset-2 ring-offset-page-secondary/40" />
      </div>
      <div className="min-w-0 flex-1 space-y-3">
        <div>
          <p className="text-base font-semibold text-foreground">{fullName || "Your profile"}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            JPG, PNG, WebP, or GIF · 5 MB max
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={onFileChange}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          className="gap-2"
          onClick={() => inputRef.current?.click()}
        >
          <Camera className="h-4 w-4" aria-hidden />
          {pending ? "Uploading…" : "Upload photo"}
        </Button>
      </div>
    </div>
  );
}
