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
    <span
      className={`py-1 px-2 rounded-xl uppercase text-xs font-bold ${className}`}
      style={{
        backgroundColor: color,
        color: foregroundColor,
      }}
    >
      {name}
    </span>
  );
}
