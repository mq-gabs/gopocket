"use client";

import { useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { TranslateFunction, useI18n } from "@/contexts/i18n-context";
import type {
  Category,
  CreateActualTransactionPayload,
  CreatePlannedTransactionPayload,
  ActualTransaction,
  PlannedTransaction,
  UpdateTransactionPayload,
} from "@/types/models";
import { Button } from "./button";
import { SelectLabel } from "./select/select-label";
import { CategoryMultiSelect } from "./category-multi-select";
import { CurrencyInput } from "./inputs/currency-input";
import { DatePicker } from "./inputs/date-picker";
import { InputLabel } from "./inputs/input-label";
import { TextareaLabel } from "./textarea/textarea-label";
import { TransactionType } from "@/types/transaction-type";

export const buildTypeOptions = (t: TranslateFunction) => [
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
  initialValues?: ActualTransaction | PlannedTransaction;
  onSubmit: (
    payload:
      | CreateActualTransactionPayload
      | CreatePlannedTransactionPayload
      | UpdateTransactionPayload,
  ) => void;
  onCancel?: () => void;
  submitLabel: string;
  /** Set to false to hide the date field and leave paid_at untouched (e.g. editing a planned transaction). */
  includeDate?: boolean;
  /** Set to true to show the due date field (creating a planned transaction). */
  includeDueDate?: boolean;
  /**
   * Whether this form edits an existing record, as opposed to creating one
   * (which also covers duplicating a record: initialValues is set to prefill
   * the fields, but submitting still creates a new record). Defaults to
   * whether initialValues is set.
   */
  isEditing?: boolean;
  loading?: boolean;
}

export function TransactionForm({
  categories,
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
  includeDate = true,
  includeDueDate = false,
  isEditing = Boolean(initialValues),
  loading = false,
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
  const [categoryIds, setCategoryIds] = useState<string[]>(
    initialValues?.category_ids ?? [],
  );
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [transactionDate, setTransactionDate] = useState(
    initialValues?.paid_at?.slice(0, 10) ??
      new Date().toISOString().slice(0, 10),
  );
  const [dueDate, setDueDate] = useState(
    (initialValues as PlannedTransaction | undefined)?.due_at?.slice(0, 10) ??
      new Date().toISOString().slice(0, 10),
  );

  const handleCategoryChange = (ids: string[]) => {
    setCategoryIds(ids);
    if (ids.length > 0) {
      setCategoryError(null);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!isEditing && categoryIds.length === 0) {
      setCategoryError(t("common.required"));
      return;
    }

    const payload: UpdateTransactionPayload &
      Partial<CreateActualTransactionPayload> &
      Partial<CreatePlannedTransactionPayload> = {
      title,
      description,
      amount,
      type,
      category_ids: categoryIds,
    };

    if (includeDate) {
      payload.paid_at = new Date(`${transactionDate}T12:00:00`).toISOString();
    }

    if (includeDueDate) {
      payload.due_at = new Date(`${dueDate}T12:00:00`).toISOString();
    }

    onSubmit(
      payload as
        | CreateActualTransactionPayload
        | CreatePlannedTransactionPayload
        | UpdateTransactionPayload,
    );
  };

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

      {includeDate && (
        <DatePicker
          id="transaction-date"
          label={t("transactions.form.date")}
          value={transactionDate}
          onChange={setTransactionDate}
          required
        />
      )}

      {includeDueDate && (
        <DatePicker
          id="transaction-due-date"
          label={t("planned.form.dueAt")}
          value={dueDate}
          onChange={setDueDate}
          required
        />
      )}

      <CategoryMultiSelect
        id="category"
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
