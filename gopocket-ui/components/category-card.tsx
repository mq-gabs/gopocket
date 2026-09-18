import Link from "next/link";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Button } from "./button";
import { Category } from "@/types/models";
import CategoryBadge from "./category-badge";
import { Skeleton } from "./skeleton";

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
      className="group relative overflow-hidden rounded-xl bg-foreground/5 p-4 border border-foreground/15"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/transactions?category_ids=${category.id}`}
            className="transition hover:brightness-110"
          >
            <CategoryBadge category={category} />
          </Link>
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

export function CategoryCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-foreground/5 p-4 border border-foreground/15">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-28 rounded-lg" />
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Skeleton className="h-6 w-6 rounded-lg" />
        <Skeleton className="h-6 w-6 rounded-lg" />
      </div>
    </div>
  );
}
