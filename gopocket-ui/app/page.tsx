"use client";

import { useEffect, useState } from "react";
import { addMonths, format } from "date-fns";
import {
  ArrowTrendingDownIcon,
  CalendarDaysIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { GoalsDueSoon } from "@/components/goals-due-soon";
import { RefreshButton } from "@/components/refresh-button";
import { SummaryCard, SummaryCardSkeleton } from "@/components/summary-card";
import { UpcomingPayments } from "@/components/upcoming-payments";
import { useI18n } from "@/contexts/i18n-context";
import { useRequest } from "@/hooks/use-request";
import { goalService } from "@/services/goal.service";
import { transactionService } from "@/services/transaction.service";
import { TransactionType } from "@/types/transaction-type";
import { translateErrorKey } from "@/utils/api-error";
import { formatCurrencyString } from "@/utils/currency";
import { goalsByMonth, sortByDueDate, summarizePlanned } from "@/utils/home";
import { formatMonth } from "@/utils/time";

/** A request that has not settled yet, including the render before its first call. */
const isPending = (request: {
  loading: boolean;
  result: unknown;
  error: string | null;
}): boolean => request.loading || (request.result === null && !request.error);

const paymentsLabel = (count: number, one: string, many: string): string =>
  `${count} ${count === 1 ? one : many}`;

export default function HomePage() {
  const { t, locale } = useI18n();
  // Refreshed together with the data so "today" never goes stale on a page
  // that was left open overnight.
  const [now, setNow] = useState(() => new Date());

  const planned = useRequest({
    callback: () =>
      transactionService.getAllPlanned({ type: TransactionType.EXPENSE }),
  });
  // What was actually spent this month: the same figure the dashboard shows.
  const month = useRequest({
    callback: () =>
      transactionService.getDashboard("month", format(new Date(), "yyyy-MM")),
  });
  const goals = useRequest({ callback: () => goalService.getAll() });

  const loadAll = () => {
    planned.call();
    month.call();
    goals.call();
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleRefresh = () => {
    setNow(new Date());
    loadAll();
  };

  const payments = sortByDueDate(planned.result ?? []);
  const summary = summarizePlanned(payments, now);
  const dueGoals = goalsByMonth(goals.result ?? [], now);

  const plannedPending = isPending(planned);
  const monthPending = isPending(month);
  const goalsPending = isPending(goals);

  const errors = [planned, month, goals]
    .filter((request) => request.error)
    .map((request) => translateErrorKey(request.errorKey, t));

  return (
    <div className="space-y-7">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="mt-2 text-3xl font-semibold text-base-content">
            {t("home.title")}
          </h1>
          <p className="mt-2 text-sm text-base-content/65">
            {t("home.description")}
          </p>
        </div>
        <RefreshButton
          onClick={handleRefresh}
          loading={plannedPending || monthPending || goalsPending}
        />
      </header>

      {errors.map((message, index) => (
        <div key={index} className="alert alert-error">
          {message}
        </div>
      ))}

      <section className="grid gap-4 md:grid-cols-3">
        {monthPending ? (
          <SummaryCardSkeleton />
        ) : (
          <SummaryCard
            label={t("home.spentThisMonth")}
            value={formatCurrencyString(month.result?.summary.total_expenses ?? 0)}
            hint={formatMonth(now, locale)}
            icon={<ArrowTrendingDownIcon className="h-5 w-5" />}
            accent="text-destructive"
            className="bg-destructive/20 border border-destructive"
          />
        )}
        {plannedPending ? (
          <SummaryCardSkeleton />
        ) : (
          <SummaryCard
            label={t("home.remainingThisMonth")}
            value={formatCurrencyString(summary.thisMonthAmount)}
            hint={paymentsLabel(
              summary.thisMonthCount,
              t("home.payment"),
              t("home.payments"),
            )}
            icon={<ClockIcon className="h-5 w-5" />}
            accent="text-secondary"
            className="bg-secondary/20 border border-secondary"
          />
        )}
        {plannedPending ? (
          <SummaryCardSkeleton />
        ) : (
          <SummaryCard
            label={t("home.expectedNextMonth")}
            value={formatCurrencyString(summary.nextMonthAmount)}
            hint={`${formatMonth(addMonths(now, 1), locale)} · ${paymentsLabel(
              summary.nextMonthCount,
              t("home.payment"),
              t("home.payments"),
            )}`}
            icon={<CalendarDaysIcon className="h-5 w-5" />}
            accent="text-primary"
            className="bg-primary-20 border border-success"
          />
        )}
      </section>

      <UpcomingPayments payments={payments} now={now} loading={plannedPending} />

      <GoalsDueSoon goals={dueGoals} now={now} loading={goalsPending} />
    </div>
  );
}
