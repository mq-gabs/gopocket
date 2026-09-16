"use client";

import CategoryBadge from "@/components/category-badge";
import type { Category } from "@/types/models";
import { cls } from "@/utils/cls";

interface CategoryMultiSelectProps {
  id?: string;
  label: string;
  categories: Category[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  error?: string;
}

export function CategoryMultiSelect({
  id,
  label,
  categories,
  selectedIds,
  onChange,
  error,
}: CategoryMultiSelectProps) {
  const toggle = (categoryId: string) => {
    if (selectedIds.includes(categoryId)) {
      onChange(selectedIds.filter((value) => value !== categoryId));
    } else {
      onChange([...selectedIds, categoryId]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span id={id} className="text-sm font-medium text-base-content">
        {label}
      </span>
      <div
        role="group"
        aria-labelledby={id}
        className="flex flex-wrap gap-2 rounded-lg border border-light-gray px-3 py-2"
      >
        {categories.length === 0 ? (
          <span className="text-sm text-foreground/60">—</span>
        ) : (
          categories.map((category) => {
            const active = selectedIds.includes(category.id);
            return (
              <button
                key={category.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(category.id)}
                className={cls(
                  "rounded-full transition cursor-pointer",
                  active
                    ? "ring-2 ring-primary"
                    : "opacity-50 hover:opacity-100",
                )}
              >
                <CategoryBadge category={category} />
              </button>
            );
          })
        )}
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
