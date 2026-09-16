"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRightIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { Button, ButtonVariation } from "@/components/button";
import { TranslateFunction, useI18n } from "@/contexts/i18n-context";
import type { Locale } from "@/locales";
import { transactionService } from "@/services/transaction.service";
import type {
  ActualTransaction,
  DashboardData,
  DashboardMode,
} from "@/types/models";
import { formatCurrencyString } from "@/utils/currency";
import { formatDate } from "@/utils/time";
import BalanceTrend from "@/components/charts/balance-trend-chart";
import ExpenseChart from "@/components/charts/expenses-chart";
import Table, { TableColumn } from "@/components/tables/table";
import { AmountCell } from "@/components/amount-cell";

const currentMonth = new Date().toISOString().slice(0, 7);
const currentYear = currentMonth.slice(0, 4);

export default function DashboardPage() {
  const { t, locale } = useI18n();
  const [mode, setMode] = useState<DashboardMode>("month");
  const [date, setDate] = useState(currentMonth);
  const [data, setData] = useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void transactionService
      .getDashboard(mode, date)
      .then(setData)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : t("common.error")),
      )
      .finally(() => setLoading(false));
  }, [date, mode, t]);

  const changeMode = (nextMode: DashboardMode) => {
    setMode(nextMode);
    setDate(nextMode === "year" ? currentYear : currentMonth);
  };

  const getButtonVariation = (
    mode: DashboardMode,
    target: DashboardMode,
  ): ButtonVariation => {
    return mode === target ? "primary" : "blank";
  };

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mt-2 text-3xl font-semibold text-base-content">
            {t("dashboard.title")}
          </h1>
          <p className="mt-2 text-sm text-base-content/65">
            {t("dashboard.description")}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-foreground/20 py-1 px-1">
          <Button
            onClick={() => changeMode("month")}
            variation={getButtonVariation(mode, "month")}
          >
            {t("dashboard.month")}
          </Button>
          <Button
            onClick={() => changeMode("year")}
            variation={getButtonVariation(mode, "year")}
          >
            {t("dashboard.year")}
          </Button>
          <input
            aria-label={
              mode === "month" ? t("dashboard.month") : t("dashboard.year")
            }
            type={mode === "month" ? "month" : "number"}
            min={mode === "year" ? "2000" : undefined}
            max={mode === "year" ? "2100" : undefined}
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="w-40 rounded-xl border border-foreground/20 px-2 py-1 text-sm"
          />
        </div>
      </header>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading && !data ? (
        <p className="text-sm text-base-content/65">{t("common.loading")}</p>
      ) : null}

      {data ? (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <SummaryCard
              label={t("dashboard.balance")}
              value={data.summary.total_balance}
              icon={<BanknotesIcon className="h-5 w-5" />}
              accent="text-primary"
              className="bg-primary-20 border border-success"
            />
            <SummaryCard
              label={t("dashboard.income")}
              value={data.summary.total_income}
              icon={<ArrowTrendingUpIcon className="h-5 w-5" />}
              accent="text-secondary"
              className="bg-secondary/20 border border-secondary"
            />
            <SummaryCard
              label={t("dashboard.expenses")}
              value={data.summary.total_expenses}
              icon={<ArrowTrendingDownIcon className="h-5 w-5" />}
              accent="text-destructive"
              className="bg-destructive/20 border border-destructive"
            />
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.65fr_1fr]">
            <article className="rounded-2xl border border-foreground/10 bg-background p-5">
              <div className="mb-2">
                <h2 className="text-lg font-semibold">
                  {t("dashboard.balanceTrend")}
                </h2>
                <p className="text-sm text-base-content/60">
                  {formatDate(data.start_date, locale)} to{" "}
                  {formatDate(data.end_date, locale)}
                </p>
              </div>
              <BalanceTrend trends={data.trend} />
            </article>
            <article className="rounded-2xl border border-foreground/10 bg-background p-5">
              <h2 className="mb-2 text-lg font-semibold">
                {t("dashboard.expenseBreakdown")}
              </h2>
              <ExpenseChart expenses={data.expenses} />
            </article>
          </section>

          <section className="overflow-hidden rounded-2xl border border-foreground/10 bg-background">
            <div className="flex flex-col gap-3 border-b border-foreground/10 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  {t("dashboard.recentTransactions")}
                </h2>
                <p className="text-sm text-base-content/60">
                  {data.total_transactions}{" "}
                  {t("dashboard.transactionsInPeriod")}
                </p>
              </div>
              <Link href="/transactions">
                <Button variation="neutral">
                  {t("dashboard.viewAll")}{" "}
                  <ArrowRightIcon className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <Table
              columns={buildRecentTransactionsColumns(t, locale)}
              data={data.recent_transactions}
              size="sm"
              zebra
              getRowKey={(row) => row.id}
              emptyState={t("transactions.empty")}
            />
          </section>
        </>
      ) : null}
    </div>
  );
}

function buildRecentTransactionsColumns(
  t: TranslateFunction,
  locale: Locale,
): TableColumn<ActualTransaction>[] {
  return [
    {
      key: "title",
      header: t("transactions.table.title"),
      className: "font-medium",
      render: (row) => row.title,
    },
    {
      key: "amount",
      header: t("transactions.table.amount"),
      render: (row) => <AmountCell amount={row.amount} type={row.type} />,
    },
    {
      key: "paid_at",
      header: t("dashboard.date"),
      className: "text-base-content/65",
      render: (row) => formatDate(row.paid_at, locale),
    },
  ];
}

function SummaryCard({
  label,
  value,
  icon,
  accent,
  className,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
  className?: string;
}) {
  return (
    <article
      className={`rounded-2xl border border-foreground/10 bg-background p-5 ${className}`}
    >
      <div className="flex gap-2 items-center mb-6">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl bg-background ${accent}`}
        >
          {icon}
        </div>
        <p className={`text-sm ${accent}`}>{label}</p>
      </div>
      <p className={`mt-1 text-2xl font-semibold text-right ${accent}`}>
        {formatCurrencyString(value)}
      </p>
    </article>
  );
}
