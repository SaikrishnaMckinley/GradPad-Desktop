export type PostReactionType =
  | "like"
  | "celebrate"
  | "love"
  | "insightful"
  | "funny"
  | "support";

export const POST_REACTIONS: {
  type: PostReactionType;
  label: string;
  icon: string;
}[] = [
  { type: "like", label: "Like", icon: "/svgs/like.svg" },
  { type: "celebrate", label: "Celebrate", icon: "/svgs/celebrate.svg" },
  { type: "love", label: "Love", icon: "/svgs/love.svg" },
  { type: "insightful", label: "Insightful", icon: "/svgs/insightful.svg" },
  { type: "funny", label: "Funny", icon: "/svgs/funny.svg" },
  { type: "support", label: "Support", icon: "/svgs/support.svg" },
];

export function normalizeReactionType(raw: string | null | undefined): PostReactionType {
  const key = raw?.trim().toLowerCase();
  const match = POST_REACTIONS.find((r) => r.type === key);
  return match?.type ?? "like";
}

export function reactionMeta(type: PostReactionType) {
  return POST_REACTIONS.find((r) => r.type === type) ?? POST_REACTIONS[0];
}
