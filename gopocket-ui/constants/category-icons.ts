export const CATEGORY_ICONS = [
  "shopping-bag",
  "home",
  "wallet",
  "briefcase",
  "gift",
  "sparkles",
  "heart",
  "car",
  "book",
  "pizza",
  "plane",
  "music",
  "film",
  "computer-desktop",
  "currency-dollar",
] as const;

export type CategoryIcon = (typeof CATEGORY_ICONS)[number];
