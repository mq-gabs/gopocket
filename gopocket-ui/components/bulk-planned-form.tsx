"use client";

import { useMemo, useState } from "react";
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
import { TransactionType } from "@/types/transaction-type";

interface BulkPlannedFormProps {
  categories: Category[];
  onSubmit: (payload: CreateBulkPlannedTransactionsPayload) => void;
  onCancel?: () => void;
  submitLabel: string;
  loading?: boolean;
}

const currentMonth = new Date().toISOString().slice(0, 7);
const currentDay = new Date().getDate();

function countMonthsInclusive(startMonth: string, endMonth: string): number {
  const [startYear, startMonthNum] = startMonth.split("-").map(Number);
  const [endYear, endMonthNum] = endMonth.split("-").map(Number);
  if (!startYear || !startMonthNum || !endYear || !endMonthNum) return 0;

  return (endYear - startYear) * 12 + (endMonthNum - startMonthNum) + 1;
}

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
  const [dueDay, setDueDay] = useState(currentDay);
  const [startMonth, setStartMonth] = useState(currentMonth);
  const [endMonth, setEndMonth] = useState(currentMonth);

  const count = useMemo(
    () => countMonthsInclusive(startMonth, endMonth),
    [startMonth, endMonth],
  );
  const isRangeValid = count > 0;

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

    if (!isRangeValid) {
      return;
    }

    onSubmit({
      title,
      description,
      amount,
      type,
      category_ids: categoryIds,
      due_day: dueDay,
      start_month: startMonth,
      end_month: endMonth,
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
        label={t("transactions.form.amount")}
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

      <InputLabel
        id="bulk-due-day"
        label={t("planned.bulk.dueDay")}
        type="number"
        min={1}
        max={31}
        value={dueDay}
        onChange={(event) => setDueDay(Number(event.target.value))}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <DatePicker
          id="bulk-start-month"
          label={t("planned.bulk.startMonth")}
          granularity="month"
          value={startMonth}
          onChange={setStartMonth}
          required
        />
        <DatePicker
          id="bulk-end-month"
          label={t("planned.bulk.endMonth")}
          granularity="month"
          value={endMonth}
          onChange={setEndMonth}
          required
        />
      </div>

      <p
        className={`text-xs ${isRangeValid ? "text-foreground/60" : "text-destructive"}`}
      >
        {isRangeValid
          ? `${count} ${t("planned.bulk.preview")}`
          : t("planned.bulk.invalidRange")}
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
