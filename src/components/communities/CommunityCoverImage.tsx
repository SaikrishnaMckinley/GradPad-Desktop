import Image from "next/image";
import { communityInitials } from "@/lib/communities/slug";

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
  if (coverImageUrl) {
    return (
      <Image
        src={coverImageUrl}
        alt=""
        fill
        className="object-cover object-center"
        priority
        sizes="(max-width: 768px) 100vw, 1200px"
      />
    );
  }

  return (
    <div
      className="flex h-full w-full items-center justify-center bg-page-secondary"
      aria-hidden
    >
      <span className="text-sm font-medium text-muted-foreground">Cover photo</span>
      <span className="sr-only">{communityInitials(name)}</span>
    </div>
  );
}
