"use client";

import { useMemo, useState } from "react";
import { TranslateFunction, useI18n } from "@/contexts/i18n-context";
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
import { TransactionType } from "@/types/transaction-type";

const buildTypeOptions = (t: TranslateFunction) => [
  {
    value: TransactionType.EXPENSE,
    label: t("categories.form.type.expense"),
  },
  {
    value: TransactionType.INCOME,
    label: t("categories.form.type.income"),
  },
];

interface TransactionFormProps {
  categories: Category[];
  initialValues?: Transaction;
  onSubmit: (
    payload: CreateTransactionPayload | UpdateTransactionPayload,
  ) => void;
  onCancel?: () => void;
  submitLabel: string;
}

export function TransactionForm({
  categories,
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
}: TransactionFormProps) {
  const { t } = useI18n();
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(
    initialValues?.description ?? "",
  );
  const [amount, setAmount] = useState(initialValues?.amount ?? 0);
  const [type, setType] = useState(
    initialValues?.type ?? TransactionType.EXPENSE,
  );
  const [categoryId, setCategoryId] = useState(
    initialValues?.category_id ?? categories[0]?.id ?? "",
  );
  const [transactionDate, setTransactionDate] = useState(
    initialValues?.paid_at?.slice(0, 10) ??
      new Date().toISOString().slice(0, 10),
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({
      title,
      description,
      amount,
      type,
      category_id: categoryId,
      paid_at: new Date(`${transactionDate}T12:00:00`).toISOString(),
    });
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
        onChange={(event) => setType(event.target.value as TransactionType)}
        options={buildTypeOptions(t)}
      />

      <InputLabel
        id="transaction-date"
        label={t("transactions.form.date")}
        type="date"
        value={transactionDate}
        onChange={(event) => setTransactionDate(event.target.value)}
        required
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
