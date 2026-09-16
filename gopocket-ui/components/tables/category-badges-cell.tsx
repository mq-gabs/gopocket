import CategoryBadge from "@/components/category-badge";
import type { Category } from "@/types/models";

const MAX_VISIBLE = 3;

interface CategoryBadgesCellProps {
  categories: Category[];
}

export function CategoryBadgesCell({ categories }: CategoryBadgesCellProps) {
  if (categories.length === 0) {
    return <span className="text-foreground/60">—</span>;
  }

  const visible = categories.slice(0, MAX_VISIBLE);
  const hiddenCount = categories.length - visible.length;

  return (
    <div className="flex flex-wrap items-center justify-right gap-1">
      {visible.map((category) => (
        <CategoryBadge key={category.id} category={category} />
      ))}
      {hiddenCount > 0 ? (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-light-gray/50 px-1.5 text-xs font-bold text-foreground">
          +{hiddenCount}
        </span>
      ) : null}
    </div>
  );
}
