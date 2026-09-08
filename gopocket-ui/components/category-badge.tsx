import { Category } from "@/types/models"
import { getForegroundContrastColor } from "@/utils/color";

interface ICategoryBadge {
    category: Category;
}

export default function CategoryBadge({ category: { name, color } }: ICategoryBadge) {
    const foregroundColor = getForegroundContrastColor(color)
    return (
        <span className={`py-1 px-2 rounded uppercase text-xs font-bold`} style={{
            backgroundColor: color,
            color: foregroundColor
        }}>
            {name}
        </span>
    )
}