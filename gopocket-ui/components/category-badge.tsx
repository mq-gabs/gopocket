import { Category } from "@/types/models";

interface ICategoryBadge {
  category: Category;
  className?: string;
}

export default function CategoryBadge({
  category: { name, color },
  className = "",
}: ICategoryBadge) {
  return (
    <div
      className={`py-0 px-2 flex gap-2 items-center border border-secondary bg-secondary-20 rounded-lg ${className}`}
    >
      <span
        className="size-2 rounded-full border border-foreground"
        style={{
          backgroundColor: color,
        }}
      ></span>
      <span className="lowercase text-xs font-bold text-secondary">{name}</span>
    </div>
  );
}
