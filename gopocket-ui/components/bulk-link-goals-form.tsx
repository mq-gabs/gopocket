"use client";

import { useEffect, useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useI18n } from "@/contexts/i18n-context";
import { useRequest } from "@/hooks/use-request";
import { goalService } from "@/services/goal.service";
import { translateErrorKey } from "@/utils/api-error";
import { formatCurrencyString } from "@/utils/currency";
import { Button } from "./button";
import { Skeleton } from "./skeleton";

interface BulkLinkGoalsFormProps {
  /** Number of selected transactions the goals will be linked to. */
  count: number;
  submitLabel: string;
  onSubmit: (goalIds: string[]) => void;
  onCancel?: () => void;
  loading?: boolean;
}

/**
 * Lists the existing goals so the user can pick the ones the selected
 * transactions (paid or planned) should be linked to.
 */
export function BulkLinkGoalsForm({
  count,
  submitLabel,
  onSubmit,
  onCancel,
  loading = false,
}: BulkLinkGoalsFormProps) {
  const { t } = useI18n();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const {
    call: getGoals,
    result: goals,
    loading: loadingGoals,
    error: goalsError,
    errorKey: goalsErrorKey,
  } = useRequest({ callback: () => goalService.getAll() });

  useEffect(() => {
    getGoals();
  }, []);

  const toggle = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (selectedIds.size === 0) {
      return;
    }

    onSubmit([...selectedIds]);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <p className="text-sm text-foreground/70">
        {count} {t("bulkActions.selected")}
      </p>

      <p className="text-sm font-medium">{t("goals.link.select")}</p>

      {goalsError ? (
        <div className="alert alert-error">
          {translateErrorKey(goalsErrorKey, t)}
        </div>
      ) : null}

      {loadingGoals ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      ) : null}

      {!loadingGoals && !goalsError && goals?.length === 0 ? (
        <p className="rounded-xl border border-foreground/10 p-4 text-center text-sm text-foreground/60">
          {t("goals.link.empty")}
        </p>
      ) : null}

      {goals && goals.length > 0 ? (
        <ul className="max-h-72 space-y-2 overflow-y-auto">
          {goals.map((goal) => (
            <li key={goal.id}>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-foreground/10 px-3 py-2 hover:bg-foreground/5">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={selectedIds.has(goal.id)}
                  onChange={() => toggle(goal.id)}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {goal.name}
                  </span>
                  <span className="block text-xs text-foreground/60">
                    {formatCurrencyString(goal.paid_amount)}{" "}
                    {t("goals.summary.of")}{" "}
                    {formatCurrencyString(goal.total_amount)}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variation="neutral" onClick={onCancel}>
            {t("actions.cancel")}
          </Button>
        )}
        <Button type="submit" disabled={loading || selectedIds.size === 0}>
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
