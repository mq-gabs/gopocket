"use client";

import { useEffect, useState } from "react";
import { CATEGORY_ICONS, type CategoryIcon } from "@/constants/category-icons";
import { useI18n } from "@/contexts/i18n-context";
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/types/models";
import { Button } from "./button";
import { InputLabel } from "./inputs/input-label";
import { SelectLabel } from "./select/select-label";
import { useMyState } from "@/app/hooks/use-my-state";

interface CategoryFormProps {
  initialValues?: Category;
  onSubmit: (payload: CreateCategoryPayload | UpdateCategoryPayload) => void;
  submitLabel: string;
}

export function CategoryForm({
  initialValues,
  onSubmit,
  submitLabel,
}: CategoryFormProps) {
  const { t } = useI18n();
  const name = useMyState<string>(initialValues?.name ?? "");
  const [icon, setIcon] = useState<CategoryIcon>(
    (initialValues?.icon as CategoryIcon) ?? "wallet",
  );
  const [color, setColor] = useState(initialValues?.color ?? "#09BC8A");
  const [type, setType] = useState(initialValues?.type ?? "EXPENSE");

  useEffect(() => {
    name.set(initialValues?.name ?? "");
    setIcon((initialValues?.icon as CategoryIcon) ?? "wallet");
    setColor(initialValues?.color ?? "#09BC8A");
    setType(initialValues?.type ?? "EXPENSE");
  }, [initialValues]);

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
      <SelectLabel
        id="icon"
        label={t("categories.form.icon")}
        value={icon}
        onChange={(event) => setIcon(event.target.value as CategoryIcon)}
        options={CATEGORY_ICONS.map((icon) => ({
          value: icon,
          label: icon,
        }))}
      />
      <InputLabel
        id="color"
        label={t("categories.form.color")}
        type="color"
        className="h-12 cursor-pointer"
        value={color}
        onChange={(event) => setColor(event.target.value)}
      />
      <SelectLabel
        id="type"
        label={t("categories.form.type")}
        value={type}
        onChange={(event) =>
          setType(event.target.value as "EXPENSE" | "INCOME")
        }
        options={[
          {
            value: "EXPENSE",
            label: t("categories.form.type.expense"),
          },
          {
            value: "INCOME",
            label: t("categories.form.type.income"),
          },
        ]}
      />{" "}
      <div className="flex justify-end">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
