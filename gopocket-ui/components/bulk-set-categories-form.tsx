"use client";

import { useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useI18n } from "@/contexts/i18n-context";
import type { Category } from "@/types/models";
import { Button } from "./button";
import { CategoryMultiSelect } from "./category-multi-select";

interface BulkSetCategoriesFormProps {
  count: number;
  categories: Category[];
  submitLabel: string;
  onSubmit: (categoryIds: string[]) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export function BulkSetCategoriesForm({
  count,
  categories,
  submitLabel,
  onSubmit,
  onCancel,
  loading = false,
}: BulkSetCategoriesFormProps) {
  const { t } = useI18n();
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const handleCategoryChange = (ids: string[]) => {
    setCategoryIds(ids);
    if (ids.length > 0) {
      setCategoryError(null);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (categoryIds.length === 0) {
      setCategoryError(t("common.required"));
      return;
    }

    onSubmit(categoryIds);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <p className="text-sm text-foreground/70">
        {count} {t("bulkActions.selected")}
      </p>

      <CategoryMultiSelect
        id="bulk-set-category"
        label={t("transactions.form.category")}
        categories={categories}
        selectedIds={categoryIds}
        onChange={handleCategoryChange}
        error={categoryError ?? undefined}
      />

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variation="neutral" onClick={onCancel}>
            {t("actions.cancel")}
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
              {t("actions.saving")}
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}
