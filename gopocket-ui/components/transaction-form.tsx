"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/contexts/i18n-context";
import type {
  Category,
  CreateTransactionPayload,
  Transaction,
  UpdateTransactionPayload,
} from "@/types/models";
import { Button } from "./button";
import { SelectLabel } from "./select/select-label";
import { CurrencyInput } from "./inputs/currency-input";
import { InputLabel } from "./inputs/input-label";
import { TextareaLabel } from "./textarea/textarea-label";

interface TransactionFormProps {
  categories: Category[];
  initialValues?: Transaction;
  onSubmit: (
    payload: CreateTransactionPayload | UpdateTransactionPayload,
  ) => void;
  submitLabel: string;
}

export function TransactionForm({
  categories,
  initialValues,
  onSubmit,
  submitLabel,
}: TransactionFormProps) {
  const { t } = useI18n();
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(
    initialValues?.description ?? "",
  );
  const [amount, setAmount] = useState(initialValues?.amount ?? 0);
  const [type, setType] = useState(initialValues?.type ?? "EXPENSE");
  const [categoryId, setCategoryId] = useState(
    initialValues?.category_id ?? categories[0]?.id ?? "",
  );

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
      <InputLabel
        id="title"
        label={t("transactions.form.title")}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        required
      />

      <TextareaLabel
        id="description"
        label={t("transactions.form.description")}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />

      <CurrencyInput
        id="amount"
        label={t("transactions.form.amount")}
        value={amount}
        onChange={(value) => setAmount(value)}
        required
      />

      <SelectLabel
        id="type"
        label={t("transactions.form.type")}
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
      />

      <SelectLabel
        id="category"
        label={t("transactions.form.category")}
        value={categoryId}
        onChange={(event) => setCategoryId(event.target.value)}
        options={categoryOptions.map((category) => ({
          value: category.id,
          label: category.name,
        }))}
      />

      <div className="flex justify-end">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
