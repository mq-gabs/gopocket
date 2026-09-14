import { Category } from "@/types/models";
import { getForegroundContrastColor } from "@/utils/color";

interface ICategoryBadge {
  category: Category;
  className?: string;
}

export default function CategoryBadge({
  category: { name, color },
  className = "",
}: ICategoryBadge) {
  const foregroundColor = getForegroundContrastColor(color);
  return (
    <div className={`py-1 px-2 flex gap-2 items-center ${className}`}>
      <span
        className="size-2 rounded-full border border-foreground"
        style={{
          backgroundColor: color,
          color: foregroundColor,
        }}
      ></span>
      <span className="uppercase text-xs font-bold">{name}</span>
    </div>
  );
}
