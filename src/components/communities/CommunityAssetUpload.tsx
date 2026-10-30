"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateCommunityImageUrls } from "@/lib/communities/actions";
import { createClient } from "@/lib/supabase/client";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

type Props = {
  communityId: string;
  slug: string;
  kind: "logo" | "cover";
  label: string;
};

export function CommunityAssetUpload({ communityId, slug, kind, label }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED.has(file.type)) {
      toast.error("Use JPEG, PNG, WebP, or GIF.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Image must be 10 MB or smaller.");
      return;
    }

    setPending(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${communityId}/${kind}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("community-assets")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) {
        toast.error(uploadError.message);
        return;
      }

      const { data: publicUrl } = supabase.storage
        .from("community-assets")
        .getPublicUrl(path);
      const url = `${publicUrl.publicUrl}?v=${Date.now()}`;

      const result = await updateCommunityImageUrls(
        communityId,
        slug,
        kind === "logo" ? { logoUrl: url } : { coverImageUrl: url },
      );

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(`${label} updated`);
      window.location.reload();
    } finally {
      setPending(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
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
        {pending ? "Uploading…" : `Upload ${label.toLowerCase()}`}
      </Button>
    </>
  );
}
