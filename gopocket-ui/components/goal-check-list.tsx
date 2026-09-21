"use client";

import { useI18n } from "@/contexts/i18n-context";
import type { Goal } from "@/types/models";
import { formatCurrencyString } from "@/utils/currency";

interface GoalCheckListProps {
  goals: Goal[];
  selectedIds: string[];
  onToggle: (goalId: string) => void;
  disabled?: boolean;
}

/** Checkbox list of goals with their current progress, for picking one or more. */
export function GoalCheckList({
  goals,
  selectedIds,
  onToggle,
  disabled = false,
}: GoalCheckListProps) {
  const { t } = useI18n();

  return (
    <ul className="max-h-56 space-y-2 overflow-y-auto">
      {goals.map((goal) => (
        <li key={goal.id}>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-foreground/10 px-3 py-2 hover:bg-foreground/5">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={selectedIds.includes(goal.id)}
              onChange={() => onToggle(goal.id)}
              disabled={disabled}
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">
                {goal.name}
              </span>
              <span className="block text-xs text-foreground/60">
                {formatCurrencyString(goal.paid_amount)} {t("goals.summary.of")}{" "}
                {formatCurrencyString(goal.total_amount)}
              </span>
            </span>
          </label>
        </li>
      ))}
    </ul>
  );
}
