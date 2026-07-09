"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/contexts/i18n-context";
import type { Category, CreateTransactionPayload, Transaction, UpdateTransactionPayload } from "@/types/models";
import { Button } from "./button";

interface TransactionFormProps {
  categories: Category[];
  initialValues?: Transaction;
  onSubmit: (payload: CreateTransactionPayload | UpdateTransactionPayload) => void;
  submitLabel: string;
}

export function TransactionForm({ categories, initialValues, onSubmit, submitLabel }: TransactionFormProps) {
  const { t } = useI18n();
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [amount, setAmount] = useState(initialValues?.amount ?? 0);
  const [type, setType] = useState(initialValues?.type ?? "EXPENSE");
  const [categoryId, setCategoryId] = useState(initialValues?.category_id ?? categories[0]?.id ?? "");

  useEffect(() => {
    setTitle(initialValues?.title ?? "");
    setDescription(initialValues?.description ?? "");
    setAmount(initialValues?.amount ?? 0);
    setType(initialValues?.type ?? "EXPENSE");
    setCategoryId(initialValues?.category_id ?? categories[0]?.id ?? "");
  }, [categories, initialValues]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({ title, description, amount, type, category_id: categoryId });
  };

  const categoryOptions = useMemo(() => categories, [categories]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="form-control w-full">
        <span className="label-text">{t("transactions.form.title")}</span>
        <input className="input input-bordered" value={title} onChange={(event) => setTitle(event.target.value)} required />
      </label>

      <label className="form-control w-full">
        <span className="label-text">{t("transactions.form.description")}</span>
        <textarea className="textarea textarea-bordered" value={description} onChange={(event) => setDescription(event.target.value)} />
      </label>

      <label className="form-control w-full">
        <span className="label-text">{t("transactions.form.amount")}</span>
        <input type="number" className="input input-bordered" value={amount} onChange={(event) => setAmount(Number(event.target.value))} required />
      </label>

      <label className="form-control w-full">
        <span className="label-text">{t("transactions.form.type")}</span>
        <select className="select select-bordered" value={type} onChange={(event) => setType(event.target.value as "EXPENSE" | "INCOME") }>
          <option value="EXPENSE">{t("categories.form.type.expense")}</option>
          <option value="INCOME">{t("categories.form.type.income")}</option>
        </select>
      </label>

      <label className="form-control w-full">
        <span className="label-text">{t("transactions.form.category")}</span>
        <select className="select select-bordered" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
          {categoryOptions.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <div className="flex justify-end">
        <Button className="btn btn-primary" type="submit">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
