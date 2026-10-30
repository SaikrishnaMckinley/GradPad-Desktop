"use client";

import { useRef, useState } from "react";
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
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

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
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
      <Avatar src={preview} alt={fullName} fallback={fullName} size="xl" />
      <div className="space-y-2 text-center sm:text-left">
        <p className="text-sm font-medium">Profile photo</p>
        <p className="text-xs text-muted-foreground">Same upload flow as gradpad-web (PATCH users/detail/).</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={onFileChange}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
        >
          {pending ? "Uploading…" : "Change photo"}
        </Button>
      </div>
    </div>
  );
}
