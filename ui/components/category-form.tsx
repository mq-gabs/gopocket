"use client";

import { useEffect, useState } from "react";
import { CATEGORY_ICONS, type CategoryIcon } from "@/constants/category-icons";
import { useI18n } from "@/contexts/i18n-context";
import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from "@/types/models";

interface CategoryFormProps {
  initialValues?: Category;
  onSubmit: (payload: CreateCategoryPayload | UpdateCategoryPayload) => void;
  submitLabel: string;
}

export function CategoryForm({ initialValues, onSubmit, submitLabel }: CategoryFormProps) {
  const { t } = useI18n();
  const [name, setName] = useState(initialValues?.name ?? "");
  const [icon, setIcon] = useState<CategoryIcon>(initialValues?.icon as CategoryIcon ?? "wallet");
  const [color, setColor] = useState(initialValues?.color ?? "#09BC8A");
  const [type, setType] = useState(initialValues?.type ?? "EXPENSE");

  useEffect(() => {
    setName(initialValues?.name ?? "");
    setIcon((initialValues?.icon as CategoryIcon) ?? "wallet");
    setColor(initialValues?.color ?? "#09BC8A");
    setType(initialValues?.type ?? "EXPENSE");
  }, [initialValues]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({ name, icon, color, type });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="form-control w-full">
        <span className="label-text">{t("categories.form.name")}</span>
        <input className="input input-bordered" value={name} onChange={(event) => setName(event.target.value)} required />
      </label>

      <label className="form-control w-full">
        <span className="label-text">{t("categories.form.icon")}</span>
        <select className="select select-bordered" value={icon} onChange={(event) => setIcon(event.target.value as CategoryIcon)}>
          {CATEGORY_ICONS.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <label className="form-control w-full">
        <span className="label-text">{t("categories.form.color")}</span>
        <input type="color" className="h-12 w-full cursor-pointer rounded-lg border border-base-300" value={color} onChange={(event) => setColor(event.target.value)} />
      </label>

      <label className="form-control w-full">
        <span className="label-text">{t("categories.form.type")}</span>
        <select className="select select-bordered" value={type} onChange={(event) => setType(event.target.value as "EXPENSE" | "INCOME") }>
          <option value="EXPENSE">{t("categories.form.type.expense")}</option>
          <option value="INCOME">{t("categories.form.type.income")}</option>
        </select>
      </label>

      <div className="flex justify-end">
        <button className="btn btn-primary" type="submit">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
