"use client";

import { useRef, useState } from "react";
import { Camera, ImageIcon } from "lucide-react";
import { CommunityCoverImage } from "@/components/communities/CommunityCoverImage";
import { CommunityMark } from "@/components/layout/CommunityMark";
import { Button } from "@/components/ui/button";
import { communityInitials } from "@/lib/communities/slug";
import { cn } from "@/lib/utils/cn";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const BRAND_PRIMARY = "#0b66c3";

type Props = {
  name: string;
  location: string;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  slug: string;
  className?: string;
};

function validateFile(file: File): string | null {
  if (!ALLOWED.has(file.type)) return "Use JPEG, PNG, WebP, or GIF.";
  if (file.size > MAX_BYTES) return "Image must be 10 MB or smaller.";
  return null;
}

export function CommunityFormBranding({
  name,
  location,
  logoUrl,
  coverImageUrl,
  slug,
  className,
}: Props) {
  const coverRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  const displayName = name.trim() || "Community name";
  const initials = communityInitials(displayName);
  const resolvedLogo = logoPreview ?? logoUrl ?? null;
  const hasCover = Boolean(coverPreview || coverImageUrl);

  function onCoverChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const err = validateFile(file);
    setCoverError(err);
    if (err) {
      setCoverPreview(null);
      return;
    }
    setCoverPreview(URL.createObjectURL(file));
  }

  function onLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const err = validateFile(file);
    setLogoError(err);
    if (err) {
      setLogoPreview(null);
      return;
    }
    setLogoPreview(URL.createObjectURL(file));
  }

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-card", className)}>
      <div className="relative h-40 md:h-44">
        {coverPreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverPreview} alt="" className="h-full w-full object-cover object-center" />
        ) : coverImageUrl ? (
          <CommunityCoverImage
            name={displayName}
            slug={slug || "community"}
            coverImageUrl={coverImageUrl}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-page-secondary">
            <ImageIcon className="h-8 w-8 text-muted-foreground/70" strokeWidth={1.5} />
            <span className="text-sm text-muted-foreground">Add a cover image</span>
          </div>
        )}
        <div className="absolute bottom-3 right-3">
          <input
            ref={coverRef}
            type="file"
            name="image"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={onCoverChange}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="gap-1.5 shadow-sm"
            onClick={() => coverRef.current?.click()}
          >
            <Camera className="h-4 w-4" />
            {hasCover ? "Change cover" : "Cover image"}
          </Button>
        </div>
      </div>

      <div className="relative border-t border-border px-5 pb-5 pt-0 md:px-6 md:pb-6">
        <div className="-mt-9 flex gap-4">
          <div className="relative shrink-0">
            {resolvedLogo ? (
              <CommunityMark
                name={displayName}
                initials={initials}
                accentColor={BRAND_PRIMARY}
                logoUrl={resolvedLogo}
                shape="rounded"
                size="lg"
                className="h-20 w-20 text-xl ring-4 ring-card"
              />
            ) : (
              <div
                className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-light text-xl font-semibold text-primary ring-4 ring-card"
                title={displayName}
              >
                {initials.slice(0, 1)}
              </div>
            )}
            <input
              ref={logoRef}
              type="file"
              name="logo"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={onLogoChange}
            />
            <button
              type="button"
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm hover:bg-page-secondary"
              aria-label="Change logo"
              onClick={() => logoRef.current?.click()}
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="min-w-0 flex-1 pt-10 md:pt-9">
            <h2 className="text-xl font-semibold text-foreground">{displayName}</h2>
            <p className="text-sm text-muted-foreground">
              {location.trim() || "Location (optional)"}
            </p>
          </div>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Upload a cover and logo to match your community hub. You can update these anytime from
          edit.
        </p>
        {coverError ? <p className="mt-2 text-xs text-destructive">{coverError}</p> : null}
        {logoError ? <p className="mt-1 text-xs text-destructive">{logoError}</p> : null}
      </div>
    </div>
  );
}
