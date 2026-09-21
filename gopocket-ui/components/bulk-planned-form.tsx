"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useI18n } from "@/contexts/i18n-context";
import type {
  Category,
  CreateBulkPlannedTransactionsPayload,
} from "@/types/models";
import { Button } from "./button";
import { buildTypeOptions } from "./transaction-form";
import { CategoryMultiSelect } from "./category-multi-select";
import { CurrencyInput } from "./inputs/currency-input";
import { DatePicker } from "./inputs/date-picker";
import { InputLabel } from "./inputs/input-label";
import { SelectLabel } from "./select/select-label";
import { TextareaLabel } from "./textarea/textarea-label";
import { formatCurrencyString } from "@/utils/currency";
import { TransactionType } from "@/types/transaction-type";

interface BulkPlannedFormProps {
  categories: Category[];
  onSubmit: (payload: CreateBulkPlannedTransactionsPayload) => void;
  onCancel?: () => void;
  submitLabel: string;
  loading?: boolean;
}

const MAX_INSTALLMENTS = 360;

const today = format(new Date(), "yyyy-MM-dd");

export function BulkPlannedForm({
  categories,
  onSubmit,
  onCancel,
  submitLabel,
  loading = false,
}: BulkPlannedFormProps) {
  const { t } = useI18n();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [type, setType] = useState(TransactionType.EXPENSE);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [installments, setInstallments] = useState(2);
  const [firstDueAt, setFirstDueAt] = useState(today);

  const areInstallmentsValid =
    Number.isInteger(installments) &&
    installments >= 1 &&
    installments <= MAX_INSTALLMENTS;
  const installmentAmount = areInstallmentsValid
    ? Math.floor(amount / installments)
    : 0;
  // The last installment absorbs whatever the equal split leaves over.
  const lastInstallmentAmount = areInstallmentsValid
    ? amount - installmentAmount * (installments - 1)
    : 0;

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

    if (!areInstallmentsValid || !firstDueAt) {
      return;
    }

    onSubmit({
      title,
      description,
      amount,
      type,
      category_ids: categoryIds,
      installments,
      first_due_at: firstDueAt,
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <InputLabel
        id="bulk-title"
        label={t("transactions.form.title")}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        required
      />

      <TextareaLabel
        id="bulk-description"
        label={t("transactions.form.description")}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />

      <CurrencyInput
        id="bulk-amount"
        label={t("planned.bulk.totalAmount")}
        value={amount}
        onChange={setAmount}
        required
      />

      <SelectLabel
        id="bulk-type"
        label={t("transactions.form.type")}
        value={type}
        onChange={(event) => setType(event.target.value as TransactionType)}
        options={buildTypeOptions(t)}
      />

      <div className="grid grid-cols-2 gap-4">
        <InputLabel
          id="bulk-installments"
          label={t("planned.bulk.installments")}
          type="number"
          min={1}
          max={MAX_INSTALLMENTS}
          value={installments}
          onChange={(event) => setInstallments(Number(event.target.value))}
          required
        />
        <DatePicker
          id="bulk-first-due-at"
          label={t("planned.bulk.firstDueAt")}
          value={firstDueAt}
          onChange={setFirstDueAt}
          required
        />
      </div>

      <p
        className={`text-xs ${areInstallmentsValid ? "text-foreground/60" : "text-destructive"}`}
      >
        {areInstallmentsValid
          ? `${installments} ${t("planned.bulk.preview")} ${formatCurrencyString(installmentAmount)}` +
            (lastInstallmentAmount !== installmentAmount
              ? ` (${t("planned.bulk.previewLast")} ${formatCurrencyString(lastInstallmentAmount)})`
              : "")
          : t("planned.bulk.invalidInstallments")}
      </p>

      <CategoryMultiSelect
        id="bulk-category"
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
