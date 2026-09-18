"use client";

import { useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useI18n } from "@/contexts/i18n-context";
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/types/models";
import { Button } from "./button";
import { InputLabel } from "./inputs/input-label";
import { useMyState } from "@/app/hooks/use-my-state";

interface CategoryFormProps {
  initialValues?: Category;
  onSubmit: (payload: CreateCategoryPayload | UpdateCategoryPayload) => void;
  onCancel?: () => void;
  submitLabel: string;
  loading?: boolean;
}

export function CategoryForm({
  initialValues,
  onSubmit,
  submitLabel,
  onCancel,
  loading = false,
}: CategoryFormProps) {
  const { t } = useI18n();
  const name = useMyState<string>(initialValues?.name ?? "");
  const [color, setColor] = useState(initialValues?.color ?? "#09BC8A");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({ name: name.value, color });
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
