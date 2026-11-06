"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { communityAccentColor, communityInitials } from "@/lib/communities/slug";
import { isUsableImageUrl } from "@/lib/utils/initials";

type CommunityCoverImageProps = {
  name: string;
  slug: string;
  coverImageUrl: string | null;
};

export function CommunityCoverImage({
  name,
  slug,
  coverImageUrl,
}: CommunityCoverImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [coverImageUrl]);

  const showImage = isUsableImageUrl(coverImageUrl) && !failed;
  const initials = communityInitials(name);
  const accent = communityAccentColor(slug);

  if (showImage) {
    return (
      <Image
        src={coverImageUrl}
        alt={`${name} cover`}
        fill
        unoptimized
        className="object-cover object-center"
        priority
        sizes="(max-width: 768px) 100vw, 1200px"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-2"
      style={{
        background: `linear-gradient(135deg, ${accent} 0%, color-mix(in srgb, ${accent} 55%, #0f172a) 100%)`,
      }}
      role="img"
      aria-label={`${name} cover`}
    >
      <span className="text-3xl font-bold tracking-tight text-white/95 md:text-4xl">
        {initials}
      </span>
      <span className="max-w-[80%] truncate text-sm font-medium text-white/80">{name}</span>
    </div>
  );
}
