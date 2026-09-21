"use client";

import {
  CalendarDaysIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useI18n } from "@/contexts/i18n-context";
import type { TranslateFunction } from "@/contexts/i18n-context";
import type { Goal } from "@/types/models";
import { cls } from "@/utils/cls";
import { formatCurrencyString } from "@/utils/currency";

const daysLabel = (days: number, t: TranslateFunction): string => {
  if (days === 0) return t("goals.summary.dueToday");
  if (days > 0) {
    return `${days} ${t(days === 1 ? "goals.summary.dayLeft" : "goals.summary.daysLeft")}`;
  }
  return `${-days} ${t(days === -1 ? "goals.summary.dayOverdue" : "goals.summary.daysOverdue")}`;
};

interface StatProps {
  label: string;
  value: string;
  dotClassName: string;
  /** Explanation shown in a tooltip next to the label. */
  hint?: string;
}

function Stat({ label, value, dotClassName, hint }: StatProps) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-xs text-foreground/60">
        <span className={cls("size-2 shrink-0 rounded-full", dotClassName)} />
        <span className="truncate">{label}</span>
        {hint ? (
          <span
            className="tooltip tooltip-top shrink-0 cursor-help"
            data-tip={hint}
            tabIndex={0}
            role="img"
            aria-label={hint}
          >
            <InformationCircleIcon className="h-3.5 w-3.5" />
          </span>
        ) : null}
      </div>
      <p className="truncate text-sm font-semibold">{value}</p>
    </div>
  );
}

interface GoalSummaryProps {
  goal: Goal;
}

/**
 * The state of a goal at a glance: how much is paid, committed (planned) and
 * left, a stacked progress bar, the time left until the due date and the
 * monthly amount needed to make it. Shared by the goal card and the drawer.
 */
export function GoalSummary({ goal }: GoalSummaryProps) {
  const { t } = useI18n();

  const completed = goal.paid_amount >= goal.total_amount;
  const hasCommitted = goal.committed_amount > 0;
  const overdue = goal.days_left !== null && goal.days_left < 0;
  const percent = completed ? 100 : Math.floor(goal.paid_percent);
  const showMonthlyNeeded =
    goal.monthly_needed !== null && goal.remaining_amount > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-lg font-semibold">
          {formatCurrencyString(goal.paid_amount)}{" "}
          <span className="text-sm font-normal text-foreground/60">
            {t("goals.summary.of")} {formatCurrencyString(goal.total_amount)}
          </span>
        </p>
        {completed ? (
          <span className="flex items-center gap-1 text-sm font-bold text-primary">
            <CheckCircleIcon className="h-4 w-4" />
            {t("goals.summary.completed")}
          </span>
        ) : (
          <span className="text-sm font-bold text-primary">{percent}%</span>
        )}
      </div>

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="flex h-2.5 w-full overflow-hidden rounded-full bg-foreground/10"
      >
        <div
          className="bg-primary transition-[width]"
          style={{ width: `${goal.paid_percent}%` }}
        />
        <div
          className="bg-secondary-60 transition-[width]"
          style={{ width: `${goal.committed_percent}%` }}
        />
      </div>

      <div
        className={cls(
          "grid gap-2",
          hasCommitted ? "grid-cols-3" : "grid-cols-2",
        )}
      >
        <Stat
          label={t("goals.summary.paid")}
          value={formatCurrencyString(goal.paid_amount)}
          dotClassName="bg-primary"
        />
        {hasCommitted ? (
          <Stat
            label={t("goals.summary.committed")}
            value={formatCurrencyString(goal.committed_amount)}
            dotClassName="bg-secondary-60"
            hint={t("goals.summary.committedHint")}
          />
        ) : null}
        <Stat
          label={t("goals.summary.remaining")}
          value={formatCurrencyString(goal.remaining_amount)}
          dotClassName="bg-foreground/20"
        />
      </div>

      <div
        className={cls(
          "flex items-center gap-1.5 text-xs",
          overdue && !completed ? "text-destructive" : "text-foreground/70",
        )}
      >
        <CalendarDaysIcon className="h-4 w-4 shrink-0" />
        <span>
          {goal.days_left === null
            ? t("goals.summary.noDueDate")
            : daysLabel(goal.days_left, t)}
        </span>
      </div>

      {showMonthlyNeeded ? (
        <div className="rounded-lg border border-foreground/10 bg-background/60 px-3 py-2">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="font-medium">
              {t("goals.summary.monthlyNeeded")}
            </span>
            <span className="font-semibold">
              {formatCurrencyString(goal.monthly_needed ?? 0)}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-foreground/60">
            {t("goals.summary.monthlyNeededHint")}
          </p>
        </div>
      ) : null}

      {overdue && !completed && goal.remaining_amount > 0 ? (
        <p className="text-xs text-destructive">
          {t("goals.summary.overdueHint")}
        </p>
      ) : null}
    </div>
  );
}
