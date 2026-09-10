"use client";

import { useState } from "react";
import { type CategoryIcon } from "@/constants/category-icons";
import { useI18n } from "@/contexts/i18n-context";
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/types/models";
import { Button } from "./button";
import { InputLabel } from "./inputs/input-label";
import { useMyState } from "@/app/hooks/use-my-state";
import { TransactionType } from "@/types/transaction-type";

interface CategoryFormProps {
  initialValues?: Category;
  onSubmit: (payload: CreateCategoryPayload | UpdateCategoryPayload) => void;
  onCancel?: () => void;
  submitLabel: string;
}

export function CategoryForm({
  initialValues,
  onSubmit,
  submitLabel,
  onCancel,
}: CategoryFormProps) {
  const { t } = useI18n();
  const name = useMyState<string>(initialValues?.name ?? "");
  const [icon] = useState<CategoryIcon>(
    (initialValues?.icon as CategoryIcon) ?? "wallet",
  );
  const [color, setColor] = useState(initialValues?.color ?? "#09BC8A");
  const [type] = useState(initialValues?.type ?? TransactionType.EXPENSE);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({ name: name.value, icon, color, type });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <InputLabel
        id="name"
        label={t("categories.form.name")}
        value={name.value}
        onChange={name.onChange}
        required
      />
      <InputLabel
        id="color"
        label={t("categories.form.color")}
        type="color"
        className="h-12 cursor-pointer"
        value={color}
        onChange={(event) => setColor(event.target.value)}
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variation="neutral" onClick={onCancel}>
            {t("actions.cancel")}
          </Button>
        )}
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
