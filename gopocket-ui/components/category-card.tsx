import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Button } from "./button";
import { Category } from "@/types/models";

interface CategoryCardProps {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
}

export function CategoryCard({
  category,
  onEdit,
  onDelete,
}: CategoryCardProps) {
  return (
    <div
      key={category.id}
      className="group relative overflow-hidden rounded-lg bg-base-100 p-4 border border-light-gray"
      style={{ backgroundColor: `${category.color}10` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ backgroundColor: category.color }}
          >
            <span className="text-lg text-white">{category.icon}</span>
          </div>
          <div>
            <h2 className="font-semibold text-base-content">{category.name}</h2>
            <p className="text-xs text-base-content/70">{category.type}</p>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button className="text-xs p-1!" onClick={onEdit} variation="neutral">
          <PencilIcon className="h-4 w-4" />
        </Button>
        <Button
          className="text-xs p-1!"
          onClick={onDelete}
          variation="destructive"
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
