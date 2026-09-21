"use client";

import { useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useI18n } from "@/contexts/i18n-context";
import type { CreateGoalPayload, Goal } from "@/types/models";
import { Button } from "./button";
import { CurrencyInput } from "./inputs/currency-input";
import { DatePicker } from "./inputs/date-picker";
import { InputLabel } from "./inputs/input-label";
import { TextareaLabel } from "./textarea/textarea-label";

interface GoalFormProps {
  initialValues?: Goal;
  onSubmit: (payload: CreateGoalPayload) => void;
  onCancel?: () => void;
  submitLabel: string;
  loading?: boolean;
}

export function GoalForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
  loading = false,
}: GoalFormProps) {
  const { t } = useI18n();
  const [name, setName] = useState(initialValues?.name ?? "");
  const [description, setDescription] = useState(
    initialValues?.description ?? "",
  );
  const [totalAmount, setTotalAmount] = useState(
    initialValues?.total_amount ?? 0,
  );
  // "" means no due date.
  const [dueAt, setDueAt] = useState(initialValues?.due_at ?? "");
  const [amountError, setAmountError] = useState<string | null>(null);

  const handleAmountChange = (value: number) => {
    setTotalAmount(value);
    if (value > 0) {
      setAmountError(null);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (totalAmount <= 0) {
      setAmountError(t("common.required"));
      return;
    }

    onSubmit({
      name: name.trim(),
      description,
      total_amount: totalAmount,
      due_at: dueAt || null,
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <InputLabel
        id="goal-name"
        label={t("goals.form.name")}
        value={name}
        maxLength={64}
        onChange={(event) => setName(event.target.value)}
        required
      />

      <TextareaLabel
        id="goal-description"
        label={t("goals.form.description")}
        value={description}
        maxLength={1024}
        onChange={(event) => setDescription(event.target.value)}
      />

      <div>
        <CurrencyInput
          id="goal-total-amount"
          label={t("goals.form.totalAmount")}
          value={totalAmount}
          onChange={handleAmountChange}
          required
        />
        {amountError ? (
          <p className="mt-1 text-xs text-destructive">{amountError}</p>
        ) : null}
      </div>

      <div>
        <DatePicker
          id="goal-due-at"
          label={t("goals.form.dueAt")}
          value={dueAt}
          onChange={setDueAt}
        />
        {dueAt ? (
          <button
            type="button"
            onClick={() => setDueAt("")}
            className="mt-1 cursor-pointer text-xs text-foreground/60 underline hover:text-foreground"
          >
            {t("goals.form.clearDueDate")}
          </button>
        ) : null}
      </div>

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
