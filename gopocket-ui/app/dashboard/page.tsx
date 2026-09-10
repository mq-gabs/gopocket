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
import { useI18n } from "@/contexts/i18n-context";
import { transactionService } from "@/services/transaction.service";
import type { DashboardData, DashboardMode } from "@/types/models";
import { formatCurrencyString } from "@/utils/currency";
import TransactionIcon from "@/components/transaction-icon";
import { formatDate } from "@/utils/time";
import BalanceTrend from "@/components/charts/balance-trend-chart";
import ExpenseChart from "@/components/charts/expenses-chart";

const currentMonth = new Date().toISOString().slice(0, 7);
const currentYear = currentMonth.slice(0, 4);

export default function DashboardPage() {
  const { t, locale } = useI18n();
  const [mode, setMode] = useState<DashboardMode>("month");
  const [date, setDate] = useState(currentMonth);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void transactionService
      .getDashboard(mode, date, page)
      .then(setData)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : t("common.error")),
      )
      .finally(() => setLoading(false));
  }, [date, mode, page, t]);

  const changeMode = (nextMode: DashboardMode) => {
    setMode(nextMode);
    setDate(nextMode === "year" ? currentYear : currentMonth);
    setPage(1);
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
        <div className="flex items-center gap-2 rounded-xl border border-foreground/20 py-1 px-1">
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
            onChange={(event) => {
              setDate(event.target.value);
              setPage(1);
            }}
            className="w-40 rounded-lg border border-foreground/20 px-2 py-1 text-sm"
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
            <article className="rounded-2xl border border-base-300 bg-base-100 p-5">
              <div className="mb-2">
                <h2 className="text-lg font-semibold">
                  {t("dashboard.balanceTrend")}
                </h2>
                <p className="text-sm text-base-content/60">
                  {data.start_date} to {data.end_date}
                </p>
              </div>
              <BalanceTrend trends={data.trend} />
            </article>
            <article className="rounded-2xl border border-base-300 bg-base-100 p-5">
              <h2 className="mb-2 text-lg font-semibold">
                {t("dashboard.expenseBreakdown")}
              </h2>
              <ExpenseChart expenses={data.expenses} />
            </article>
          </section>

          <section className="overflow-hidden rounded-2xl border border-base-300 bg-base-100">
            <div className="flex flex-col gap-3 border-b border-base-300 p-5 sm:flex-row sm:items-center sm:justify-between">
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
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>{t("transactions.table.title")}</th>
                    <th>{t("transactions.table.type")}</th>
                    <th>{t("transactions.table.amount")}</th>
                    <th>{t("dashboard.date")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="font-medium">{transaction.title}</td>
                      <td>
                        <TransactionIcon type={transaction.type} />
                      </td>
                      <td className="font-medium">
                        {formatCurrencyString(transaction.amount)}
                      </td>
                      <td className="text-base-content/65">
                        {formatDate(transaction.transaction_date, locale)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-base-300 px-5 py-3 text-sm">
              <span>
                {t("dashboard.page")} {data.page} / {data.total_pages}
              </span>
              <div className="join">
                <button
                  className="btn btn-sm join-item"
                  disabled={data.page <= 1}
                  onClick={() => setPage((value) => value - 1)}
                >
                  ‹
                </button>
                <button
                  className="btn btn-sm join-item"
                  disabled={data.page >= data.total_pages}
                  onClick={() => setPage((value) => value + 1)}
                >
                  ›
                </button>
              </div>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
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
      className={`rounded-2xl border border-base-300 bg-base-100 p-5 ${className}`}
    >
      <div
        className={`mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-background ${accent}`}
      >
        {icon}
      </div>
      <p className="text-sm text-base-content/65">{label}</p>
      <p className="mt-1 text-2xl font-semibold">
        {formatCurrencyString(value)}
      </p>
    </article>
  );
}
