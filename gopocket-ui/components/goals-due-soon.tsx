"use client";

import Link from "next/link";
import { addMonths, parseISO } from "date-fns";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/button";
import { GoalCardSkeleton } from "@/components/goal-card";
import { GoalSummary } from "@/components/goal-summary";
import { useI18n } from "@/contexts/i18n-context";
import type { Goal } from "@/types/models";
import type { GoalsByMonth } from "@/utils/home";
import { formatDate, formatMonth } from "@/utils/time";

interface GoalsDueSoonProps {
  goals: GoalsByMonth;
  now: Date;
  loading: boolean;
}

/** Goals due this month and next month, side by side so the two are easy to tell apart. */
export function GoalsDueSoon({ goals, now, loading }: GoalsDueSoonProps) {
  const { t } = useI18n();

  return (
    <section className="overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/5">
      <div className="flex flex-col gap-3 border-b border-foreground/10 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t("home.goals.title")}</h2>
          <p className="text-sm text-base-content/60">
            {t("home.goals.description")}
          </p>
        </div>
        <Link href="/goals">
          <Button variation="neutral">
            {t("home.viewGoals")} <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-2">
        <MonthColumn
          label={t("home.goals.thisMonth")}
          month={now}
          goals={goals.thisMonth}
          emptyLabel={t("home.goals.emptyThisMonth")}
          loading={loading}
        />
        <MonthColumn
          label={t("home.goals.nextMonth")}
          month={addMonths(now, 1)}
          goals={goals.nextMonth}
          emptyLabel={t("home.goals.emptyNextMonth")}
          loading={loading}
        />
      </div>
    </section>
  );
}

interface MonthColumnProps {
  label: string;
  month: Date;
  goals: Goal[];
  emptyLabel: string;
  loading: boolean;
}

function MonthColumn({
  label,
  month,
  goals,
  emptyLabel,
  loading,
}: MonthColumnProps) {
  const { locale } = useI18n();

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-2 border-b border-foreground/10 pb-2">
        <h3 className="font-semibold">{label}</h3>
        <span className="text-sm capitalize text-foreground/60">
          {formatMonth(month, locale)}
        </span>
      </div>

      {loading ? (
        <GoalCardSkeleton />
      ) : goals.length === 0 ? (
        <p className="rounded-xl border border-dashed border-foreground/15 p-4 text-center text-sm text-foreground/60">
          {emptyLabel}
        </p>
      ) : (
        goals.map((goal) => <DueGoalCard key={goal.id} goal={goal} />)
      )}
    </div>
  );
}

function DueGoalCard({ goal }: { goal: Goal }) {
  const { t, locale } = useI18n();

  return (
    <div className="space-y-3 rounded-xl border border-foreground/15 bg-background/60 p-4">
      <div className="min-w-0">
        <h4 className="truncate text-base font-semibold" title={goal.name}>
          {goal.name}
        </h4>
        {goal.due_at ? (
          <p className="text-xs text-foreground/60">
            {t("goals.summary.dueOn")} {formatDate(parseISO(goal.due_at), locale)}
          </p>
        ) : null}
      </div>
      <GoalSummary goal={goal} />
    </div>
  );
}
